import { vi } from "vitest";
import { FIXTURE_DECRYPT, FIXTURE_ENCRYPT, FIXTURE_KEY } from "../fixtures/teaching";
import { TeachingValidationFailure, type TeachingAPI } from "../services/teachingAPI";
import type {
  KeyFields,
  TeachingDecryptResponse,
  TeachingEncryptResponse,
  TeachingKey,
} from "../types/teaching";

export const TEXTBOOK_KEY: TeachingKey = {
  p: "61",
  q: "53",
  e: "17",
  n: "3233",
  phi: "3120",
  d: "2753",
  publicKey: { e: "17", n: "3233" },
  privateKey: { d: "2753", n: "3233" },
};

const sameFields = (fields: KeyFields, key: TeachingKey) =>
  fields.p === key.p && fields.q === key.q && fields.e === key.e;

/** Resolves the two preset keys and rejects anything else with a validation failure on p. */
export const deriveKnownKey = async (fields: KeyFields): Promise<TeachingKey> => {
  for (const key of [FIXTURE_KEY, TEXTBOOK_KEY]) {
    if (sameFields(fields, key)) return key;
  }
  throw new TeachingValidationFailure([
    { field: "p", code: "not_prime", message: `p = ${fields.p} is not a prime number.` },
  ]);
};

/** Returns the shared fixture for Bigger primes + "test"; other inputs get a simple synthetic response. */
export const encryptKnownText = async (
  text: string,
  e: string,
  n: string,
): Promise<TeachingEncryptResponse> => {
  if (text === "test" && e === FIXTURE_KEY.e && n === FIXTURE_KEY.n) {
    return FIXTURE_ENCRYPT;
  }

  if (text === "test" && e === TEXTBOOK_KEY.e && n === TEXTBOOK_KEY.n) {
    return {
      ciphertext: ["855", "110", "2159", "855"],
      display: "855 110 2159 855",
      trace: [
        { index: 1, character: "t", codePoint: "116", ciphertext: "855" },
        { index: 2, character: "e", codePoint: "101", ciphertext: "110" },
        { index: 3, character: "s", codePoint: "115", ciphertext: "2159" },
        { index: 4, character: "t", codePoint: "116", ciphertext: "855" },
      ],
    };
  }

  const codePoints = Array.from(text).map((character) => character.codePointAt(0)!);
  const modulus = Number(n);
  const firstUnsupported = codePoints.findIndex((codePoint) => codePoint >= modulus);
  if (firstUnsupported >= 0) {
    const character = Array.from(text)[firstUnsupported];
    const codePoint = codePoints[firstUnsupported];
    throw new TeachingValidationFailure([
      {
        field: "text",
        code: "unsupported_character",
        message:
          `Character ${firstUnsupported + 1} ("${character}", code point ${codePoint}) is too large for this key: ` +
          `code points must be smaller than n = ${n}.`,
        index: firstUnsupported + 1,
      },
    ]);
  }

  const ciphertext = codePoints.map((codePoint) => String((codePoint * 7) % modulus));
  return {
    ciphertext,
    display: ciphertext.join(" "),
    trace: Array.from(text).map((character, index) => ({
      index: index + 1,
      character,
      codePoint: String(codePoints[index]),
      ciphertext: ciphertext[index],
    })),
  };
};

/** Returns the shared fixture for Bigger primes + the fixture display; validates tokens otherwise. */
export const decryptKnownText = async (
  ciphertext: string,
  d: string,
  n: string,
): Promise<TeachingDecryptResponse> => {
  const tokens = ciphertext.split(/\s+/).filter(Boolean);
  const modulus = Number(n);

  for (const [offset, token] of tokens.entries()) {
    const index = offset + 1;
    if (!/^[0-9]+$/.test(token)) {
      throw new TeachingValidationFailure([
        {
          field: "ciphertext",
          code: "not_integer",
          message: `Value ${index} ("${token}") must be a non-negative whole number written with the digits 0-9.`,
          index,
        },
      ]);
    }
    if (Number(token) >= modulus) {
      throw new TeachingValidationFailure([
        {
          field: "ciphertext",
          code: "out_of_range",
          message: `Value ${index} must be smaller than n = ${n}.`,
          index,
        },
      ]);
    }
  }

  const normalized = tokens.join(" ");
  if (normalized === FIXTURE_ENCRYPT.display && d === FIXTURE_KEY.d && n === FIXTURE_KEY.n) {
    return FIXTURE_DECRYPT;
  }

  if (normalized === "855 110 2159 855" && d === TEXTBOOK_KEY.d && n === TEXTBOOK_KEY.n) {
    return {
      message: "test",
      trace: [
        { index: 1, ciphertext: "855", codePoint: "116", character: "t" },
        { index: 2, ciphertext: "110", codePoint: "101", character: "e" },
        { index: 3, ciphertext: "2159", codePoint: "115", character: "s" },
        { index: 4, ciphertext: "855", codePoint: "116", character: "t" },
      ],
    };
  }

  // Synthetic invertible mapping for other ASCII-range tests: m = c / 7 when divisible.
  const codePoints = tokens.map((token) => {
    const value = Number(token);
    return value % 7 === 0 ? value / 7 : value % 128;
  });
  if (codePoints.some((codePoint) => codePoint > 0x10ffff || (codePoint >= 0xd800 && codePoint <= 0xdfff))) {
    const index = codePoints.findIndex(
      (codePoint) => codePoint > 0x10ffff || (codePoint >= 0xd800 && codePoint <= 0xdfff),
    ) + 1;
    throw new TeachingValidationFailure([
      {
        field: "ciphertext",
        code: "invalid_code_point",
        message: `Value ${index} decrypts to a number that is not a valid Unicode character.`,
        index,
      },
    ]);
  }

  const characters = codePoints.map((codePoint) => String.fromCodePoint(codePoint));
  return {
    message: characters.join(""),
    trace: tokens.map((token, offset) => ({
      index: offset + 1,
      ciphertext: token,
      codePoint: String(codePoints[offset]),
      character: characters[offset],
    })),
  };
};

export const createFakeAPI = (
  deriveKey: TeachingAPI["deriveKey"] = deriveKnownKey,
  encrypt: TeachingAPI["encrypt"] = encryptKnownText,
  decrypt: TeachingAPI["decrypt"] = decryptKnownText,
) => {
  const api = {
    deriveKey: vi.fn(deriveKey),
    encrypt: vi.fn(encrypt),
    decrypt: vi.fn(decrypt),
  };
  return api satisfies TeachingAPI;
};

export interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
}

export const deferred = <T>(): Deferred<T> => {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};
