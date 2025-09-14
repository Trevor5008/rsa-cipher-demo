import { useState } from 'react';

/**
 * Custom hook for managing modal states
 * Centralizes modal visibility and type management
 */
export const useModals = () => {
  const [showKeysModal, setShowKeysModal] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);
  const [textModalType, setTextModalType] = useState(""); // 'encrypt' or 'decrypt'

  const openKeysModal = () => {
    setShowKeysModal(true);
  };

  const closeKeysModal = () => {
    setShowKeysModal(false);
  };

  const openTextModal = (type) => {
    setTextModalType(type);
    setShowTextModal(true);
  };

  const closeTextModal = () => {
    setShowTextModal(false);
    setTextModalType("");
  };

  return {
    // Modal visibility states
    showKeysModal,
    showTextModal,
    textModalType,
    
    // Modal actions
    openKeysModal,
    closeKeysModal,
    openTextModal,
    closeTextModal,
  };
};
