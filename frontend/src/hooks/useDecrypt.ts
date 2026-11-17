import { useCallback, useEffect, useRef, useState } from "react";
import { TeachingValidationFailure, type TeachingAPI } from "../services/teachingAPI";
import type { TeachingDecryptResponse } from "../types/teaching";
import { LIVE_REQUEST_DELAY_MS } from "./useEncrypt";

export const DECRYPT_ERROR_MESSAGE =
  "We couldn't decrypt this ciphertext right now. Check that the backend is running, then try again.";

export type DecryptStatus = "idle" | "empty" | "loading" | "ready" | "invalid" | "error";

interface DecryptState {
  status: DecryptStatus;
  result: TeachingDecryptResponse | null;
  error: string | null;
}

interface UseDecryptArgs {
  api: TeachingAPI;
  /** True when Decrypt mode is active and a valid key pair is available. */
  enabled: boolean;
  ciphertext: string;
  d: string | null;
  n: string | null;
}

const EMPTY_STATE: DecryptState = { status: "empty", result: null, error: null };
const IDLE_STATE: DecryptState = { status: "idle", result: null, error: null };

const isBlank = (value: string) => value.trim() === "";

/**
 * Live teaching-mode decryption: debounced POST /teaching/decrypt with the
 * same stale-response protection as useEncrypt. Empty or whitespace-only
 * ciphertext never hits the API. Inputs are never cleared by this hook.
 */
export function useDecrypt({ api, enabled, ciphertext, d, n }: UseDecryptArgs) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<DecryptState>(
    enabled ? (isBlank(ciphertext) ? EMPTY_STATE : { status: "loading", result: null, error: null }) : IDLE_STATE,
  );

  const delayRef = useRef(0);
  const previousEnabledRef = useRef(enabled);
  const previousKeyRef = useRef(`${d}|${n}`);
  const previousCiphertextRef = useRef(ciphertext);
  const latestRequestRef = useRef(0);

  useEffect(() => {
    const keyChanged = previousKeyRef.current !== `${d}|${n}`;
    const ciphertextChanged = previousCiphertextRef.current !== ciphertext;
    const justEnabled = enabled && !previousEnabledRef.current;

    previousEnabledRef.current = enabled;
    previousKeyRef.current = `${d}|${n}`;
    previousCiphertextRef.current = ciphertext;

    if (!enabled || d === null || n === null) {
      latestRequestRef.current += 1;
      setState(IDLE_STATE);
      return;
    }

    if (isBlank(ciphertext)) {
      latestRequestRef.current += 1;
      setState(EMPTY_STATE);
      return;
    }

    if (justEnabled || keyChanged) {
      delayRef.current = 0;
    } else if (ciphertextChanged) {
      delayRef.current = LIVE_REQUEST_DELAY_MS;
    }

    const requestId = ++latestRequestRef.current;
    const controller = new AbortController();
    const isStale = () => controller.signal.aborted || requestId !== latestRequestRef.current;

    setState({ status: "loading", result: null, error: null });

    const timer = setTimeout(async () => {
      try {
        const result = await api.decrypt(ciphertext, d, n, controller.signal);
        if (isStale()) return;
        setState({ status: "ready", result, error: null });
      } catch (error) {
        if (isStale()) return;
        if (error instanceof TeachingValidationFailure) {
          const ciphertextError = error.errors.find((item) => item.field === "ciphertext");
          if (ciphertextError) {
            setState({ status: "invalid", result: null, error: ciphertextError.message });
            return;
          }
        }
        setState({ status: "error", result: null, error: DECRYPT_ERROR_MESSAGE });
      }
    }, delayRef.current);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [api, enabled, ciphertext, d, n, attempt]);

  const retry = useCallback(() => {
    delayRef.current = 0;
    setAttempt((current) => current + 1);
    setState({ status: "loading", result: null, error: null });
  }, []);

  return {
    ...state,
    retry,
  };
}

export type DecryptStateResult = ReturnType<typeof useDecrypt>;
