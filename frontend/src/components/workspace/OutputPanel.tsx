import { FIXTURE_DECRYPT, FIXTURE_ENCRYPT } from "../../fixtures/teaching";
import type { Mode } from "../../types/teaching";
import StepCard from "./StepCard";
import { focusRing, modeTheme } from "./styles";

const COPY: Record<Mode, { title: string; description: string; region: string; sample: string }> = {
  encrypt: {
    title: "Ciphertext",
    description: "One number per character, calculated with the public key",
    region: "Ciphertext output",
    sample: FIXTURE_ENCRYPT.display,
  },
  decrypt: {
    title: "Recovered message",
    description: "If the private key matches, your original text comes back",
    region: "Recovered message output",
    sample: FIXTURE_DECRYPT.message,
  },
};

interface OutputPanelProps {
  mode: Mode;
  keyReady: boolean;
}

/** Renders the shared fixture until live teaching-mode encryption and decryption are connected. */
export default function OutputPanel({ mode, keyReady }: OutputPanelProps) {
  const copy = COPY[mode];
  const theme = modeTheme[mode];

  return (
    <StepCard step={3} title={copy.title} description={copy.description}>
      <div className="flex min-h-0 flex-1 flex-col gap-2">
        {keyReady ? (
          <>
            <p className="text-xs font-medium text-gray-600">
              <span className="mr-2 rounded-full bg-gray-200 px-2 py-0.5 font-semibold text-gray-800">Sample</span>
              Example for the message “test” with the Bigger primes key. Live results are coming soon.
            </p>
            <div
              role="region"
              aria-label={copy.region}
              tabIndex={0}
              className={`min-h-48 flex-1 overflow-auto whitespace-pre-wrap break-all rounded-lg border p-3 text-sm ${
                mode === "encrypt" ? "font-mono" : ""
              } ${theme.tint} ${theme.border} ${focusRing}`}
            >
              {copy.sample}
            </div>
          </>
        ) : (
          <div
            role="region"
            aria-label={copy.region}
            className="flex min-h-48 flex-1 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3 text-center text-sm text-gray-600"
          >
            Waiting for a valid key pair.
          </div>
        )}
      </div>
    </StepCard>
  );
}
