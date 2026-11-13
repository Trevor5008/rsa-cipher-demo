import { vi } from "vitest";
import { FIXTURE_KEY } from "../fixtures/teaching";
import { TeachingValidationFailure, type TeachingAPI } from "../services/teachingAPI";
import type { KeyFields, TeachingKey } from "../types/teaching";

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

export const createFakeAPI = (deriveKey: TeachingAPI["deriveKey"] = deriveKnownKey) => {
  const api = { deriveKey: vi.fn(deriveKey) };
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
