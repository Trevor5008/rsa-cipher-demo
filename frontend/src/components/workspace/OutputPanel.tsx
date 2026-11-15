import { useId, useState } from "react";
import { FIXTURE_DECRYPT } from "../../fixtures/teaching";
import type { EncryptStatus } from "../../hooks/useEncrypt";
import type { Mode, TeachingEncryptResponse } from "../../types/teaching";
import StepCard from "./StepCard";
import { focusRing, modeTheme, secondaryButton } from "./styles";

interface OutputPanelProps {
  mode: Mode;
  keyReady: boolean;
  encryptStatus?: EncryptStatus;
  encryptResult?: TeachingEncryptResponse | null;
  encryptError?: string | null;
  onRetryEncrypt?: () => void;
  onDecryptThis?: () => void;
}

export default function OutputPanel({
  mode,
  keyReady,
  encryptStatus = "idle",
  encryptResult = null,
  encryptError = null,
  onRetryEncrypt,
  onDecryptThis,
}: OutputPanelProps) {
  if (mode === "decrypt") {
    return <DecryptSampleOutput keyReady={keyReady} />;
  }

  return (
    <EncryptOutput
      keyReady={keyReady}
      status={encryptStatus}
      result={encryptResult}
      error={encryptError}
      onRetry={onRetryEncrypt}
      onDecryptThis={onDecryptThis}
    />
  );
}

function DecryptSampleOutput({ keyReady }: { keyReady: boolean }) {
  const theme = modeTheme.decrypt;

  return (
    <StepCard
      step={3}
      title="Recovered message"
      description="If the private key matches, your original text comes back"
    >
      <div className="flex min-h-0 flex-1 flex-col gap-2">
        {keyReady ? (
          <>
            <p className="text-xs font-medium text-gray-600">
              <span className="mr-2 rounded-full bg-gray-200 px-2 py-0.5 font-semibold text-gray-800">Sample</span>
              Example for the message “test” with the Bigger primes key. Live decryption is coming soon.
            </p>
            <div
              role="region"
              aria-label="Recovered message output"
              tabIndex={0}
              className={`min-h-48 flex-1 overflow-auto whitespace-pre-wrap break-all rounded-lg border p-3 text-sm ${theme.tint} ${theme.border} ${focusRing}`}
            >
              {FIXTURE_DECRYPT.message}
            </div>
          </>
        ) : (
          <WaitingRegion label="Recovered message output" />
        )}
      </div>
    </StepCard>
  );
}

interface EncryptOutputProps {
  keyReady: boolean;
  status: EncryptStatus;
  result: TeachingEncryptResponse | null;
  error: string | null;
  onRetry?: () => void;
  onDecryptThis?: () => void;
}

function EncryptOutput({ keyReady, status, result, error, onRetry, onDecryptThis }: EncryptOutputProps) {
  const theme = modeTheme.encrypt;
  const [copyStatus, setCopyStatus] = useState("");
  const copyStatusId = useId();
  const ready = status === "ready" && result !== null;

  const handleCopy = async () => {
    if (!result) return;
    try {
      const clipboard = navigator.clipboard;
      if (!clipboard?.writeText) {
        throw new Error("Clipboard unavailable");
      }
      await clipboard.writeText(result.display);
      setCopyStatus("Ciphertext copied");
      window.setTimeout(() => setCopyStatus(""), 2000);
    } catch {
      setCopyStatus("Couldn't copy ciphertext");
      window.setTimeout(() => setCopyStatus(""), 2000);
    }
  };

  return (
    <StepCard
      step={3}
      title="Ciphertext"
      description="One number per character, calculated with the public key"
    >
      <div className="flex min-h-0 flex-1 flex-col gap-2">
        {!keyReady || status === "idle" ? (
          <WaitingRegion label="Ciphertext output" />
        ) : status === "empty" ? (
          <div
            role="region"
            aria-label="Ciphertext output"
            className="flex min-h-48 flex-1 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3 text-center text-sm text-gray-600"
          >
            Type a message to see each character encrypted.
          </div>
        ) : status === "loading" ? (
          <div
            role="region"
            aria-label="Ciphertext output"
            aria-busy="true"
            className={`flex min-h-48 flex-1 items-center justify-center rounded-lg border p-3 text-sm text-gray-600 ${theme.tint} ${theme.border}`}
          >
            Encrypting…
          </div>
        ) : status === "invalid" || status === "error" ? (
          <div role="alert" className="flex min-h-48 flex-1 flex-col justify-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <p>{error}</p>
            {status === "error" && onRetry && (
              <button type="button" onClick={onRetry} className={`self-start ${secondaryButton}`}>
                Try again
              </button>
            )}
          </div>
        ) : (
          <div
            role="region"
            aria-label="Ciphertext output"
            tabIndex={0}
            className={`min-h-48 flex-1 overflow-auto whitespace-pre-wrap break-all rounded-lg border p-3 font-mono text-sm ${theme.tint} ${theme.border} ${focusRing}`}
          >
            {result?.display}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p id={copyStatusId} role="status" aria-live="polite" className="text-sm text-gray-600">
          {copyStatus}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!ready}
            aria-describedby={copyStatusId}
            className={`${secondaryButton} disabled:cursor-not-allowed disabled:opacity-50`}
          >
            Copy
          </button>
          <button
            type="button"
            onClick={onDecryptThis}
            disabled={!ready}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${modeTheme.decrypt.solid} ${focusRing} disabled:cursor-not-allowed disabled:opacity-50`}
          >
            Decrypt this →
          </button>
        </div>
      </div>
    </StepCard>
  );
}

function WaitingRegion({ label }: { label: string }) {
  return (
    <div
      role="region"
      aria-label={label}
      className="flex min-h-48 flex-1 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3 text-center text-sm text-gray-600"
    >
      Waiting for a valid key pair.
    </div>
  );
}
