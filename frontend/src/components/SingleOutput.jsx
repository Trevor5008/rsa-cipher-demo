import Paperclip from "./Icons/Paperclip"

/* eslint-disable react/prop-types */
export default function SingleOutput({ textType, encryptedPhrase, decryptedPhrase, handleTextReset, copyToClipboard, copied }) {
   return (
      <div className="flex flex-col items-end max-w-3xl w-5/6 md:w-1/2 md:px-4 px-2 md:hidden">
         <textarea
            className="border-2 p-2 rounded-lg w-full h-40 resize-none mb-4"
            value={
               textType === "encrypt" ? encryptedPhrase : decryptedPhrase
            }
            rows={7}
            placeholder={
               textType === "encrypt" ? "Encrypted text" : "Decrypted text"
            }
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
               copyToClipboard={() =>
                  copyToClipboard(
                     textType === "encrypt"
                        ? encryptedPhrase
                        : decryptedPhrase
                  )
               }
            />
            {copied && <p className="text-green-500 text-sm">Copied!</p>}
         </div>
      </div>
   )
}