// eslint-disable-next-line react/prop-types
export default function KeyInput({ type, token, handleKeyChange, closeModal, submitKey }) {
   const message = type === "public" ? "Enter modulus (n)" : "Enter private exponent (d)";
   const id = type === "public" ? "mod" : "d";
   return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
         <div className="bg-white p-8 rounded-lg w-1/3">
            <textarea
               name={id}
               id={id}
               onChange={handleKeyChange}
               className="border border-gray-300 p-2 rounded w-full mb-4"
               value={token || ""}
               placeholder={message}
               rows={7}
               cols={70}
            />
           <div className="flex justify-between">
           <button
               onClick={closeModal}
               className="bg-blue-500 text-white p-2 rounded-lg ml-2"
            >
               Cancel
            </button>
            <button
               onClick={() => submitKey(type)}
               className="bg-blue-500 text-white p-2 rounded-lg mr-2"
            >
               Submit
            </button>
           </div>
         </div>
      </div>
   );
}
