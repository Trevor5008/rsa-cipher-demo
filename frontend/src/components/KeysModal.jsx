import axios from "axios";
import { useState } from "react";

/* eslint-disable react/prop-types */
export default function KeysModal({
   publicExp,
   handlePublicExpChange,
   handlePChange,
   handleQChange,
   p,
   q,
   closeModal,
}) {
   const [pValid, setPValid] = useState(false);
   const [qValid, setQValid] = useState(false);
   const [coPrimeValid, setCoPrimeValid] = useState(false);

   // Validate individual prime values
   const validatePrime = async (value, type) => {
      try {
         const response = await axios.post(
            "http://127.0.0.1:5000/validate-prime",
            { val: value },
            { headers: { "Content-Type": "application/json" } }
         );

         const isValid = response.data["valid"];
         
         if (type === "p") {
            setPValid(isValid);
         } else if (type === "q") {
            setQValid(isValid);
         }

         return response.data["valid"];
      } catch (error) {
         console.error(`Error validating ${type}:`, error);
         return false;
      }
   };

   const validateCoprime = () => {
      setCoPrimeValid(pValid && qValid && p !== q);
   }

   // Handle blur events for p and q
   const handlePBlur = async () => {
      if (await validatePrime(p, "p")) {
         if (qValid) {
            validateCoprime();
         }
      }
   };

   const handleQBlur = async () => {
      if (await validatePrime(q, "q")) {
         if (pValid) {
            validateCoprime();
         }
      }
   };

   return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
         <div className="bg-white p-8 rounded-lg w-1/3 border-2 border-red-600">
            <label className="block text-lg font-bold">Public Exponent (e)</label>
            <input
               type="text"
               placeholder="Public Exponent"
               value={publicExp || ""}
               onChange={handlePublicExpChange}
               className="border-2 border-gray-400 p-2 rounded-lg w-full"
            />
            <label className="block text-lg font-bold mt-4">P Value</label>
            <textarea
               className={`border-2 p-2 rounded-lg w-full ${
                  pValid ? "border-gray-400" : "border-red-500"
               }`}
               value={p || ""}
               onChange={handlePChange}
               onBlur={handlePBlur}
               placeholder="Enter a prime number for p"
            />
            {!pValid && <p className="text-red-500 text-sm">Invalid P value</p>}

            <label className="block text-lg font-bold mt-4">Q Value</label>
            <textarea
               className={`border-2 p-2 rounded-lg w-full ${
                  qValid ? "border-gray-400" : "border-red-500"
               }`}
               value={q || ""}
               onChange={handleQChange}
               onBlur={handleQBlur}
               placeholder="Enter a prime number for q"
            />
            {!qValid && <p className="text-red-500 text-sm">Invalid Q value</p>}

            {!coPrimeValid && (
               <p className="text-red-500 text-sm mt-2">P and Q must be coprime</p>
            )}

            <div className="flex justify-between mt-4">
               <button
                  onClick={closeModal}
                  className="bg-blue-500 text-white p-2 rounded-lg ml-2"
               >
                  Close
               </button>
               <button
                  className="bg-green-500 text-white p-2 rounded-lg mr-2"
                  disabled={!pValid || !qValid || !coPrimeValid}
               >
                  Submit
               </button>
            </div>
         </div>
      </div>
   );
}
