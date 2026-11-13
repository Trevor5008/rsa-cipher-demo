import type { KeyPairState } from "../../hooks/useKeyPair";
import type { KeyField, Mode } from "../../types/teaching";
import DerivedValues from "./DerivedValues";
import KeyCard from "./KeyCard";
import KeyFieldInput from "./KeyFieldInput";
import PresetPicker from "./PresetPicker";
import StepCard from "./StepCard";
import { secondaryButton } from "./styles";

const FIELDS: { field: KeyField; label: string }[] = [
  { field: "p", label: "Prime p" },
  { field: "q", label: "Prime q" },
  { field: "e", label: "Exponent e" },
];

const STATUS_TEXT = {
  loading: "Calculating the key pair…",
  valid: "Key pair ready.",
  invalid: "Fix the highlighted values to build a key pair.",
  error: "",
} as const;

interface KeyPairPanelProps {
  keyPair: KeyPairState;
  mode: Mode;
}

export default function KeyPairPanel({ keyPair, mode }: KeyPairPanelProps) {
  const { fields, presetId, status, key, fieldErrors, requestError, selectPreset, updateField, retry } = keyPair;
  const errorId = (field: KeyField) => `key-field-${field}-error`;

  return (
    <StepCard step={1} title="Build a key pair">
      <PresetPicker selected={presetId} onSelect={selectPreset} />

      <div>
        <div className="grid grid-cols-3 gap-2">
          {FIELDS.map(({ field, label }) => (
            <KeyFieldInput
              key={field}
              field={field}
              label={label}
              value={fields[field]}
              error={fieldErrors[field]}
              errorId={errorId(field)}
              onChange={updateField}
            />
          ))}
        </div>
        {FIELDS.some(({ field }) => fieldErrors[field]) && (
          <ul className="mt-2 space-y-1 text-sm text-red-700">
            {FIELDS.filter(({ field }) => fieldErrors[field]).map(({ field }) => (
              <li key={field} id={errorId(field)}>
                {fieldErrors[field]}
              </li>
            ))}
          </ul>
        )}
      </div>

      <DerivedValues status={status} keyPair={key} />

      <p role="status" className="text-xs text-gray-600">
        {STATUS_TEXT[status]}
      </p>
      {status === "error" && requestError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <p>{requestError}</p>
          <button type="button" onClick={retry} className={`mt-2 ${secondaryButton}`}>
            Try again
          </button>
        </div>
      )}

      <div className="grid gap-3">
        <KeyCard
          kind="encrypt"
          title="Public key"
          exponentName="e"
          exponent={key?.publicKey.e ?? null}
          modulus={key?.publicKey.n ?? null}
          purpose="Share with anyone. Used to encrypt."
          inUse={mode === "encrypt"}
        />
        <KeyCard
          kind="decrypt"
          title="Private key"
          exponentName="d"
          exponent={key?.privateKey.d ?? null}
          modulus={key?.privateKey.n ?? null}
          purpose="Keep secret. Used to decrypt."
          inUse={mode === "decrypt"}
        />
      </div>
    </StepCard>
  );
}
