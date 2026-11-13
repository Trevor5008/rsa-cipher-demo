import type { KeyStatus } from "../../hooks/useKeyPair";
import type { TeachingKey } from "../../types/teaching";

interface DerivedValuesProps {
  status: KeyStatus;
  keyPair: TeachingKey | null;
}

const ROWS: { term: string; value: (key: TeachingKey) => string }[] = [
  { term: "n = p × q", value: (key) => key.n },
  { term: "φ(n) = (p−1)(q−1)", value: (key) => key.phi },
  { term: "d = e⁻¹ mod φ(n)", value: (key) => key.d },
];

export default function DerivedValues({ status, keyPair }: DerivedValuesProps) {
  const placeholder = status === "loading" ? "Calculating…" : "—";

  return (
    <dl aria-busy={status === "loading"} className="divide-y divide-dashed divide-gray-200 text-sm">
      {ROWS.map(({ term, value }) => (
        <div key={term} className="flex items-baseline justify-between gap-3 py-2">
          <dt className="shrink-0 text-gray-600">{term}</dt>
          <dd className="min-w-0 break-all text-right font-mono font-semibold">
            {keyPair ? value(keyPair) : <span className="font-normal text-gray-500">{placeholder}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
