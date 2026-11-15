import { useCallback, useEffect, useRef, useState } from "react";
import { TeachingValidationFailure, type TeachingAPI } from "../services/teachingAPI";
import type { TeachingEncryptResponse } from "../types/teaching";
import { DERIVE_DELAY_MS } from "./useKeyPair";

/** Same debounce as key derivation so typing feels consistent across the workspace. */
export const LIVE_REQUEST_DELAY_MS = DERIVE_DELAY_MS;

export const ENCRYPT_ERROR_MESSAGE =
  "We couldn't encrypt this message right now. Check that the backend is running, then try again.";

export type EncryptStatus = "idle" | "empty" | "loading" | "ready" | "invalid" | "error";

interface EncryptState {
  status: EncryptStatus;
  result: TeachingEncryptResponse | null;
  error: string | null;
}

interface UseEncryptArgs {
  api: TeachingAPI;
  /** True when Encrypt mode is active and a valid key pair is available. */
  enabled: boolean;
  text: string;
  e: string | null;
  n: string | null;
}

const EMPTY_STATE: EncryptState = { status: "empty", result: null, error: null };
const IDLE_STATE: EncryptState = { status: "idle", result: null, error: null };

/**
 * Live teaching-mode encryption: debounced POST /teaching/encrypt with the
 * same stale-response protection as useKeyPair. Empty plaintext never hits
 * the API. Text and key inputs are never cleared by this hook.
 */
export function useEncrypt({ api, enabled, text, e, n }: UseEncryptArgs) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<EncryptState>(enabled ? (text ? { status: "loading", result: null, error: null } : EMPTY_STATE) : IDLE_STATE);

  const delayRef = useRef(0);
  const previousEnabledRef = useRef(enabled);
  const previousKeyRef = useRef(`${e}|${n}`);
  const previousTextRef = useRef(text);
  const latestRequestRef = useRef(0);

  useEffect(() => {
    const keyChanged = previousKeyRef.current !== `${e}|${n}`;
    const textChanged = previousTextRef.current !== text;
    const justEnabled = enabled && !previousEnabledRef.current;

    previousEnabledRef.current = enabled;
    previousKeyRef.current = `${e}|${n}`;
    previousTextRef.current = text;

    if (!enabled || e === null || n === null) {
      latestRequestRef.current += 1;
      setState(IDLE_STATE);
      return;
    }

    if (!text) {
      latestRequestRef.current += 1;
      setState(EMPTY_STATE);
      return;
    }

    // Fire immediately when a key becomes valid with existing text, or when
    // the key changes; debounce only while the learner is typing.
    if (justEnabled || keyChanged) {
      delayRef.current = 0;
    } else if (textChanged) {
      delayRef.current = LIVE_REQUEST_DELAY_MS;
    }

    const requestId = ++latestRequestRef.current;
    const controller = new AbortController();
    const isStale = () => controller.signal.aborted || requestId !== latestRequestRef.current;

    setState({ status: "loading", result: null, error: null });

    const timer = setTimeout(async () => {
      try {
        const result = await api.encrypt(text, e, n, controller.signal);
        if (isStale()) return;
        setState({ status: "ready", result, error: null });
      } catch (error) {
        if (isStale()) return;
        if (error instanceof TeachingValidationFailure) {
          const textError = error.errors.find((item) => item.field === "text");
          if (textError) {
            setState({ status: "invalid", result: null, error: textError.message });
            return;
          }
        }
        setState({ status: "error", result: null, error: ENCRYPT_ERROR_MESSAGE });
      }
    }, delayRef.current);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [api, enabled, text, e, n, attempt]);

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

export type EncryptStateResult = ReturnType<typeof useEncrypt>;
