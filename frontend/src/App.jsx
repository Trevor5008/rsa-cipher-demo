import { useRSAKeys } from "./hooks/useRSAKeys";
import { useTextProcessing } from "./hooks/useTextProcessing";
import { useModals } from "./hooks/useModals";
import { useUI } from "./hooks/useUI";
import createRSAService from "./services/rsaAPI";
import KeysModal from "./components/KeysModal";
import TextBox from "./components/TextBox";
import Key from "./components/Icons/Key";

function App() {
    // Initialize API service
    const apiBaseUrl = import.meta.env.PROD 
        ? import.meta.env.VITE_PROD_API_BASE_URL
        : import.meta.env.VITE_LOCAL_API_BASE_URL;

    const rsaAPI = createRSAService(apiBaseUrl);

    // Custom hooks for state management
    const rsaKeys = useRSAKeys();
    const textProcessing = useTextProcessing();
    const modals = useModals();
    const ui = useUI();

    // Generate primes function
    const generatePrimes = async () => {
        try {
            const { p, q, mod, d } = await rsaAPI.generatePrimes(
                rsaKeys.publicExp, 
                rsaKeys.pBits, 
                rsaKeys.qBits
            );

            if (p && q && mod && d) {
                rsaKeys.setP(p);
                rsaKeys.setQ(q);
                rsaKeys.setMod(mod);
                rsaKeys.setPrivateExp(d);
            }
        } catch (error) {
            console.error("Error generating primes:", error);
        }
    };

    // Submit keys function
    const handleKeysSubmit = async () => {
        try {
            modals.closeKeysModal();

            const { publicKey, privateKey } = await rsaAPI.submitKeys(
                rsaKeys.p, 
                rsaKeys.q, 
                rsaKeys.publicExp
            );

            rsaKeys.setMod(publicKey.n);
            rsaKeys.setPrivateExp(privateKey.d);
        } catch (error) {
            console.error("Error submitting keys:", error);
        }
    };


    // Handle text input changes
    const handleTextChange = (type, e) => {
        if (type === "encrypt") {
            textProcessing.setEncryptInput(e.target.value);
        } else if (type === "decrypt") {
            textProcessing.setDecryptInput(e.target.value);
        }
    };

    // Handle text submission (encrypt/decrypt)
    const handleTextSubmit = async (type) => {
        try {
            if (type === "encrypt") {
                const { encrypted_message } = await rsaAPI.encryptMessage(
                    textProcessing.encryptInput,
                    rsaKeys.publicExp,
                    rsaKeys.mod
                );
                textProcessing.setEncryptedResult(encrypted_message);
            } else if (type === "decrypt") {
                const { decrypted_message } = await rsaAPI.decryptMessage(
                    textProcessing.decryptInput,
                    rsaKeys.privateExp,
                    rsaKeys.mod
                );
                textProcessing.setDecryptedResult(decrypted_message);
            }
        } catch (error) {
            console.error("Error processing text:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
            {/* Header */}
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-center">🎓 RSA Learning Lab 🔐</h1>
                <p className="text-center text-gray-600 mt-2">
                    Interactive tool for understanding RSA encryption
                </p>
            </header>

            {/* Key Management Section */}
            <div className="flex items-center flex-col md:flex-row px-4 w-full md:w-3/4 mb-6 md:align-center md:justify-center p-4">
                {/* Enter Key Data Button */}
                <button
                    className="bg-orange-500 rounded-lg p-2 w-10/12 text-white mb-3 md:mb-0 md:w-1/2"
                    onClick={modals.openKeysModal}
                >
                    <span className="block md:hidden">Key Data</span>
                    <span className="hidden md:block">Enter Key Data</span>
               </button>

                {/* Key Status Display */}
                <div className="flex justify-evenly md:justify-center md:align-middle gap-10 md:gap-4 w-5/6 mb-3 md:mb-0 md:w-5/6 md:items-center">
                    <h3 className="text-md font-bold flex items-center">
                        Private &nbsp;{<Key hasKeys={rsaKeys.hasKeys} />}
                    </h3>
                    <h3 className="text-md font-bold flex items-center">
                        Public &nbsp;{<Key hasKeys={rsaKeys.hasKeys} />}
                    </h3>
                </div>
            </div>
            {/* Key Entry Modal */}
            {modals.showKeysModal && (
                <KeysModal
                    publicExp={rsaKeys.publicExp}
                    handlePublicExpChange={(e) => rsaKeys.setPublicExp(e.target.value)}
                    handlePChange={(e) => rsaKeys.setP(e.target.value)}
                    handleQChange={(e) => rsaKeys.setQ(e.target.value)}
                    p={rsaKeys.p}
                    pBits={rsaKeys.pBits}
                    handlePBitsChange={(e) => rsaKeys.setPBits(e.target.value)}
                    q={rsaKeys.q}
                    qBits={rsaKeys.qBits}
                    handleQBitsChange={(e) => rsaKeys.setQBits(e.target.value)}
                    handleKeysSubmit={handleKeysSubmit}
                    generatePrimes={generatePrimes}
                    clearPandQ={rsaKeys.clearPandQ}
                    closeKeysModal={modals.closeKeysModal}
                    apiBaseUrl={apiBaseUrl}
                />
            )}

            {/* Text Processing Section */}
            {ui.isMobile ? (
                <div className="max-w-3xl w-5/6 md:w-1/2 md:px-4 px-2 md:hidden">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">Encrypt Text</h3>
                        <TextBox
                            type="encrypt"
                            handleTextChange={handleTextChange}
                            handleTextSubmit={handleTextSubmit}
                            inputValue={textProcessing.encryptInput}
                            outputValue={textProcessing.encryptedOutput}
                            placeholder="Enter text to encrypt"
                            outputPlaceholder="Encrypted result"
                            onClear={textProcessing.clearText}
                            onCopy={ui.copyToClipboard}
                            copied={ui.copied}
                            hasKeys={rsaKeys.hasKeys}
                        />
                    </div>
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">Decrypt Text</h3>
                        <TextBox
                            type="decrypt"
                            handleTextChange={handleTextChange}
                            handleTextSubmit={handleTextSubmit}
                            inputValue={textProcessing.decryptInput}
                            outputValue={textProcessing.decryptedOutput}
                            placeholder="Enter encrypted number to decrypt"
                            outputPlaceholder="Decrypted result"
                            onClear={textProcessing.clearText}
                            onCopy={ui.copyToClipboard}
                            copied={ui.copied}
                            hasKeys={rsaKeys.hasKeys}
                        />
                    </div>
                </div>
            ) : (
                <div className="flex gap-4 items-start w-3/4 px-2">
                    <div className="w-1/2">
                        <h3 className="text-lg font-semibold mb-2">Encrypt Text</h3>
                        <TextBox
                            type="encrypt"
                            handleTextChange={handleTextChange}
                            handleTextSubmit={handleTextSubmit}
                            inputValue={textProcessing.encryptInput}
                            outputValue={textProcessing.encryptedOutput}
                            placeholder="Enter text to encrypt"
                            outputPlaceholder="Encrypted result"
                            onClear={textProcessing.clearText}
                            onCopy={() => ui.copyToClipboard(textProcessing.encryptedOutput, "encrypt")}
                            copied={ui.encryptCopied}
                            hasKeys={rsaKeys.hasKeys}
                        />
                    </div>
                    <div className="w-1/2">
                        <h3 className="text-lg font-semibold mb-2">Decrypt Text</h3>
                        <TextBox
                            type="decrypt"
                            handleTextChange={handleTextChange}
                            handleTextSubmit={handleTextSubmit}
                            inputValue={textProcessing.decryptInput}
                            outputValue={textProcessing.decryptedOutput}
                            placeholder="Enter encrypted number to decrypt"
                            outputPlaceholder="Decrypted result"
                            onClear={textProcessing.clearText}
                            onCopy={() => ui.copyToClipboard(textProcessing.decryptedOutput, "decrypt")}
                            copied={ui.decryptCopied}
                            hasKeys={rsaKeys.hasKeys}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export default App;
