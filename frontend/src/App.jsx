import axios from "axios";
import { useState, useEffect } from "react";
import PhraseModal from "./components/PhraseModal";
import KeyInput from "./components/KeyInput";

function App() {
   const [publicExp, setPublicExp] = useState(65537);
   const [publicKey, setPublicKey] = useState({ n: "", e: publicExp });
   const [privateKey, setPrivateKey] = useState({
      n: publicKey.n || "",
      d: "",
   });
   // format: utf-8 or ascii
   const [format, setFormat] = useState("utf-8");
   const [phrase, setPhrase] = useState("");
   // Modal states
   const [showPhraseModal, setShowPhraseModal] = useState(false);
   const [showEncryptedModal, setShowEncryptedModal] = useState(false);
   const [showDecryptedModal, setShowDecryptedModal] = useState(false);
   // Encryption/Decryption phrases
   const [encryptedPhrase, setEncryptedPhrase] = useState("");
   const [decryptedPhrase, setDecryptedPhrase] = useState("");

   useEffect(() => {
      setPhrase("This ain't it, chief!");
   }, []);

   const handlePublicKeyChange = (event) => {
      setDecryptedPhrase("");
      const { value } = event.target;
      setPublicKey({ ...publicKey, n: value });
   };

   const handlePublicExpChange = (event) => {
      const { value } = event.target;
      setPublicExp(value);
      setPublicKey({ ...publicKey, e: value });
   };

   const handlePrivateKeyChange = (event) => {
      setDecryptedPhrase("");
      const { value } = event.target;
      setPrivateKey({ ...privateKey, n: publicKey.n, d: value });
   };

   const handleEncrypt = (format) => {
      // Encrypt the phrase using the public key
      // and display the result
      setFormat(format);
      axios
         .post(
            "http://127.0.0.1:5000/encrypt",
            { publicKey, phrase, format },
            { headers: { "Content-Type": "application/json" } }
         )
         .then((response) => {
            const phrase = response.data["encrypted_message"];
            setEncryptedPhrase(phrase);
         })
         .catch((error) => {
            console.error("Error encrypting the phrase:", error);
         });
   };

   const handleDecrypt = () => {
      // Decrypt the phrase using the private key
      // and display the result
      axios
         .post(
            "http://127.0.0.1:5000/decrypt",
            { privateKey, encryptedPhrase, format },
            { headers: { "Content-Type": "application/json" } }
         )
         .then((response) => {
            const phrase = response.data["decrypted_message"];
            console.log(phrase);
            setDecryptedPhrase(phrase);
         })
         .catch((error) => {
            console.error("Error decrypting the phrase:", error);
         });
   };

   const handleSubmitKey = (type) => {
      console.log("Submitting key for", type);
      type === "public"
         ? handleEncrypt(format)
         : handleDecrypt();
   }

   return (
      <>
         {/* Heading */}
         <h1>RSA Cipher Demo</h1>
         {/* Secret phrase */}
         <h2>Phrase: {showPhraseModal ? phrase : "***********"}</h2>
         {/* Phrase modal */}
         <div>
            {showPhraseModal && (
               <PhraseModal
                  phrase={phrase}
                  closeModal={() => setShowPhraseModal(false)}
               />
            )}
         </div>
         {/* Show phrase modal button */}
         <button
            className="m-2 bg-red-500 rounded-lg p-2"
            onClick={() => setShowPhraseModal(true)}
         >
            Show Phrase
         </button>
         <div>
            <label htmlFor="e">Public Exp (e)</label>
            <input
               type="text"
               id="publicExp"
               name="publicExp"
               value={publicKey.e || ""}
               onChange={handlePublicExpChange}
               placeholder={publicExp || "Enter public exponent (e)"}
               className="border border-gray-300 p-2 rounded w-full mb-4"
            />
         </div>
         {/* Encrypt buttons */}
         <div>
            {showEncryptedModal ? (
               <KeyInput
                  type="public"
                  token={publicKey.n || ""}
                  handleKeyChange={(e) => handlePublicKeyChange(e)}
                  closeModal={() => setShowEncryptedModal(false)}
                  submitKey={handleSubmitKey}
               />
            ) : null}
            <button
               className="m-2 bg-blue-500 rounded-lg p-2"
               onClick={() => setShowEncryptedModal(true)}
            >
               Encrypt
            </button>
         </div>
         {/* Encrypted text display (integers) */}
         <textarea
            name="encrypted"
            id="encrypted"
            className="border border-gray-300 p-2 rounded w-full mb-4"
            readOnly
            value={encryptedPhrase}
         />
         {/* Decrypt button */}
         <div>
            {showDecryptedModal ? (
               <KeyInput
                  type="private"
                  token={privateKey.d || ""}
                  handleKeyChange={(e) => handlePrivateKeyChange(e)}
                  closeModal={() => setShowDecryptedModal(false)}
                  submitKey={handleSubmitKey}
               />
            ) : null}
            <button
               className="m-2 bg-blue-500 rounded-lg p-2"
               onClick={() => setShowDecryptedModal(true)}
            >
               Decrypt
            </button>
         </div>
         {/* Decrypted text display */}
         <textarea
            name="decrypted"
            id="decrypted"
            className="border border-gray-300 p-2 rounded w-full mb-4"
            readOnly
            value={decryptedPhrase}
         />
      </>
   );
}

export default App;
