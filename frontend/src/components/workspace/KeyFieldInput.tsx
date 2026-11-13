import type { KeyField } from "../../types/teaching";
import { focusRing } from "./styles";

interface KeyFieldInputProps {
  field: KeyField;
  label: string;
  value: string;
  error?: string;
  errorId: string;
  onChange: (field: KeyField, value: string) => void;
}

export default function KeyFieldInput({ field, label, value, error, errorId, onChange }: KeyFieldInputProps) {
  const inputId = `key-field-${field}`;

  return (
    <div className="min-w-0">
      <label htmlFor={inputId} className="mb-1 block text-sm font-semibold text-gray-800">
        {label}
      </label>
      <input
        id={inputId}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        spellCheck={false}
        value={value}
        onChange={(event) => onChange(field, event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-lg border bg-white px-2 py-2 font-mono text-sm ${focusRing} ${
          error ? "border-red-600 bg-red-50" : "border-gray-300"
        }`}
      />
    </div>
  );
}
