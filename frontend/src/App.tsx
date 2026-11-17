import { useMemo, useState } from "react";
import AppHeader from "./components/workspace/AppHeader";
import HowItWorks from "./components/workspace/HowItWorks";
import KeyPairPanel from "./components/workspace/KeyPairPanel";
import MessagePanel from "./components/workspace/MessagePanel";
import OutputPanel from "./components/workspace/OutputPanel";
import { FIXTURE_DECRYPT, FIXTURE_ENCRYPT } from "./fixtures/teaching";
import { useDecrypt } from "./hooks/useDecrypt";
import { useEncrypt } from "./hooks/useEncrypt";
import { useKeyPair } from "./hooks/useKeyPair";
import { createTeachingAPI, getApiBaseUrl, type TeachingAPI } from "./services/teachingAPI";
import type { Mode } from "./types/teaching";

interface AppProps {
  /** Injected in tests; defaults to the configured backend. */
  api?: TeachingAPI;
}

function App({ api }: AppProps) {
  const teachingAPI = useMemo(() => api ?? createTeachingAPI(getApiBaseUrl()), [api]);
  const keyPair = useKeyPair(teachingAPI);

  const [mode, setMode] = useState<Mode>("encrypt");
  const [inputs, setInputs] = useState<Record<Mode, string>>({
    encrypt: FIXTURE_DECRYPT.message,
    decrypt: FIXTURE_ENCRYPT.display,
  });

  const keyReady = keyPair.status === "valid";
  const encrypt = useEncrypt({
    api: teachingAPI,
    enabled: mode === "encrypt" && keyReady,
    text: inputs.encrypt,
    e: keyPair.key?.publicKey.e ?? null,
    n: keyPair.key?.publicKey.n ?? null,
  });
  const decrypt = useDecrypt({
    api: teachingAPI,
    enabled: mode === "decrypt" && keyReady,
    ciphertext: inputs.decrypt,
    d: keyPair.key?.privateKey.d ?? null,
    n: keyPair.key?.privateKey.n ?? null,
  });

  const setInput = (value: string) => setInputs((current) => ({ ...current, [mode]: value }));

  const handleDecryptThis = () => {
    if (!encrypt.result) return;
    setInputs((current) => ({ ...current, decrypt: encrypt.result!.display }));
    setMode("decrypt");
  };

  const handleEncryptAgain = () => {
    if (!decrypt.result) return;
    setInputs((current) => ({ ...current, encrypt: decrypt.result!.message }));
    setMode("encrypt");
  };

  const textError =
    mode === "encrypt" && encrypt.status === "invalid"
      ? encrypt.error
      : mode === "decrypt" && decrypt.status === "invalid"
        ? decrypt.error
        : null;

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <AppHeader mode={mode} onModeChange={setMode} />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          <KeyPairPanel keyPair={keyPair} mode={mode} />
          <MessagePanel
            mode={mode}
            value={inputs[mode]}
            keyReady={keyReady}
            validatedCount={
              mode === "decrypt" && decrypt.status === "ready" && decrypt.result
                ? decrypt.result.trace.length
                : null
            }
            textError={textError}
            onChange={setInput}
            onClear={() => setInput("")}
          />
          <OutputPanel
            mode={mode}
            keyReady={keyReady}
            encryptStatus={encrypt.status}
            encryptResult={encrypt.result}
            encryptError={encrypt.error}
            onRetryEncrypt={encrypt.retry}
            onDecryptThis={handleDecryptThis}
            decryptStatus={decrypt.status}
            decryptResult={decrypt.result}
            decryptError={decrypt.error}
            onRetryDecrypt={decrypt.retry}
            onEncryptAgain={handleEncryptAgain}
          />
        </div>
        <HowItWorks
          mode={mode}
          keyPair={keyPair.key}
          encryptStatus={encrypt.status}
          encryptResult={encrypt.result}
          decryptStatus={decrypt.status}
          decryptResult={decrypt.result}
        />
      </main>
    </div>
  );
}

export default App;
