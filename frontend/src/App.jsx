import axios from "axios";
import { useState, useEffect } from "react";

function App() {
   const [publicKey, setPublicKey] = useState({ n: "", e: 65537 });
   const [phrase, setPhrase] = useState("");
   const [showPhrase, setShowPhrase] = useState(false);
   const [encryptedPhrase, setEncryptedPhrase] = useState("");

   useEffect(() => {
      setPhrase("Hello World!")
   }, [])

   const handleInputChange = (event) => {
      const { name, value } = event.target;
      setPublicKey({ ...publicKey, [name]: value });
   };

   const handleEncrypt = () => {
      // Encrypt the phrase using the public key
      // and display the result
      axios.post("http://127.0.0.1:5000/encrypt", 
         { publicKey, phrase },
         { headers: { "Content-Type": "application/json" } }
         )
         .then((response) => {
            const phrase = response.data["encrypted_message"]
            setEncryptedPhrase(phrase)
         })
         .catch((error) => {
            console.error("Error encrypting the phrase:", error);
         });
   }

   return (
      <>
         <h1>RSA Cipher Demo</h1>
         <h2>Phrase: {showPhrase ? phrase : "***********"}</h2>
         <div>
            <textarea 
               name="n" 
               id="mod" 
               onChange={handleInputChange}
               className="border border-gray-300 p-2 rounded w-full mb-4"
               value={publicKey.n || ""} 
               placeholder="Enter modulus (n)"
            />
            {showPhrase && 
               <div
                  className="text-sm text-gray-500 z-20" 
                  hidden={!showPhrase}>
                  Phrase: {phrase}
               </div>}
         </div>
         <button className="m-2 bg-red-500 rounded-lg p-2" onClick={() => setShowPhrase(!showPhrase)}>Show Phrase</button>
         <div>
            <input
               type="text"
               id="e"
               name="e"
               value={publicKey.e}
               onChange={handleInputChange}
               placeholder="Enter public exponent (e)"
               className="border border-gray-300 p-2 rounded w-full mb-4"
            />
         </div>
         <button className="m-2 bg-blue-500 rounded-lg p-2" onClick={() => handleEncrypt()}>Encrypt</button>
         <textarea name="" id="" className="border border-gray-300 p-2 rounded w-full mb-4" readOnly value={encryptedPhrase}/>
      </>
   );
}

export default App;
