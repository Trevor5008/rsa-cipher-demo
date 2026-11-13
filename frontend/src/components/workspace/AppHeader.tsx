import { KeyIcon } from "@heroicons/react/24/outline";
import type { Mode } from "../../types/teaching";
import ModeSwitch from "./ModeSwitch";
import { activeKeyLabel, modeTheme } from "./styles";

interface AppHeaderProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}

export default function AppHeader({ mode, onModeChange }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white">
            <KeyIcon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h1 className="text-lg font-bold leading-tight">RSA Learning Lab</h1>
            <p className="text-sm text-gray-600">See every step of public-key encryption, one character at a time.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <p className={`text-xs font-semibold md:hidden ${modeTheme[mode].text}`}>Using the {activeKeyLabel[mode]}</p>
          <ModeSwitch mode={mode} onChange={onModeChange} />
        </div>
      </div>
    </header>
  );
}
