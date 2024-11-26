import { useState } from "react";
import KeysModal from "./components/KeysModal";
import TextModal from "./components/TextModal";
import axios from "axios";

function App() {
   const [publicExp, setPublicExp] = useState(65537);
   const [p, setP] = useState("");
   const [q, setQ] = useState("");
   const [mod, setMod] = useState("");
   const [privateExp, setPrivateExp] = useState("");
   const [showTextModal, setShowTextModal] = useState(false);
   const [textType, setTextType] = useState("");

   // const [mod, setMod] = useState("");
   // const [phi, setPhi] = useState("")
   // const [privateExp, setPrivateExp] = useState("")
   // // Flags for key presence
   // const [hasPublicKey, setHasPublicKey] = useState(false);
   // const [hasPrivateKey, setHasPrivateKey] = useState(false);
   // // Flag for encryption readiness
   // const [readyToEncrypt, setReadyToEncrypt] = useState(hasPublicKey && hasPrivateKey);
   // const [phrase, setPhrase] = useState("");
   // Encryption/Decryption phrases
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
         ? setEncryptedPhrase(e.target.value)
         : setDecryptedPhrase(e.target.value);
      console.log(e.target.value);
   }

   // const validatePrimes = () => {
   // const pVal = parseInt(p)
   // const qVal = parseInt(q)
   // axios
   //    .post("http://localhost:5000/validate-prime/",
   //       { p: pVal, q: qVal },
   //       { headers: { "Content-Type": "application/json" } }
   //    )
   //    .then((response) => {
   //       console.log(response.data)
   //    })
   //    .catch((error) => {
   //       console.log(error)
   //    })
   // }

   // const handleModulusChange = (e) => {
   //    console.log(e.target.value)
   //    setModulus(e.target.value);
   // }
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
               text={textType === "encrypt" ? encryptedPhrase : decryptedPhrase}
               handleTextChange={handleTextChange}
               // handleTextBlur={handleTextBlur}
               closeTextModal={closeTextModal}
            />
         ) : null}
      </>
   );
}

export default App;
