import type { Mode } from "../../types/teaching";
import StepCard from "./StepCard";
import { focusRing, secondaryButton } from "./styles";

const COPY: Record<Mode, { title: string; label: string; placeholder: string; blocked: string }> = {
  encrypt: {
    title: "Write a message",
    label: "Plain text to encrypt with the public key",
    placeholder: "Type a message, for example: test",
    blocked: "Build a valid key pair in step 1 to encrypt this message.",
  },
  decrypt: {
    title: "Paste ciphertext",
    label: "Numbers separated by spaces, to decrypt with the private key",
    placeholder: "For example: 924799 621270 2637 924799",
    blocked: "Build a valid key pair in step 1 to decrypt these numbers.",
  },
};

const plural = (count: number, singular: string) => `${count} ${singular}${count === 1 ? "" : "s"}`;

interface MessagePanelProps {
  mode: Mode;
  value: string;
  keyReady: boolean;
  /** When Decrypt is ready, the validated token count from the API response (`trace.length`). */
  validatedCount?: number | null;
  textError?: string | null;
  onChange: (value: string) => void;
  onClear: () => void;
}

/**
 * Encrypt counts Unicode code points in the input.
 * Decrypt shows the validated response length when ready; otherwise labels raw
 * whitespace-separated tokens so invalid input is never presented as decrypted numbers.
 */
const describeCount = (mode: Mode, value: string, validatedCount: number | null) => {
  if (mode === "encrypt") {
    return plural(Array.from(value).length, "character");
  }

  if (validatedCount !== null) {
    return plural(validatedCount, "number");
  }

  const tokens = value.split(/\s+/).filter(Boolean).length;
  if (tokens === 0) {
    return "0 numbers";
  }

  return plural(tokens, "token");
};

export default function MessagePanel({
  mode,
  value,
  keyReady,
  validatedCount = null,
  textError = null,
  onChange,
  onClear,
}: MessagePanelProps) {
  const copy = COPY[mode];
  const inputId = `message-input-${mode}`;
  const blockedId = `${inputId}-blocked`;
  const errorId = `${inputId}-error`;
  const describedBy = [
    !keyReady ? blockedId : null,
    textError ? errorId : null,
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <StepCard step={2} title={copy.title}>
      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <label htmlFor={inputId} className="text-sm text-gray-600">
          {copy.label}
        </label>
        <textarea
          id={inputId}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={copy.placeholder}
          rows={10}
          spellCheck={mode === "encrypt"}
          aria-invalid={textError ? true : undefined}
          aria-describedby={describedBy}
          className={`min-h-48 w-full flex-1 resize-y rounded-lg border p-3 text-sm ${focusRing} ${
            mode === "decrypt" ? "break-all font-mono" : ""
          } ${textError ? "border-red-600 bg-red-50" : "border-gray-300"}`}
        />
        {!keyReady && (
          <p id={blockedId} className="text-sm text-amber-800">
            {copy.blocked}
          </p>
        )}
        {textError && (
          <p id={errorId} className="text-sm text-red-700">
            {textError}
          </p>
        )}
      </div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-gray-600" aria-live="polite">
          {describeCount(mode, value, validatedCount)}
        </p>
        <button type="button" onClick={onClear} className={secondaryButton}>
          Clear
        </button>
      </div>
    </StepCard>
  );
}
