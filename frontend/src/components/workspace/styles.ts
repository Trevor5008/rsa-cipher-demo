import type { Mode } from "../../types/teaching";

export const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600";

export const secondaryButton = `rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-50 ${focusRing}`;

/** Encrypt is the public-key (indigo) direction; decrypt is the private-key (orange) direction. */
export const modeTheme: Record<Mode, { solid: string; text: string; tint: string; border: string }> = {
  encrypt: {
    solid: "bg-indigo-700 text-white",
    text: "text-indigo-800",
    tint: "bg-indigo-50",
    border: "border-indigo-300",
  },
  decrypt: {
    solid: "bg-orange-800 text-white",
    text: "text-orange-800",
    tint: "bg-orange-50",
    border: "border-orange-300",
  },
};

export const activeKeyLabel: Record<Mode, string> = {
  encrypt: "public key",
  decrypt: "private key",
};
