import { useId } from "react";
import type { Mode } from "../../types/teaching";
import { modeTheme } from "./styles";

interface KeyCardProps {
  kind: Mode;
  title: string;
  exponentName: "e" | "d";
  exponent: string | null;
  modulus: string | null;
  purpose: string;
  inUse: boolean;
}

export default function KeyCard({ kind, title, exponentName, exponent, modulus, purpose, inUse }: KeyCardProps) {
  const titleId = useId();
  const theme = modeTheme[kind];

  return (
    <article
      aria-labelledby={titleId}
      className={`min-w-0 rounded-xl border p-3 ${inUse ? `${theme.border} ${theme.tint} border-2` : "border-gray-200 bg-white"}`}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 id={titleId} className={`text-sm font-semibold ${theme.text}`}>
          {title}
        </h3>
        {inUse && <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${theme.solid}`}>In use</span>}
      </div>
      <p className="mt-1 break-all font-mono text-sm">
        {exponent && modulus ? `(${exponentName} = ${exponent}, n = ${modulus})` : "Waiting for a valid key pair"}
      </p>
      <p className="mt-1 text-xs text-gray-600">{purpose}</p>
    </article>
  );
}
