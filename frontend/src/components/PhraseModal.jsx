

// eslint-disable-next-line react/prop-types
export default function PhraseModal({ closeModal, phrase, handlePhraseChange, submitPhrase }) {
   return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
         <div className="bg-white p-8 rounded-lg w-1/3">
            <h2 className="text-2xl font-bold mb-4">Phrase</h2>
            <textarea
               id="phrase"
               className="border border-gray-300 p-2 rounded w-full mb-4"
               rows={7}
               cols={70}
               value={phrase || ""}
               onChange={handlePhraseChange}
            />
            <div className="flex justify-between">
            <button
               onClick={closeModal}
               className="bg-blue-500 text-white p-2 rounded-lg ml-2"
            >
               Close
            </button>
            <button
               onClick={submitPhrase}
               className="bg-blue-500 text-white p-2 rounded-lg mr-2"
               >
               Submit
            </button>
            </div>
         </div>
      </div>
   );
}
