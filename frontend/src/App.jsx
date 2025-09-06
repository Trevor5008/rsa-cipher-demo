import { useState, useEffect } from "react";
import KeysModal from "./components/KeysModal";
import TextModal from "./components/TextModal";
import Key from "./components/Icons/Key";
import axios from "axios";
import SingleOutput from "./components/SingleOutput";
import CombinedOutput from "./components/CombinedOutput";

function App() {
   // Determine which API base URL to use
   const apiBaseUrl = import.meta.env.PROD 
      ? import.meta.env.VITE_PROD_API_BASE_URL
      : import.meta.env.VITE_LOCAL_API_BASE_URL
      
   // Default public exponent = 65537
   const [publicExp, setPublicExp] = useState(65537);
   const [p, setP] = useState("");
   const [pBits, setPBits] = useState(512);
   const [q, setQ] = useState("");
   const [qBits, setQBits] = useState(512);
   // Modals
   const [showTextModal, setShowTextModal] = useState(false);
   const [textType, setTextType] = useState("");

   const [mod, setMod] = useState("");
   const [privateExp, setPrivateExp] = useState("");
   // // Flags for key presence
   // TODO: Address edge cases
   const [hasKeys, setHasKeys] = useState(false);
   // TODO: Flag for encryption readiness
   // Phrases to encrypt/decrypt
   const [encryptPhrase, setEncryptPhrase] = useState("");
   const [decryptPhrase, setDecryptPhrase] = useState("");
   // Encrypted/Decrypted text
   const [encryptedPhrase, setEncryptedPhrase] = useState("");
   const [decryptedPhrase, setDecryptedPhrase] = useState("");

   // Modals
   const [showKeysModal, setShowKeysModal] = useState(false);
   // Notifications
   const [copied, setCopied] = useState(false);
   // Screen size
   const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

   useEffect(() => {
      const handleResize = () => {
         setIsMobile(window.innerWidth < 768);
      };

      window.addEventListener("resize", handleResize);

      return () => window.removeEventListener("resize", handleResize);
   }, []);

   useEffect(() => {
      setHasKeys(privateExp && mod && p && q);
   }, [privateExp, mod, publicExp, p, q]);

   const openKeysModal = () => {
      setShowKeysModal(true);
   };

   // Public exponent change handler
   const handlePublicExpChange = (e) => {
      setPublicExp(e.target.value);
   };

   // P bits and value change handlers
   const handlePBitsChange = (e) => {
      setPBits(e.target.value);
   };

   const handlePChange = (e) => {
      setP(e.target.value);
   };

   // Q bits and value change handlers
   const handleQBitsChange = (e) => {
      setQBits(e.target.value);
   };

   const handleQChange = (e) => {
      setQ(e.target.value);
   };

   const handleTextChange = (e) => {
      textType === "encrypt"
         ? setEncryptPhrase(e.target.value)
         : setDecryptPhrase(e.target.value);
   };

   const closeKeysModal = () => {
      setShowKeysModal(false);
   };

   const openTextModal = (type) => {
      setTextType(type);
      setShowTextModal(true);
   };

   const closeTextModal = () => {
      setShowTextModal(false);
   };

   const clearPandQ = () => {
      setP("");
      setQ("");
   };

   // Paper clip icon click handler (copy to clipboard)
   const copyToClipboard = (text) => {
      navigator.clipboard.writeText(text).then(() => {
         setCopied(true);
         setTimeout(() => setCopied(false), 2000);
      });
   };

   // Clears the text input fields
   const handleTextReset = () => {
      if (textType === "encrypt") {
         setEncryptPhrase("");
         setEncryptedPhrase("");
      } else {
         setDecryptPhrase("");
         setDecryptedPhrase("");
      }
   };

   // Generates prime numbers based on public exp, p and q bits
   const generatePrimes = () => {
      axios
         // public exp, p and q bits are sent as string url params
         .get(`${apiBaseUrl}/generate-primes/${publicExp}/${pBits}/${qBits}`)
         .then((response) => {
            const { p, q, mod, d } = response.data;
            if (p && q && mod && d) {
               setP(p);
               setQ(q);
               setMod(mod);
               setPrivateExp(d);
            } else {
               console.log("Error generating primes - missing values");
            }
         })
         .catch((error) => {
            console.log(error);
         });
   };

   // Submits keys to the backend for processing
   const handleKeysSubmit = () => {
      // Close the modal
      closeKeysModal();
      // Sends the keys to the backend
      axios
         .post(
            `${apiBaseUrl}/submit-keys`,
            { p: p, q: q, publicExp: publicExp },
            { headers: { "Content-Type": "application/json" } }
         )
         .then((response) => {
            const { publicKey, privateKey } = response.data;
            setMod(publicKey.n);
            setPrivateExp(privateKey.d);
         })
         .then(() => {
            setHasKeys(true);
         })
         .catch((error) => {
            console.log(error);
         });
   };

   // Handles text submission for encryption/decryption
   const handleTextSubmit = () => {
      closeTextModal();
      const route = textType === "encrypt" ? "encrypt" : "decrypt";
      const payload =
         textType === "encrypt"
            ? { text: encryptPhrase, publicExp, mod }
            : { text: decryptPhrase, privateExp, mod };
      axios
         .post(`${apiBaseUrl}/${route}`, payload, {
            headers: { "Content-Type": "application/json" },
         })
         .then((response) => {
            if (textType === "encrypt") {
               const text = response.data["encrypted_message"];
               setEncryptedPhrase(text);
            } else {
               const text = response.data["decrypted_message"];
               setDecryptedPhrase(text);
            }
         })
         .catch((error) => {
            console.log(error);
         });
   };

   return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
         {/* Heading */}
         <header className="mb-6">
            <h1 className="text-3xl font-bold text-center">RSA Demo</h1>
         </header>
         {/* Key Data, Public, Private Key Data */}
         <div className="flex items-center flex-col md:flex-row px-4 w-full md:w-3/4 mb-6 md:align-center md:justify-center p-4">
            {/* "Enter Key Data" btn */}
            <button
               className="bg-orange-500 rounded-lg p-2 w-10/12 text-white mb-3 md:mb-0 md:w-1/2"
               onClick={openKeysModal}
            >
               <span className="block md:hidden">Key Data</span>
               <span className="hidden md:block">Enter Key Data</span>
            </button>
            {/* Keys display */}
            <div className="flex justify-evenly md:justify-center md:align-middle gap-10 md:gap-4 w-5/6 mb-3 md:mb-0 md:w-5/6 md:items-center">
               <h3 className="text-md font-bold flex items-center">
                  Private &nbsp;{<Key hasKeys={hasKeys} />}
               </h3>
               <h3 className="text-md font-bold flex items-center ">
                  Public &nbsp;{<Key hasKeys={hasKeys} />}
               </h3>
            </div>
            {/* Encryption/Decryption button container */}
            <div className="flex gap-6 w-10/12 justify-between">
               {/* Ecryption */}
               <button
                  className={`bg-blue-500 rounded-lg p-2 flex-1 text-white cursor-${
                     hasKeys ? "pointer" : "not-allowed"
                  }`}
                  type="encrypt"
                  onClick={() => openTextModal("encrypt")}
                  disabled={!hasKeys}
               >
                  <span className="block md:hidden">Encrypt</span>
                  <span className="hidden md:block">Text to Encrypt</span>
               </button>
               {/* Decryption */}
               <button
                  className={`bg-blue-500 rounded-lg p-2 flex-1 text-white cursor-${
                     hasKeys ? "pointer" : "not-allowed"
                  }`}
                  type="decrypt"
                  onClick={() => openTextModal("decrypt")}
                  disabled={!hasKeys}
               >
                  <span className="block md:hidden">Decrypt</span>
                  <span className="hidden md:block">Text to Decrypt</span>
               </button>
            </div>
         </div>

         {/* Modals section */}

         {/* Keys Modal */}
         {showKeysModal && (
            <KeysModal
               publicExp={publicExp}
               handlePublicExpChange={handlePublicExpChange}
               handlePChange={handlePChange}
               handleQChange={handleQChange}
               p={p}
               pBits={pBits}
               handlePBitsChange={handlePBitsChange}
               q={q}
               qBits={qBits}
               handleQBitsChange={handleQBitsChange}
               handleKeysSubmit={handleKeysSubmit}
               generatePrimes={generatePrimes}
               clearPandQ={clearPandQ}
               closeKeysModal={closeKeysModal}
               apiBaseUrl={apiBaseUrl}
            />
         )}

         {/* Encrypt/Decrypt Text Modal */}
         {showTextModal ? (
            <TextModal
               type={textType}
               text={textType === "encrypt" ? encryptPhrase : decryptPhrase}
               handleTextChange={handleTextChange}
               closeTextModal={closeTextModal}
               clearText={handleTextReset}
               copyToClipboard={copyToClipboard}
               handleTextSubmit={handleTextSubmit}
               isCopied={copied}
            />
         ) : null}

         {/* Text output section */}
         {isMobile ? (
            <SingleOutput
               textType={textType}
               encryptedPhrase={encryptedPhrase}
               decryptedPhrase={decryptedPhrase}
               handleTextReset={handleTextReset}
               copyToClipboard={copyToClipboard}
               copied={copied}
            />
         ) : (
            <CombinedOutput
               encryptedPhrase={encryptedPhrase}
               decryptedPhrase={decryptedPhrase}
               handleTextReset={handleTextReset}
               copyToClipboard={copyToClipboard}
               copied={copied}
            />
         )}
      </div>
   );
}

export default App;