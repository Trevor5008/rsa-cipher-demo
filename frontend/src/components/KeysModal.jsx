import axios from "axios";
import { useState } from "react";
import Close from "./Icons/Close";

/* eslint-disable react/prop-types */
export default function KeysModal({
   publicExp,
   handlePublicExpChange,
   handlePChange,
   handleQChange,
   p,
   q,
   generatePrimes,
   handleKeysSubmit,
   clearPandQ,
   closeKeysModal,
}) {
   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1/5000";
   const [pValid, setPValid] = useState(true);
   const [qValid, setQValid] = useState(true);
   const [coPrimeValid, setCoPrimeValid] = useState(true);

   // Validate individual prime values
   const validatePrime = async (value, type) => {
      try {
         const response = await axios.post(
            `${API_BASE_URL}/validate_prime`,
            { val: value },
            { headers: { "Content-Type": "application/json" } }
         );

         const isValid = response.data["valid"];
         console.log(`Validating ${type}:`, isValid);

         if (type === "p") {
            setPValid(isValid);
         } else if (type === "q") {
            setQValid(isValid);
         }

         return response.data["valid"];
      } catch (error) {
         if (type === "p") {
            setPValid(false);
         } else if (type === "q") {
            setQValid(false);
         }
         console.error(`Error validating ${type}:`, error);
         return false;
      }
   };

   const validateCoprime = () => {
      setCoPrimeValid(pValid && qValid && p !== q);
   };

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
         <div className="bg-white py-8 px-8 rounded-lg w-full max-w-lg border-2">
            <div className="flex justify-between space-x-4 items-center mb-4">
               <div className="flex items-center space-x-6">
               <label className="block text-md font-bold">
                  Public Exponent (e)
               </label>
               <input
                  type="text"
                  placeholder="Public Exponent"
                  value={publicExp || ""}
                  onChange={handlePublicExpChange}
                  className="border-2 border-gray-400 p-1 rounded-lg w-1/4 text-center mr-2"
               />
               </div>
               <Close closeModal={closeKeysModal} />
            </div>
            <label className="block text-lg font-bold my-2">P Value</label>
            <textarea
               className={`border-2 p-2 rounded-lg w-full ${
                  pValid ? "border-gray-400" : "border-red-500"
               }`}
               value={p || ""}
               onChange={handlePChange}
               onBlur={handlePBlur}
               rows={7}
               placeholder="Enter a prime number for p"
            />
            {!pValid && <p className="text-red-500 text-sm">Invalid P value</p>}

            <label className="block text-lg font-bold mt-4 mb-2">Q Value</label>
            <textarea
               className={`border-2 p-2 rounded-lg w-full ${
                  qValid ? "border-gray-400" : "border-red-500"
               }`}
               value={q || ""}
               onChange={handleQChange}
               onBlur={handleQBlur}
               rows={7}
               placeholder="Enter a prime number for q"
            />
            {!qValid && <p className="text-red-500 text-sm">Invalid Q value</p>}

            {!coPrimeValid && (
               <p className="text-red-500 text-sm mt-2">
                  P and Q must be coprime
               </p>
            )}

            <div className="flex justify-between mt-4">
               <button
                  onClick={clearPandQ}
                  className="bg-blue-500 text-white p-2 rounded-lg ml-2"
               >
                  Clear
               </button>
               <button
                  onClick={generatePrimes}
                  className="bg-orange-500 text-white p-2 rounded-lg ml-2"
               >
                  Generate
               </button>
               <button
                  className="bg-green-500 text-white p-2 rounded-lg mr-2"
                  disabled={!pValid || !qValid || !coPrimeValid}
                  onClick={handleKeysSubmit}
               >
                  Submit
               </button>
            </div>
         </div>
      </div>
   );
}
