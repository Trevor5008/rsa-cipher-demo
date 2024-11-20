import { useState } from "react";

function App() {
   const [publicKey, setPublicKey] = useState({ n: "" });

   const handleInputChange = (event) => {
      const { name, value } = event.target;
      setPublicKey({ ...publicKey, [name]: value });
   };

   return (
      <>
         <h1>RSA Cipher Demo: {publicKey.n}</h1>
         <div>
            <input
               type="text"
               id="n"
               name="n"
               value={publicKey.n}
               onChange={handleInputChange}
               placeholder="Enter modulus (n)"
               className="border border-gray-300 p-2 rounded w-full mb-4"
            />
         </div>
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
      </>
   );
}

export default App;
