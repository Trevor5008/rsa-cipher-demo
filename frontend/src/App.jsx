// import axios from "axios";
import { useState } from "react";
import KeysModal from "./components/KeysModal";

function App() {
   const [publicExp, setPublicExp] = useState(65537);
   const [p, setP] = useState("")
   const [q, setQ] = useState("")

   // const [mod, setMod] = useState("");
   // const [phi, setPhi] = useState("")
   // const [privateExp, setPrivateExp] = useState("")
   // // Flags for key presence
   // const [hasPublicKey, setHasPublicKey] = useState(false);
   // const [hasPrivateKey, setHasPrivateKey] = useState(false);
   // // Flag for encryption readiness
   // const [readyToEncrypt, setReadyToEncrypt] = useState(hasPublicKey && hasPrivateKey);
   // const [phrase, setPhrase] = useState("");
   // // Encryption/Decryption phrases
   // const [encryptedPhrase, setEncryptedPhrase] = useState("");
   // const [decryptedPhrase, setDecryptedPhrase] = useState("");
   // Modals
   const [showKeysModal, setShowKeysModal] = useState(false);

   const openKeysModal = () => {
      setShowKeysModal(true)
   }

   const handlePublicExpChange = (e) => {
      setPublicExp(e.target.value);
   }

   const handlePChange = (e) => {
      setP(e.target.value);
   }

   const handleQChange = (e) => {
      setQ(e.target.value);
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
               closeModal={() => setShowKeysModal(false)}
            />
         ) : null}
      </>
   );
}

export default App;
