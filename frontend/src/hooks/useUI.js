import { useState, useEffect } from 'react';

/**
 * Custom hook for managing UI state (notifications, responsive design, etc.)
 * Handles UI-specific state that doesn't relate to core functionality
 */
export const useUI = () => {
    const [encryptCopied, setEncryptCopied] = useState(false);
    const [decryptCopied, setDecryptCopied] = useState(false);
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
    const copyToClipboard = (text, mode) => {
        navigator.clipboard.writeText(text).then(() => {
            if (mode === "encrypt") {
                setEncryptCopied(true);
                setTimeout(() => setEncryptCopied(false), 2000);
            } else if (mode === "decrypt") {
                setDecryptCopied(true);
                setTimeout(() => setDecryptCopied(false), 2000);
            }
        }).catch((error) => {
            console.error('Failed to copy to clipboard:', error);
        });
    };

    return {
        encryptCopied,
        decryptCopied,
        isMobile,
        copyToClipboard,
    };
};
