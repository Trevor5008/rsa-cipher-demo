import Paperclip from "./Icons/Paperclip";

/* eslint-disable react/prop-types */
export default function CombinedOuptut({
   encryptedPhrase,
   decryptedPhrase,
   handleTextReset,
   copyToClipboard,
   copied,
}) {
   return (
      <div className="flex gap-4 items-end w-3/4 px-2">
         {/* Encrypted Text Output & Buttons (copy + clear) */}
         <div className="flex flex-col items-end w-1/2">
            <textarea
               className="border-2 p-2 rounded-lg w-full h-40 resize-none mb-4"
               value={encryptedPhrase || ""}
               rows={7}
               placeholder={"Encrypted text"}
               readOnly
            />
            <div className="flex justify-evenly items-center space-x-4 w-2/4">
               <button
                  onClick={handleTextReset}
                  className="bg-blue-500 text-white p-2 rounded-lg w-1/2 md:w-1/2"
               >
                  Clear
               </button>
               <Paperclip
                  copyToClipboard={() => copyToClipboard(encryptedPhrase)}
               />
               {copied && <p className="text-green-500 text-sm">Copied!</p>}
            </div>
         </div>
         <div className="flex flex-col items-end w-1/2">
            <textarea
               className="border-2 p-2 rounded-lg w-full h-40 resize-none mb-4"
               value={decryptedPhrase || ""}
               rows={7}
               placeholder={"Decrypted text"}
               readOnly
            />
            <div className="flex justify-evenly items-center space-x-4 w-2/4">
               <button
                  onClick={handleTextReset}
                  className="bg-blue-500 text-white p-2 rounded-lg w-1/2 md:w-1/2"
               >
                  Clear
               </button>
               <Paperclip
                  copyToClipboard={() => copyToClipboard(decryptedPhrase)}
               />
               {copied && <p className="text-green-500 text-sm">Copied!</p>}
            </div>
         </div>
      </div>
   );
}
