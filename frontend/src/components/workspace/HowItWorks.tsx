import { FIXTURE_DECRYPT, FIXTURE_ENCRYPT, FIXTURE_KEY } from "../../fixtures/teaching";
import type { Mode } from "../../types/teaching";
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
}

export default function HowItWorks({ mode }: HowItWorksProps) {
  return (
    <section
      aria-labelledby="how-it-works-title"
      className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="how-it-works-title" className="text-lg font-semibold">
          How it works
        </h2>
        <p className="text-xs text-gray-600">Example: the message “test” with the Bigger primes key</p>
      </div>

      <ol className="grid gap-3 md:grid-cols-3">
        {STEPS[mode].map((step, index) => (
          <ConceptStep key={step.title} step={index + 1} {...step} />
        ))}
      </ol>

      {mode === "encrypt" ? (
        <>
          <WorkedExample mode="encrypt" row={FIXTURE_ENCRYPT.trace[0]} keyPair={FIXTURE_KEY} />
          <TraceTable mode="encrypt" rows={FIXTURE_ENCRYPT.trace} caption="Encryption of each character (sample)" />
        </>
      ) : (
        <>
          <WorkedExample mode="decrypt" row={FIXTURE_DECRYPT.trace[0]} keyPair={FIXTURE_KEY} />
          <TraceTable mode="decrypt" rows={FIXTURE_DECRYPT.trace} caption="Decryption of each value (sample)" />
        </>
      )}

      <TeachingModeNotice />
    </section>
  );
}
