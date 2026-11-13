import axios, { AxiosError, AxiosHeaders, type AxiosResponse } from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FIXTURE_KEY } from "../fixtures/teaching";
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
