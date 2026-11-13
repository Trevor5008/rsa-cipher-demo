import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FIXTURE_KEY } from "../fixtures/teaching";
import { TeachingValidationFailure } from "../services/teachingAPI";
import { TEXTBOOK_KEY, createFakeAPI, deferred } from "../test/teachingFakes";
import type { TeachingKey } from "../types/teaching";
import { DERIVE_DELAY_MS, KEY_PRESETS, REQUEST_ERROR_MESSAGE, useKeyPair } from "./useKeyPair";

const advance = (ms = 0) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });

describe("useKeyPair", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("derives the default Bigger primes key on mount", async () => {
    const api = createFakeAPI();
    const { result } = renderHook(() => useKeyPair(api));

    expect(result.current).toMatchObject({ presetId: "bigger", status: "loading", key: null });
    expect(result.current.fields).toEqual(KEY_PRESETS.bigger.fields);

    await advance();

    expect(result.current).toMatchObject({ status: "valid", key: FIXTURE_KEY });
    expect(api.deriveKey).toHaveBeenCalledTimes(1);
    expect(api.deriveKey).toHaveBeenCalledWith({ p: "1009", q: "1013", e: "65537" }, expect.any(AbortSignal));
  });

  it("selecting a preset sets p, q, e and re-derives without waiting for the debounce", async () => {
    const api = createFakeAPI();
    const { result } = renderHook(() => useKeyPair(api));
    await advance();

    act(() => result.current.selectPreset("textbook"));

    expect(result.current).toMatchObject({
      presetId: "textbook",
      fields: { p: "61", q: "53", e: "17" },
      status: "loading",
      key: null,
    });

    await advance();
    expect(result.current).toMatchObject({ status: "valid", key: TEXTBOOK_KEY });
  });

  it("editing switches to custom, clears derived values at once, and debounces the request", async () => {
    const api = createFakeAPI();
    const { result } = renderHook(() => useKeyPair(api));
    await advance();
    api.deriveKey.mockClear();

    act(() => result.current.updateField("p", "6"));
    expect(result.current).toMatchObject({ presetId: "custom", status: "loading", key: null });

    await advance(DERIVE_DELAY_MS - 50);
    act(() => result.current.updateField("p", "61"));
    await advance(DERIVE_DELAY_MS - 50);
    expect(api.deriveKey).not.toHaveBeenCalled();

    act(() => result.current.updateField("q", "53"));
    act(() => result.current.updateField("e", "17"));
    await advance(DERIVE_DELAY_MS);

    expect(api.deriveKey).toHaveBeenCalledTimes(1);
    expect(api.deriveKey).toHaveBeenCalledWith({ p: "61", q: "53", e: "17" }, expect.any(AbortSignal));
    expect(result.current).toMatchObject({ presetId: "custom", status: "valid", key: TEXTBOOK_KEY });
  });

  it("never lets an older slow response overwrite a newer one", async () => {
    const first = deferred<TeachingKey>();
    const second = deferred<TeachingKey>();
    const api = createFakeAPI();
    api.deriveKey.mockImplementationOnce(() => first.promise).mockImplementationOnce(() => second.promise);

    const { result } = renderHook(() => useKeyPair(api));
    await advance();
    const firstSignal = api.deriveKey.mock.calls[0][1] as AbortSignal;

    act(() => result.current.selectPreset("textbook"));
    await advance();
    expect(firstSignal.aborted).toBe(true);

    await act(async () => second.resolve(TEXTBOOK_KEY));
    await act(async () => first.resolve(FIXTURE_KEY));

    expect(result.current).toMatchObject({ status: "valid", key: TEXTBOOK_KEY, fields: KEY_PRESETS.textbook.fields });
  });

  it("maps validation failures to inline field errors and keeps them while revalidating", async () => {
    const api = createFakeAPI(async () => {
      throw new TeachingValidationFailure([
        { field: "p", code: "not_prime", message: "p = 12 is not a prime number." },
        { field: "e", code: "missing", message: "e is required." },
      ]);
    });
    const { result } = renderHook(() => useKeyPair(api));
    await advance();

    expect(result.current).toMatchObject({
      status: "invalid",
      key: null,
      fieldErrors: { p: "p = 12 is not a prime number.", e: "e is required." },
      requestError: null,
    });

    act(() => result.current.updateField("p", "13"));
    expect(result.current.status).toBe("loading");
    expect(result.current.fieldErrors.p).toBe("p = 12 is not a prime number.");
    expect(result.current.fields.p).toBe("13");
  });

  it("reports request failures without touching the inputs, and retries on demand", async () => {
    const api = createFakeAPI();
    api.deriveKey.mockRejectedValueOnce(new Error("Network Error"));
    const { result } = renderHook(() => useKeyPair(api));
    await advance();

    expect(result.current).toMatchObject({
      status: "error",
      key: null,
      requestError: REQUEST_ERROR_MESSAGE,
      fields: KEY_PRESETS.bigger.fields,
    });

    act(() => result.current.retry());
    expect(result.current).toMatchObject({ status: "loading", requestError: null });

    await advance();
    expect(result.current).toMatchObject({ status: "valid", key: FIXTURE_KEY });
  });

  it("treats a validation failure without key-field errors as a request failure", async () => {
    const api = createFakeAPI(async () => {
      throw new TeachingValidationFailure([{ field: "body", code: "invalid_body", message: "Bad body." }]);
    });
    const { result } = renderHook(() => useKeyPair(api));
    await advance();

    expect(result.current).toMatchObject({ status: "error", requestError: REQUEST_ERROR_MESSAGE, fieldErrors: {} });
  });
});
