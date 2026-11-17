import axios, { AxiosError, AxiosHeaders, type AxiosResponse } from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FIXTURE_DECRYPT, FIXTURE_ENCRYPT, FIXTURE_KEY } from "../fixtures/teaching";
import { TeachingValidationFailure, createTeachingAPI } from "./teachingAPI";

const errorResponse = (status: number, data: unknown): AxiosError =>
  new AxiosError("Request failed", "ERR_BAD_REQUEST", undefined, undefined, {
    status,
    statusText: "",
    data,
    headers: {},
    config: { headers: new AxiosHeaders() },
  } as AxiosResponse);

describe("createTeachingAPI().deriveKey", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("posts the key fields as decimal strings and returns the key", async () => {
    const post = vi.spyOn(axios, "post").mockResolvedValue({ data: FIXTURE_KEY });
    const signal = new AbortController().signal;

    const key = await createTeachingAPI("http://api.test").deriveKey({ p: "1009", q: "1013", e: "65537" }, signal);

    expect(key).toEqual(FIXTURE_KEY);
    expect(post).toHaveBeenCalledWith(
      "http://api.test/teaching/keys",
      { p: "1009", q: "1013", e: "65537" },
      { signal },
    );
  });

  it("maps a 400 response to a TeachingValidationFailure with field errors", async () => {
    const errors = [
      { field: "p", code: "not_prime", message: "p = 12 is not a prime number." },
      { field: "e", code: "missing", message: "e is required." },
    ];
    vi.spyOn(axios, "post").mockRejectedValue(errorResponse(400, { errors }));

    const failure = await createTeachingAPI("").deriveKey({ p: "12", q: "13", e: "" }).catch((error) => error);

    expect(failure).toBeInstanceOf(TeachingValidationFailure);
    expect((failure as TeachingValidationFailure).errors).toEqual(errors);
  });

  it.each([
    ["a server error", errorResponse(500, "Internal Server Error")],
    ["a 400 without structured errors", errorResponse(400, { error: "bad" })],
    ["a network failure", new AxiosError("Network Error", "ERR_NETWORK")],
  ])("rethrows %s unchanged", async (_label, error) => {
    vi.spyOn(axios, "post").mockRejectedValue(error);

    const failure = await createTeachingAPI("").deriveKey({ p: "61", q: "53", e: "17" }).catch((caught) => caught);

    expect(failure).toBe(error);
    expect(failure).not.toBeInstanceOf(TeachingValidationFailure);
  });
});

describe("createTeachingAPI().encrypt", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("posts text and the public key as decimal strings and returns the encrypt response", async () => {
    const post = vi.spyOn(axios, "post").mockResolvedValue({ data: FIXTURE_ENCRYPT });
    const signal = new AbortController().signal;

    const result = await createTeachingAPI("http://api.test").encrypt("test", "65537", "1022117", signal);

    expect(result).toEqual(FIXTURE_ENCRYPT);
    expect(post).toHaveBeenCalledWith(
      "http://api.test/teaching/encrypt",
      { text: "test", e: "65537", n: "1022117" },
      { signal },
    );
  });

  it("maps a 400 response to a TeachingValidationFailure", async () => {
    const errors = [
      {
        field: "text",
        code: "unsupported_character",
        message: 'Character 3 ("😀", code point 128512) is too large for this key: code points must be smaller than n = 3233.',
        index: 3,
      },
    ];
    vi.spyOn(axios, "post").mockRejectedValue(errorResponse(400, { errors }));

    const failure = await createTeachingAPI("").encrypt("hi😀", "17", "3233").catch((error) => error);

    expect(failure).toBeInstanceOf(TeachingValidationFailure);
    expect((failure as TeachingValidationFailure).errors).toEqual(errors);
  });
});

describe("createTeachingAPI().decrypt", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("posts ciphertext and the private key as decimal strings and returns the decrypt response", async () => {
    const post = vi.spyOn(axios, "post").mockResolvedValue({ data: FIXTURE_DECRYPT });
    const signal = new AbortController().signal;

    const result = await createTeachingAPI("http://api.test").decrypt(
      "924799 621270 2637 924799",
      "832193",
      "1022117",
      signal,
    );

    expect(result).toEqual(FIXTURE_DECRYPT);
    expect(post).toHaveBeenCalledWith(
      "http://api.test/teaching/decrypt",
      { ciphertext: "924799 621270 2637 924799", d: "832193", n: "1022117" },
      { signal },
    );
  });

  it("maps a 400 response to a TeachingValidationFailure", async () => {
    const errors = [
      {
        field: "ciphertext",
        code: "not_integer",
        message: 'Value 2 ("abc") must be a non-negative whole number written with the digits 0-9.',
        index: 2,
      },
    ];
    vi.spyOn(axios, "post").mockRejectedValue(errorResponse(400, { errors }));

    const failure = await createTeachingAPI("")
      .decrypt("924799 abc", "832193", "1022117")
      .catch((error) => error);

    expect(failure).toBeInstanceOf(TeachingValidationFailure);
    expect((failure as TeachingValidationFailure).errors).toEqual(errors);
  });
});
