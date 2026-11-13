import { KEY_PRESETS, type FixedPresetId } from "../../hooks/useKeyPair";
import type { PresetId } from "../../types/teaching";
import { focusRing } from "./styles";

const PRESET_ORDER: FixedPresetId[] = ["textbook", "bigger"];

interface PresetPickerProps {
  selected: PresetId;
  onSelect: (id: FixedPresetId) => void;
}

export default function PresetPicker({ selected, onSelect }: PresetPickerProps) {
  return (
    <div role="group" aria-labelledby="key-presets-label" className="flex flex-wrap items-center gap-2">
      <span id="key-presets-label" className="text-sm text-gray-600">
        Presets:
      </span>
      {PRESET_ORDER.map((id) => {
        const pressed = selected === id;
        return (
          <button
            key={id}
            type="button"
            aria-pressed={pressed}
            onClick={() => onSelect(id)}
            className={`rounded-full border px-3 py-1 text-sm font-medium ${focusRing} ${
              pressed
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
            }`}
          >
            {KEY_PRESETS[id].label}
          </button>
        );
      })}
      {selected === "custom" && (
        <span className="rounded-full border border-dashed border-gray-400 px-3 py-1 text-sm font-medium text-gray-700">
          Custom values
        </span>
      )}
    </div>
  );
}
