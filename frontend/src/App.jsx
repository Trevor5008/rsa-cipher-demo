import { useState, useEffect } from "react";
import KeysModal from "./components/KeysModal";
import TextModal from "./components/TextModal";
import Paperclip from "./components/Icons/Paperclip";
import Key from "./components/Icons/Key";
import axios from "axios";
import process from "process";

function App() {
   const API_BASE_URL = process.env.REACT_APP_BASE_URL || "http://127.0.0.1:5000";
   const [publicExp, setPublicExp] = useState(65537);
   const [p, setP] = useState("");
   const [q, setQ] = useState("");
   const [showTextModal, setShowTextModal] = useState(false);
   const [textType, setTextType] = useState("");

   const [mod, setMod] = useState("");
   const [privateExp, setPrivateExp] = useState("");
   // // Flags for key presence
   const [hasKeys, setHasKeys] = useState(false);
   // // Flag for encryption readiness
   // const [readyToEncrypt, setReadyToEncrypt] = useState(hasPublicKey && hasPrivateKey);
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


   useEffect(() => {
      setHasKeys(privateExp && mod && p && q);
   }, [privateExp, mod, publicExp, p, q]);

   const openKeysModal = () => {
      setShowKeysModal(true);
   };

   const handlePublicExpChange = (e) => {
      setPublicExp(e.target.value);
   };

   const handlePChange = (e) => {
      setP(e.target.value);
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
   }

   const copyToClipboard = (text) => {
      navigator.clipboard.writeText(text).then(() => {
         setCopied(true);
         setTimeout(() => setCopied(false), 2000);
      });
   };

   const handleTextReset = () => {
      if (textType === "encrypt") {
         setEncryptPhrase("");
         setEncryptedPhrase("");
      } else {
         setDecryptPhrase("");
         setDecryptedPhrase("");
      }
   };

   const handleKeysSubmit = () => {
      console.log("Submitting keys");
      closeKeysModal();
      axios
         .post(
            `${API_BASE_URL}/submit-keys`,
            { p: p, q: q, publicExp: publicExp },
            { headers: { "Content-Type": "application/json" } }
         )
         .then((response) => {
            const { publicKey, privateKey } = response.data;
            setMod(publicKey.n);
            setPrivateExp(privateKey.d);
         })
         .then(() => { setHasKeys(true); })
         .catch((error) => {
            console.log(error);
         });
   };

   const generatePrimes = () => {
      console.log("Generating primes");
      axios
         .get(`${API_BASE_URL}/generate-primes`)
         .then((response) => {
            const { p, q, mod, d } = response.data;
            setP(p);
            setQ(q);
            setMod(mod);
            setPrivateExp(d);
         })
         .catch((error) => {
            console.log(error);
         });
      console.log(p, q, mod, privateExp);
   };

   const handleTextSubmit = () => {
      closeTextModal();
      const route = textType === "encrypt" ? "encrypt" : "decrypt";
      const payload =
         textType === "encrypt"
            ? { text: encryptPhrase, publicExp, mod }
            : { text: decryptPhrase, privateExp, mod };
      axios
         .post(`${API_BASE_URL}/${route}`, payload, {
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
         {/* Buttons section */}
         <div className="flex justify-between items-center w-full max-w-3xl mb-4">
            <button
               className="bg-orange-500 rounded-lg p-2 text-white ml-2"
               onClick={openKeysModal}
            >
               Enter Key Data
            </button>
            <h3 className="text-md space-x-2 font-bold flex items-center">Private &nbsp;{<Key hasKeys={hasKeys}/>}</h3>
            <h3 className="text-md space-x-1 font-bold flex items-center ">Public &nbsp;{<Key hasKeys={hasKeys}/>}</h3>
            <div className="flex space-x-4 mr-2">
            <button
               className={`bg-blue-500 rounded-lg p-2 text-white cursor-${hasKeys ? "pointer" : "not-allowed"}`}
               type="encrypt"
               onClick={() => openTextModal("encrypt")}
               disabled={!hasKeys}
            >
               Enter Text to Encrypt
            </button>
            
            <button
               className={`bg-blue-500 rounded-lg p-2 text-white cursor-${hasKeys ? "pointer" : "not-allowed"}`}
               type="decrypt"
               onClick={() => openTextModal("decrypt")}
               disabled={!hasKeys}
            >
               Enter Text to Decrypt
            </button>
            </div>
         </div>
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
         <div className="flex flex-col items-end max-w-3xl w-full">
            <textarea
               className="border-2 p-4 rounded-lg w-full h-40 resize-none mb-4"
               value={
                  textType === "encrypt" ? encryptedPhrase : decryptedPhrase
               }
               rows={7}
               placeholder={
                  textType === "encrypt" ? "Encrypted text" : "Decrypted text"
               }
               readOnly
            />
            <div className="flex justify-evenly items-center space-x-4">
               <button
                  onClick={handleTextReset}
                  className="bg-blue-500 text-white p-2 rounded-lg"
               >
                  Clear
               </button>
               <Paperclip
                  copyToClipboard={() =>
                     copyToClipboard(
                        textType === "encrypt"
                           ? encryptedPhrase
                           : decryptedPhrase
                     )
                  }
               />
               {copied && <p className="text-green-500 text-sm">Copied!</p>}
            </div>
         </div>

         {/* Modals section */}
         {/* Modals */}
         {showKeysModal && (
            <KeysModal
               publicExp={publicExp}
               handlePublicExpChange={handlePublicExpChange}
               handlePChange={handlePChange}
               handleQChange={handleQChange}
               p={p}
               q={q}
               handleKeysSubmit={handleKeysSubmit}
               generatePrimes={generatePrimes}
               clearPandQ={clearPandQ}
               closeKeysModal={closeKeysModal}
            />
         )}
         {showTextModal && (
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
         )}
      </div>
   );
}

export default App;
