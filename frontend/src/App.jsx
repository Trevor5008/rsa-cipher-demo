import axios from "axios";
import { useState, useEffect } from "react";

function App() {
   const [publicExp, setPublicExp] = useState(null);
   const [publicKey, setPublicKey] = useState({ n: "", e: publicExp});
   const [privateKey, setPrivateKey] = useState({ n: "", d: "" });
   const [phrase, setPhrase] = useState("");
   const [showPhrase, setShowPhrase] = useState(false);
   const [encryptedPhrase, setEncryptedPhrase] = useState("");
   const [decryptedPhrase, setDecryptedPhrase] = useState("");

   useEffect(() => {
      setPhrase("This is a random phrase to encrypt");
      setPublicExp(65537);
   }, []);

   const handlePublicKeyChange = (event) => {
      const { name, value } = event.target;
      setDecryptedPhrase("")
      setPublicKey({ ...publicKey, [name]: value });
   };

   const handlePublicExpChange = (event) => {
      const { value } = event.target;
      setPublicExp(value);
      setPublicKey({ ...publicKey, e: value });
   }

   const handlePrivateKeyChange = (event) => {
      const { value } = event.target;
      const d = value.slice(publicKey.n.length);
      setPrivateKey({ ...privateKey, n: publicKey.n, d });
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
         .catch((error) => {
            setEncryptedPhrase("This ain't it chief");
            console.error("Error encrypting the phrase:", error);
         });
   };

   const handleDecrypt = () => {
      // Decrypt the phrase using the private key
      // and display the result
      console.log(privateKey)
      axios
         .post(
            "http://127.0.0.1:5000/decrypt",
            { privateKey, encryptedPhrase },
            { headers: { "Content-Type": "application/json" } }
         )
         .then((response) => {
            const phrase = response.data["decrypted_message"];
            console.log(phrase)
            setDecryptedPhrase(phrase);
         })
         .catch((error) => {
            console.error("Error decrypting the phrase:", error);
         });
   };

   return (
      <>
         {/* Heading */}
         <h1>RSA Cipher Demo</h1>
         {/* Secret phrase */}
         <h2>Phrase: {showPhrase ? phrase : "***********"}</h2>
         <div>
            <label 
               htmlFor="mod"
            >
               Modulus (n)
            </label>
            <textarea
               name="n"
               id="mod"
               onChange={handlePublicKeyChange}
               className="border border-gray-300 p-2 rounded w-full mb-4"
               value={publicKey.n || ""}
               placeholder="Enter modulus (n)"
            />
            {showPhrase && (
               <div className="text-sm text-gray-500 z-20" hidden={!showPhrase}>
                  Phrase: {phrase}
               </div>
            )}
         </div>
         <button
            className="m-2 bg-red-500 rounded-lg p-2"
            onClick={() => setShowPhrase(!showPhrase)}
         >
            Show Phrase
         </button>
         <div>
            <label htmlFor="e">Public Exp (e)</label>
            <input
               type="text"
               id=""
               name=""
               value={publicKey.e || ""}
               onChange={handlePublicExpChange}
               placeholder="Enter public exponent (e)"
               className="border border-gray-300 p-2 rounded w-full mb-4"
            />
         </div>
         {/* Encrypt button */}
         <button
            className="m-2 bg-blue-500 rounded-lg p-2"
            onClick={() => handleEncrypt()}
         >
            Encrypt
         </button>
         {/* Encrypted text display (integers) */}
         <textarea
            name="encrypted"
            id="encrypted"
            className="border border-gray-300 p-2 rounded w-full mb-4"
            readOnly
            value={encryptedPhrase}
         />
         {/* Private key input */}
         <textarea
            name="privateKey"
            id="privateKey"
            className="border border-gray-300 p-2 rounded w-full mb-4"
            placeholder="Enter private key (n + d)"
            value={privateKey.n + privateKey.d}
            onChange={handlePrivateKeyChange}
         />
         <button
            className="m-2 bg-green-500 rounded-lg p-2"
            onClick={() => handleDecrypt()}
         >
            Decrypt
         </button>
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
