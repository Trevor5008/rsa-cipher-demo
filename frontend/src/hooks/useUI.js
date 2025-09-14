import { useState, useEffect } from 'react';

/**
 * Custom hook for managing UI state (notifications, responsive design, etc.)
 * Handles UI-specific state that doesn't relate to core functionality
 */
export const useUI = () => {
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Copy to clipboard with feedback
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return {
    copied,
    isMobile,
    copyToClipboard,
  };
};
