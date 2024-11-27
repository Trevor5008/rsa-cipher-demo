import { useState } from "react";

/* eslint-disable react/prop-types */
export default function TextModal({
   type,
   text,
   handleTextChange,
   handleTextSubmit,
   closeTextModal,
}) {
   const [textValid, setTextValid] = useState(true);

   // Validate text input
   const handleTextBlur = async () => {
      console.log("Validating text:", text);
      if (type === "decrypt") {
         const num = parseInt(text);
         const isNumeric = /^\d+$/.test(text);
         if (!isNumeric || num < 0) {
            setTextValid(false);
         } else {
            setTextValid(true);
         }
      } else {
         setTextValid(text.length < 200)
      }
   }

   return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
         <div className="bg-white p-8 rounded-lg w-1/3 border-2">
            <h1 className="text-2xl font-bold">
               {type === "encrypt" ? "Encrypt" : "Decrypt"}
            </h1>
            <textarea
               className={`border-2 p-2 rounded-lg w-full ${
                  textValid ? "border-gray-400" : "border-red-500"
               }`}
               value={text || ""}
               onChange={handleTextChange}
               onBlur={handleTextBlur}
               rows={7}
               placeholder={type === "encrypt" ? "Enter text to encrypt" : "Enter number to decrypt"}
            />
            {!textValid && (
               <p className="text-red-500 text-sm mt-2">
                  {type === "decrypt" ? "Invalid encryption value" : "Text too long"}
               </p>
            )}
            <div className="flex justify-between mt-4">
               <button
                  onClick={closeTextModal}
                  className="bg-blue-500 text-white p-2 rounded-lg ml-2"
               >
                  Close
               </button>
               <button
                  className="bg-green-500 text-white p-2 rounded-lg mr-2"
                  disabled={!textValid}
                  onClick={handleTextSubmit}
               >
                  Submit
               </button>
            </div>
         </div>
      </div>
   );
}
