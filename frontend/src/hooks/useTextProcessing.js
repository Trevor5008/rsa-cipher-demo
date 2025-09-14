import { useState } from 'react';

/**
 * Custom hook for managing text encryption/decryption state
 * Separates text processing from key management
 */
export const useTextProcessing = () => {
  // Input text states
  const [encryptInput, setEncryptInput] = useState("");
  const [decryptInput, setDecryptInput] = useState("");
  
  // Output text states
  const [encryptedOutput, setEncryptedOutput] = useState("");
  const [decryptedOutput, setDecryptedOutput] = useState("");

  // Clear specific text type
  const clearText = (type) => {
    if (type === 'encrypt') {
      setEncryptInput("");
      setEncryptedOutput("");
    } else if (type === 'decrypt') {
      setDecryptInput("");
      setDecryptedOutput("");
    }
  };

  // Clear all text
  const clearAllText = () => {
    setEncryptInput("");
    setDecryptInput("");
    setEncryptedOutput("");
    setDecryptedOutput("");
  };

  // Set encrypted output
  const setEncryptedResult = (text) => {
    setEncryptedOutput(text);
  };

  // Set decrypted output
  const setDecryptedResult = (text) => {
    setDecryptedOutput(text);
  };

  return {
    // Input states
    encryptInput,
    setEncryptInput,
    decryptInput,
    setDecryptInput,
    
    // Output states
    encryptedOutput,
    decryptedOutput,
    
    // Actions
    clearText,
    clearAllText,
    setEncryptedResult,
    setDecryptedResult,
  };
};
