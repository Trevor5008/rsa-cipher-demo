import type { DecryptTraceRow, EncryptTraceRow, TeachingKey } from "../../types/teaching";

type WorkedExampleProps =
  | { mode: "encrypt"; row: EncryptTraceRow; keyPair: TeachingKey }
  | { mode: "decrypt"; row: DecryptTraceRow; keyPair: TeachingKey };

/** Expands the modular exponentiation for the first character or value. */
export default function WorkedExample(props: WorkedExampleProps) {
  const { keyPair } = props;

  return (
    <figure className="rounded-xl bg-gray-900 p-4 text-white">
      <figcaption className="text-xs text-gray-300">
        {props.mode === "encrypt"
          ? `Worked example: the first character, “${props.row.character}”`
          : `Worked example: the first value, “${props.row.ciphertext}”`}
      </figcaption>
      <p className="mt-2 overflow-x-auto break-all font-mono text-lg">
        {props.mode === "encrypt" ? (
          <>
            c = {props.row.codePoint}
            <sup>{keyPair.e}</sup> mod {keyPair.n} = <span className="text-indigo-300">{props.row.ciphertext}</span>
          </>
        ) : (
          <>
            m = {props.row.ciphertext}
            <sup>{keyPair.d}</sup> mod {keyPair.n} ={" "}
            <span className="text-orange-300">
              {props.row.codePoint} → {props.row.character}
            </span>
          </>
        )}
      </p>
    </figure>
  );
}
