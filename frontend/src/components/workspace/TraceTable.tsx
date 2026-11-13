import type { ReactNode } from "react";
import type { DecryptTraceRow, EncryptTraceRow } from "../../types/teaching";
import { focusRing } from "./styles";

type TraceTableProps =
  | { mode: "encrypt"; rows: EncryptTraceRow[]; caption: string }
  | { mode: "decrypt"; rows: DecryptTraceRow[]; caption: string };

const HEADERS: Record<TraceTableProps["mode"], ReactNode[]> = {
  encrypt: [
    "#",
    "Character",
    "Code m",
    <>
      c = m<sup>e</sup> mod n
    </>,
  ],
  decrypt: [
    "#",
    "Ciphertext c",
    <>
      m = c<sup>d</sup> mod n
    </>,
    "Character",
  ],
};

const cellsFor = (props: TraceTableProps): string[][] =>
  props.mode === "encrypt"
    ? props.rows.map((row) => [String(row.index), row.character, row.codePoint, row.ciphertext])
    : props.rows.map((row) => [String(row.index), row.ciphertext, row.codePoint, row.character]);

export default function TraceTable(props: TraceTableProps) {
  return (
    <div
      role="region"
      aria-label={props.caption}
      tabIndex={0}
      className={`overflow-x-auto rounded-xl border border-gray-200 ${focusRing}`}
    >
      <table className="w-full min-w-[28rem] text-left text-sm">
        <caption className="sr-only">{props.caption}</caption>
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            {HEADERS[props.mode].map((header, column) => (
              <th key={column} scope="col" className="px-4 py-2 font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {cellsFor(props).map((cells) => (
            <tr key={cells[0]}>
              {cells.map((cell, column) => (
                <td key={column} className={`break-all px-4 py-2 ${column === 0 ? "text-gray-500" : "font-mono"}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
