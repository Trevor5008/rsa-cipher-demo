

// eslint-disable-next-line react/prop-types
export default function PhraseModal({ closeModal, phrase }) {
   return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
         <div className="bg-white p-8 rounded-lg w-1/3">
            <h2 className="text-2xl font-bold mb-4">Phrase</h2>
            <p className="mb-4">{phrase}</p>
            <button
               onClick={closeModal}
               className="bg-blue-500 text-white p-2 rounded-lg"
            >
               Close
            </button>
         </div>
      </div>
   );
}
