import type {
  TeachingDecryptResponse,
  TeachingEncryptResponse,
  TeachingKey,
} from "../types/teaching";

/** Shared fixture from docs/TEACHING-API.md: p = 1009, q = 1013, e = 65537, message "test". */
export const FIXTURE_KEY: TeachingKey = {
  p: "1009",
  q: "1013",
  e: "65537",
  n: "1022117",
  phi: "1020096",
  d: "832193",
  publicKey: { e: "65537", n: "1022117" },
  privateKey: { d: "832193", n: "1022117" },
};

export const FIXTURE_ENCRYPT: TeachingEncryptResponse = {
  ciphertext: ["924799", "621270", "2637", "924799"],
  display: "924799 621270 2637 924799",
  trace: [
    { index: 1, character: "t", codePoint: "116", ciphertext: "924799" },
    { index: 2, character: "e", codePoint: "101", ciphertext: "621270" },
    { index: 3, character: "s", codePoint: "115", ciphertext: "2637" },
    { index: 4, character: "t", codePoint: "116", ciphertext: "924799" },
  ],
};

export const FIXTURE_DECRYPT: TeachingDecryptResponse = {
  message: "test",
  trace: [
    { index: 1, ciphertext: "924799", codePoint: "116", character: "t" },
    { index: 2, ciphertext: "621270", codePoint: "101", character: "e" },
    { index: 3, ciphertext: "2637", codePoint: "115", character: "s" },
    { index: 4, ciphertext: "924799", codePoint: "116", character: "t" },
  ],
};
