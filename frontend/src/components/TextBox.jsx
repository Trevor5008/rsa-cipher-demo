import Paperclip from "./Icons/Paperclip";

/**
 * Text processing component that handles both input and output
 * Shows input field, submit button, and output field for encryption/decryption
 */
export default function TextBox({
  type, // 'encrypt' or 'decrypt'
  handleTextChange,
  handleTextSubmit,
  inputValue,
  outputValue,
  placeholder,
  outputPlaceholder,
  onClear,
  onCopy,
  copied,
  hasKeys,
  className = "",
}) {
  return (
    <div className={`flex flex-col ${className}`}>
      {/* Input Section */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {type === 'encrypt' ? 'Text to Encrypt' : 'Encrypted Number to Decrypt'}
        </label>
        <textarea
          className="border-2 p-2 rounded-lg w-full h-32 resize-none"
          onChange={(e) => handleTextChange(type, e)}
          value={inputValue || ""}
          rows={4}
          placeholder={placeholder}
        />
        <button
          onClick={() => handleTextSubmit(type)}
          disabled={!hasKeys || !inputValue}
          className={`mt-2 px-4 py-2 rounded-lg text-white ${
            hasKeys && inputValue 
              ? 'bg-green-500 hover:bg-green-600 cursor-pointer' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {type === 'encrypt' ? 'Encrypt' : 'Decrypt'}
        </button>
      </div>

      {/* Output Section */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {type === 'encrypt' ? 'Encrypted Result' : 'Decrypted Result'}
        </label>
        <textarea
          className="border-2 p-2 rounded-lg w-full h-32 resize-none bg-gray-50"
          value={outputValue || ""}
          rows={4}
          placeholder={outputPlaceholder}
          readOnly
        />
        <div className="flex justify-between items-center mt-2">
          <button
            onClick={() => onClear(type)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Clear
          </button>
          <div className="flex items-center space-x-2">
            <Paperclip copyToClipboard={() => onCopy(outputValue)} />
            {copied && <p className="text-green-500 text-sm">Copied!</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
