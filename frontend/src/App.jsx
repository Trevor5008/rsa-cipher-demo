import { useState } from "react";
import KeysModal from "./components/KeysModal";
import TextModal from "./components/TextModal";
import axios from "axios";

function App() {
   const [publicExp, setPublicExp] = useState(65537);
   const [p, setP] = useState("");
   const [q, setQ] = useState("");
   const [showTextModal, setShowTextModal] = useState(false);
   const [textType, setTextType] = useState("");

   const [mod, setMod] = useState("");
   const [privateExp, setPrivateExp] = useState("");
   // // Flags for key presence
   // const [hasPublicKey, setHasPublicKey] = useState(false);
   // const [hasPrivateKey, setHasPrivateKey] = useState(false);
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

   const handleTextReset = () => {
      if (textType === "encrypt") {
         setEncryptPhrase("");
         setEncryptedPhrase("");
      } else {
         setDecryptPhrase("");
         setDecryptedPhrase("");
      }
   }

   const handleKeysSubmit = () => {
      console.log("Submitting keys");
      closeKeysModal();
      axios
         .post(
            "http://127.0.0.1:5000/submit-keys",
            { p: p, q: q, publicExp: publicExp },
            { headers: { "Content-Type": "application/json" } }
         )
         .then((response) => {
            const { publicKey, privateKey } = response.data;
            setMod(publicKey.n);
            setPrivateExp(privateKey.d);
         })
         .catch((error) => {
            console.log(error);
         });
   };

   const generatePrimes = () => {
      console.log("Generating primes");
      axios
         .get("http://127.0.0.1:5000/generate-primes")
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
         .post(`http://127.0.0.1:5000/${route}`, payload, {
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
      <>
         {/* Heading */}
         <h1 className=" bold">RSA Demo</h1>
         <button
            className="m-2 bg-blue-500 rounded-lg p-2"
            onClick={openKeysModal}
         >
            Enter Key Data
         </button>
         {showKeysModal ? (
            <KeysModal
               publicExp={publicExp}
               handlePublicExpChange={handlePublicExpChange}
               handlePChange={handlePChange}
               handleQChange={handleQChange}
               p={p}
               q={q}
               handleKeysSubmit={handleKeysSubmit}
               generatePrimes={generatePrimes}
               closeKeysModal={closeKeysModal}
            />
         ) : null}
         <button
            className="m-2 bg-blue-500 rounded-lg p-2"
            type="encrypt"
            onClick={() => openTextModal("encrypt")}
         >
            Enter Text to Encrypt
         </button>
         <button
            className="m-2 bg-blue-500 rounded-lg p-2"
            type="decrypt"
            onClick={() => openTextModal("decrypt")}
         >
            Enter Text to Decrypt
         </button>
         {showTextModal ? (
            <TextModal
               type={textType}
               text={textType === "encrypt" ? encryptPhrase : decryptPhrase}
               handleTextChange={handleTextChange}
               closeTextModal={closeTextModal}
               clearText={handleTextReset}
               handleTextSubmit={handleTextSubmit}
            />
         ) : null}
         <textarea
            className="border-2 p-2 rounded-lg w-full"
            value={textType === "encrypt" ? encryptedPhrase : decryptedPhrase}
            rows={7}
            placeholder={
               textType === "encrypt" ? "Encrypted text" : "Decrypted text"
            }
         />
         <button onClick={handleTextReset} className="m-2 bg-blue-500 rounded-lg p-2">
            Clear Text
         </button>
      </>
   );
}

export default App;
