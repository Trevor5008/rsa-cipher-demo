import axios from "axios";
import { useState, useEffect } from "react";
import phrases from "./data/phrases";
import PhraseModal from "./components/PhraseModal";
import KeyInput from "./components/KeyInput";

function App() {
   const [publicExp, setPublicExp] = useState(65537);
   const [publicKey, setPublicKey] = useState({ n: "", e: publicExp });
   const [privateKey, setPrivateKey] = useState({
      n: publicKey.n || "",
      d: "",
   });
   const [phrase, setPhrase] = useState("");
   // Modal states
   const [showPhraseModal, setShowPhraseModal] = useState(false);
   const [showEncryptedModal, setShowEncryptedModal] = useState(false);
   const [showDecryptedModal, setShowDecryptedModal] = useState(false);
   // Encryption/Decryption phrases
   const [encryptedPhrase, setEncryptedPhrase] = useState("");
   const [decryptedPhrase, setDecryptedPhrase] = useState("");

   useEffect(() => {
      loadPhrase()
   }, []);

   const loadPhrase = () => {
      const phraseIndex = Math.floor(Math.random() * phrases.length);
      setPhrase(phrases[phraseIndex]);
   }

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

   const handleEncrypt = () => {
      // Encrypt the phrase using the public key
      // and display the result
      axios
         .post(
            "http://127.0.0.1:5000/encrypt",
            { publicKey, phrase },
            { headers: { "Content-Type": "application/json" } }
         )
         .then((response) => {
            const phrase = response.data["encrypted_message"];
            setEncryptedPhrase(phrase);
         })
         .then(() => {
            setShowEncryptedModal(false);
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
            { privateKey, encryptedPhrase},
            { headers: { "Content-Type": "application/json" } }
         )
         .then((response) => {
            const phrase = response.data["decrypted_message"];
            setDecryptedPhrase(phrase);
         })
         .then(() => {
            setShowDecryptedModal(false);
         })
         .catch((error) => {
            console.error("Error decrypting the phrase:", error);
         });
   };

   const addPhrase = () => {
      setShowPhraseModal(true)
   }

   const handlePhraseChange = (event) => {
      const { value } = event.target;
      setPhrase(value);
   }

   const submitPhrase = () => {
      setPhrase(phrase)
      setShowPhraseModal(false)
   }

   const handleSubmitKey = (type) => {
      type === "public"
         ? handleEncrypt()
         : handleDecrypt();
   }

   return (
      <>
         {/* Heading */}
         <h1>RSA Cipher Demo</h1>
         {/* Secret phrase */}
         <h2>Phrase: {showPhraseModal ? phrase : "***********"}</h2>
         <button 
            className="m-2 bg-red-500 rounded-lg p-2"
            onClick={addPhrase}
         >
               New Phrase
         </button>
         {/* Phrase modal */}
         <div>
            {showPhraseModal && (
               <PhraseModal
                  phrase={phrase}
                  handlePhraseChange={handlePhraseChange}
                  submitPhrase={submitPhrase}
                  closeModal={() => setShowPhraseModal(false)}
               />
            )}
         </div>
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
         {/* Decrypted text display (original phrase)*/}
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
