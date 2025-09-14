import { useState, useEffect } from 'react';

/**
 * Custom hook for managing RSA key generation and validation
 * Centralizes all key-related state and operations
 */
export const useRSAKeys = () => {
  // Key generation parameters
  const [publicExp, setPublicExp] = useState(65537);
  const [p, setP] = useState("");
  const [pBits, setPBits] = useState(512);
  const [q, setQ] = useState("");
  const [qBits, setQBits] = useState(512);
  
  // Generated keys
  const [mod, setMod] = useState("");
  const [privateExp, setPrivateExp] = useState("");
  
  // Computed state
  const [hasKeys, setHasKeys] = useState(false);

  // Update hasKeys when key components change
  useEffect(() => {
    setHasKeys(!!(privateExp && mod && p && q));
  }, [privateExp, mod, p, q]);

  // Key generation
  const generateKeys = (pValue, qValue, publicExpValue) => {
    setP(pValue);
    setQ(qValue);
    setPublicExp(publicExpValue);
  };

  // Clear all keys
  const clearKeys = () => {
    setP("");
    setQ("");
    setMod("");
    setPrivateExp("");
    setPublicExp(65537);
  };

  // Clear only P and Q (for regeneration)
  const clearPandQ = () => {
    setP("");
    setQ("");
  };

  return {
    // Key parameters
    publicExp,
    setPublicExp,
    p,
    setP,
    pBits,
    setPBits,
    q,
    setQ,
    qBits,
    setQBits,
    
    // Generated keys
    mod,
    setMod,
    privateExp,
    setPrivateExp,
    
    // Computed state
    hasKeys,
    
    // Actions
    generateKeys,
    clearKeys,
    clearPandQ,
  };
};
