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

/** Characters are counted per Unicode code point, matching how teaching mode encrypts them. */
const describeCount = (mode: Mode, value: string) =>
  mode === "encrypt"
    ? plural(Array.from(value).length, "character")
    : plural(value.split(/\s+/).filter(Boolean).length, "number");

interface MessagePanelProps {
  mode: Mode;
  value: string;
  keyReady: boolean;
  onChange: (value: string) => void;
  onClear: () => void;
}

export default function MessagePanel({ mode, value, keyReady, onChange, onClear }: MessagePanelProps) {
  const copy = COPY[mode];
  const inputId = `message-input-${mode}`;
  const blockedId = `${inputId}-blocked`;

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
          aria-describedby={keyReady ? undefined : blockedId}
          className={`min-h-48 w-full flex-1 resize-y rounded-lg border border-gray-300 p-3 text-sm ${focusRing} ${
            mode === "decrypt" ? "break-all font-mono" : ""
          }`}
        />
        {!keyReady && (
          <p id={blockedId} className="text-sm text-amber-800">
            {copy.blocked}
          </p>
        )}
      </div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-gray-600" aria-live="polite">
          {describeCount(mode, value)}
        </p>
        <button type="button" onClick={onClear} className={secondaryButton}>
          Clear
        </button>
      </div>
    </StepCard>
  );
}
