export type TextType = "encrypt" | "decrypt";

export interface GeneratePrimesResponse {
  p: string;
  q: string;
  mod: string;
  d: string;
}

export interface SubmitKeysResponse {
  publicKey: { e: number; n: string };
  privateKey: { d: string; n: string };
}

export interface EncryptResponse {
  encrypted_message: string;
}

export interface DecryptResponse {
  decrypted_message: string;
}

export interface ValidatePrimeResponse {
  valid: boolean;
  message: string;
}
