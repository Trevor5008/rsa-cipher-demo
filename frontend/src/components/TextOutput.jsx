import Paperclip from "./Icons/Paperclip";

/**
 * Unified text output component that handles both encrypted and decrypted text
 * Replaces the separate CombinedOutput and SingleOutput components
 */
export default function TextOutput({
  type, // 'encrypt' or 'decrypt'
  value,
  placeholder,
  onClear,
  onCopy,
  copied,
  className = "",
}) {
  return (
    <div className={`flex flex-col items-end ${className}`}>
      <textarea
        className="border-2 p-2 rounded-lg w-full h-40 resize-none mb-4"
        value={value || ""}
        rows={7}
        placeholder={placeholder}
        readOnly
      />
      <div className="flex justify-evenly items-center space-x-4 w-2/4">
        <button
          onClick={() => onClear(type)}
          className="bg-blue-500 text-white p-2 rounded-lg w-1/2"
        >
          Clear
        </button>
        <Paperclip copyToClipboard={() => onCopy(value)} />
        {copied && <p className="text-green-500 text-sm">Copied!</p>}
      </div>
    </div>
  );
}
