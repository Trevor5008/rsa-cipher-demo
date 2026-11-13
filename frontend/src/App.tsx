import { useMemo, useState } from "react";
import AppHeader from "./components/workspace/AppHeader";
import HowItWorks from "./components/workspace/HowItWorks";
import KeyPairPanel from "./components/workspace/KeyPairPanel";
import MessagePanel from "./components/workspace/MessagePanel";
import OutputPanel from "./components/workspace/OutputPanel";
import { FIXTURE_DECRYPT, FIXTURE_ENCRYPT } from "./fixtures/teaching";
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
  const setInput = (value: string) => setInputs((current) => ({ ...current, [mode]: value }));

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
            onChange={setInput}
            onClear={() => setInput("")}
          />
          <OutputPanel mode={mode} keyReady={keyReady} />
        </div>
        <HowItWorks mode={mode} />
      </main>
    </div>
  );
}

export default App;
