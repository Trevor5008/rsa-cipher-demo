import { useCallback, useEffect, useRef, useState } from "react";
import { TeachingValidationFailure, type TeachingAPI } from "../services/teachingAPI";
import type { KeyField, KeyFields, PresetId, TeachingKey, TeachingValidationError } from "../types/teaching";

export type FixedPresetId = Exclude<PresetId, "custom">;

export const KEY_PRESETS: Record<FixedPresetId, { label: string; fields: KeyFields }> = {
  // phi(3233) = 3120, so the textbook key needs a small exponent; 65537 would be out of range.
  textbook: { label: "Textbook (61, 53)", fields: { p: "61", q: "53", e: "17" } },
  bigger: { label: "Bigger primes (1009, 1013)", fields: { p: "1009", q: "1013", e: "65537" } },
};

export const DERIVE_DELAY_MS = 300;

export const REQUEST_ERROR_MESSAGE =
  "We couldn't reach the key service, so n, φ(n), and d can't be calculated right now. Check that the backend is running, then try again.";

export type KeyStatus = "loading" | "valid" | "invalid" | "error";

export type KeyFieldErrors = Partial<Record<KeyField, string>>;

interface DerivationState {
  status: KeyStatus;
  key: TeachingKey | null;
  fieldErrors: KeyFieldErrors;
  requestError: string | null;
}

const KEY_FIELDS: readonly KeyField[] = ["p", "q", "e"];

const isKeyField = (field: string): field is KeyField => (KEY_FIELDS as readonly string[]).includes(field);

const toFieldErrors = (errors: TeachingValidationError[]): KeyFieldErrors => {
  const fieldErrors: KeyFieldErrors = {};
  for (const error of errors) {
    if (isKeyField(error.field) && !fieldErrors[error.field]) {
      fieldErrors[error.field] = error.message;
    }
  }
  return fieldErrors;
};

/**
 * Owns the learner's key pair: preset selection, editable p/q/e, and live
 * derivation of n, φ(n), and d through POST /teaching/keys.
 *
 * Requests are debounced while typing, and a response is applied only if it
 * belongs to the latest request, so an older slow response can never
 * overwrite the result for newer values.
 */
export function useKeyPair(api: TeachingAPI, initialPreset: FixedPresetId = "bigger") {
  const [fields, setFields] = useState<KeyFields>(KEY_PRESETS[initialPreset].fields);
  const [presetId, setPresetId] = useState<PresetId>(initialPreset);
  const [attempt, setAttempt] = useState(0);
  const [derivation, setDerivation] = useState<DerivationState>({
    status: "loading",
    key: null,
    fieldErrors: {},
    requestError: null,
  });

  const delayRef = useRef(0);
  const latestRequestRef = useRef(0);

  useEffect(() => {
    const requestId = ++latestRequestRef.current;
    const controller = new AbortController();
    const isStale = () => controller.signal.aborted || requestId !== latestRequestRef.current;

    const timer = setTimeout(async () => {
      try {
        const key = await api.deriveKey(fields, controller.signal);
        if (isStale()) return;
        setDerivation({ status: "valid", key, fieldErrors: {}, requestError: null });
      } catch (error) {
        if (isStale()) return;
        if (error instanceof TeachingValidationFailure) {
          const fieldErrors = toFieldErrors(error.errors);
          if (Object.keys(fieldErrors).length > 0) {
            setDerivation({ status: "invalid", key: null, fieldErrors, requestError: null });
            return;
          }
        }
        setDerivation({ status: "error", key: null, fieldErrors: {}, requestError: REQUEST_ERROR_MESSAGE });
      }
    }, delayRef.current);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [api, fields, attempt]);

  const selectPreset = useCallback((id: FixedPresetId) => {
    delayRef.current = 0;
    setFields(KEY_PRESETS[id].fields);
    setPresetId(id);
    setDerivation({ status: "loading", key: null, fieldErrors: {}, requestError: null });
  }, []);

  const updateField = useCallback((field: KeyField, value: string) => {
    delayRef.current = DERIVE_DELAY_MS;
    setFields((current) => ({ ...current, [field]: value }));
    setPresetId("custom");
    // Keep the previous inline messages until the new response replaces them,
    // but never show derived values that belong to the old inputs.
    setDerivation((current) => ({ ...current, status: "loading", key: null, requestError: null }));
  }, []);

  const retry = useCallback(() => {
    delayRef.current = 0;
    setAttempt((current) => current + 1);
    setDerivation({ status: "loading", key: null, fieldErrors: {}, requestError: null });
  }, []);

  return {
    fields,
    presetId,
    ...derivation,
    selectPreset,
    updateField,
    retry,
  };
}

export type KeyPairState = ReturnType<typeof useKeyPair>;
