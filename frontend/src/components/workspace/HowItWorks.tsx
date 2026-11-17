import type { DecryptStatus } from "../../hooks/useDecrypt";
import type { EncryptStatus } from "../../hooks/useEncrypt";
import type {
  Mode,
  TeachingDecryptResponse,
  TeachingEncryptResponse,
  TeachingKey,
} from "../../types/teaching";
import ConceptStep from "./ConceptStep";
import TeachingModeNotice from "./TeachingModeNotice";
import TraceTable from "./TraceTable";
import WorkedExample from "./WorkedExample";

const STEPS: Record<Mode, { title: string; description: string }[]> = {
  encrypt: [
    { title: "Text → numbers", description: "Each character becomes its Unicode code point, m. “T” is 84." },
    { title: "Raise to the power e", description: "Multiply m by itself e times, using the public key." },
    {
      title: "Wrap around n",
      description: "Keep only the remainder after dividing by n. That remainder is the ciphertext, c.",
    },
  ],
  decrypt: [
    { title: "Read the numbers", description: "Each number c in the ciphertext stands for one character." },
    { title: "Raise to the power d", description: "Use the private exponent d. Only the key owner knows it." },
    {
      title: "Wrap around n → text",
      description: "The remainder mod n is the original code point m. Turn it back into a character.",
    },
  ],
};

interface HowItWorksProps {
  mode: Mode;
  keyPair?: TeachingKey | null;
  encryptStatus?: EncryptStatus;
  encryptResult?: TeachingEncryptResponse | null;
  decryptStatus?: DecryptStatus;
  decryptResult?: TeachingDecryptResponse | null;
}

export default function HowItWorks({
  mode,
  keyPair = null,
  encryptStatus = "idle",
  encryptResult = null,
  decryptStatus = "idle",
  decryptResult = null,
}: HowItWorksProps) {
  const subtitle =
    mode === "encrypt"
      ? encryptStatus === "ready" && encryptResult
        ? "Updates live as you type"
        : "Type a message with a valid key to see every character encrypted"
      : decryptStatus === "ready" && decryptResult
        ? "Updates live as you paste"
        : "Paste ciphertext with a valid key to recover each character";

  return (
    <section
      aria-labelledby="how-it-works-title"
      className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="how-it-works-title" className="text-lg font-semibold">
          How it works
        </h2>
        <p className="text-xs text-gray-600">{subtitle}</p>
      </div>

      <ol className="grid gap-3 md:grid-cols-3">
        {STEPS[mode].map((step, index) => (
          <ConceptStep key={step.title} step={index + 1} {...step} />
        ))}
      </ol>

      {mode === "encrypt" ? (
        <EncryptExplanation status={encryptStatus} result={encryptResult} keyPair={keyPair} />
      ) : (
        <DecryptExplanation status={decryptStatus} result={decryptResult} keyPair={keyPair} />
      )}

      <TeachingModeNotice />
    </section>
  );
}

function EncryptExplanation({
  status,
  result,
  keyPair,
}: {
  status: EncryptStatus;
  result: TeachingEncryptResponse | null;
  keyPair: TeachingKey | null;
}) {
  if (status === "ready" && result && keyPair && result.trace.length > 0) {
    return (
      <>
        <WorkedExample mode="encrypt" row={result.trace[0]} keyPair={keyPair} />
        <TraceTable mode="encrypt" rows={result.trace} caption="Encryption of each character" />
      </>
    );
  }

  if (status === "loading") {
    return (
      <p role="status" className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
        Calculating the worked example and table…
      </p>
    );
  }

  if (status === "invalid" || status === "error") {
    return (
      <p className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
        Fix the message or try again to see the worked example and table.
      </p>
    );
  }

  return (
    <p className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
      {status === "empty"
        ? "The worked example and table appear here once you type a message."
        : "Build a valid key pair and type a message to see each character encrypted."}
    </p>
  );
}

function DecryptExplanation({
  status,
  result,
  keyPair,
}: {
  status: DecryptStatus;
  result: TeachingDecryptResponse | null;
  keyPair: TeachingKey | null;
}) {
  if (status === "ready" && result && keyPair && result.trace.length > 0) {
    return (
      <>
        <WorkedExample mode="decrypt" row={result.trace[0]} keyPair={keyPair} />
        <TraceTable mode="decrypt" rows={result.trace} caption="Decryption of each value" />
      </>
    );
  }

  if (status === "loading") {
    return (
      <p role="status" className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
        Calculating the worked example and table…
      </p>
    );
  }

  if (status === "invalid" || status === "error") {
    return (
      <p className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
        Fix the ciphertext or try again to see the worked example and table.
      </p>
    );
  }

  return (
    <p className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
      {status === "empty"
        ? "The worked example and table appear here once you paste ciphertext."
        : "Build a valid key pair and paste ciphertext to recover each character."}
    </p>
  );
}
