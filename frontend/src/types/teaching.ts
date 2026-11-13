/**
 * Types for the teaching-mode API (docs/TEACHING-API.md).
 *
 * RSA values cross the API boundary as decimal strings so large integers are
 * never rounded by JavaScript numbers. Only `index` (1-based) is a number.
 */

export type Mode = "encrypt" | "decrypt";

export type KeyField = "p" | "q" | "e";

export type KeyFields = Record<KeyField, string>;

export type PresetId = "textbook" | "bigger" | "custom";

export interface TeachingKey {
  p: string;
  q: string;
  e: string;
  n: string;
  phi: string;
  d: string;
  publicKey: { e: string; n: string };
  privateKey: { d: string; n: string };
}

export interface EncryptTraceRow {
  index: number;
  character: string;
  codePoint: string;
  ciphertext: string;
}

export interface DecryptTraceRow {
  index: number;
  ciphertext: string;
  codePoint: string;
  character: string;
}

export interface TeachingEncryptResponse {
  ciphertext: string[];
  display: string;
  trace: EncryptTraceRow[];
}

export interface TeachingDecryptResponse {
  message: string;
  trace: DecryptTraceRow[];
}

export type TeachingErrorField = KeyField | "d" | "n" | "text" | "ciphertext" | "body";

export interface TeachingValidationError {
  field: TeachingErrorField;
  code: string;
  message: string;
  index?: number;
}

export interface TeachingErrorResponse {
  errors: TeachingValidationError[];
}
