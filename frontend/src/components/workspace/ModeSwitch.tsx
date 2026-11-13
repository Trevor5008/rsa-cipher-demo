import type { Mode } from "../../types/teaching";
import { modeTheme } from "./styles";

const MODES: { value: Mode; label: string }[] = [
  { value: "encrypt", label: "Encrypt" },
  { value: "decrypt", label: "Decrypt" },
];

interface ModeSwitchProps {
  mode: Mode;
  onChange: (mode: Mode) => void;
}

/** Segmented control built on native radios, so arrow keys and the checked state work for every input method. */
export default function ModeSwitch({ mode, onChange }: ModeSwitchProps) {
  return (
    <fieldset>
      <legend className="sr-only">Mode</legend>
      <div className="inline-flex rounded-xl border border-gray-200 bg-gray-100 p-1">
        {MODES.map(({ value, label }) => {
          const selected = value === mode;
          return (
            <label
              key={value}
              className={`relative cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-indigo-600 sm:px-6 ${
                selected ? `${modeTheme[value].solid} shadow-sm` : "text-gray-700 hover:bg-white"
              }`}
            >
              <input
                type="radio"
                name="mode"
                value={value}
                checked={selected}
                onChange={() => onChange(value)}
                className="sr-only"
              />
              {label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
