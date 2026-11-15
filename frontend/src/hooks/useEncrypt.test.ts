import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FIXTURE_ENCRYPT } from "../fixtures/teaching";
import { TeachingValidationFailure } from "../services/teachingAPI";
import { createFakeAPI, deferred, encryptKnownText } from "../test/teachingFakes";
import type { TeachingEncryptResponse } from "../types/teaching";
import { ENCRYPT_ERROR_MESSAGE, LIVE_REQUEST_DELAY_MS, useEncrypt } from "./useEncrypt";

const advance = (ms = 0) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });

describe("useEncrypt", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("encrypts the fixture message as soon as a valid key is available", async () => {
    const api = createFakeAPI();
    const { result } = renderHook(() =>
      useEncrypt({ api, enabled: true, text: "test", e: "65537", n: "1022117" }),
    );

    expect(result.current).toMatchObject({ status: "loading", result: null });
    await advance();
    expect(result.current).toMatchObject({ status: "ready", result: FIXTURE_ENCRYPT });
    expect(api.encrypt).toHaveBeenCalledTimes(1);
    expect(api.encrypt).toHaveBeenCalledWith("test", "65537", "1022117", expect.any(AbortSignal));
  });

  it("skips the API for empty plaintext and shows the empty state", async () => {
    const api = createFakeAPI();
    const { result, rerender } = renderHook(
      ({ text }) => useEncrypt({ api, enabled: true, text, e: "65537", n: "1022117" }),
      { initialProps: { text: "test" } },
    );
    await advance();
    api.encrypt.mockClear();

    rerender({ text: "" });
    await advance();

    expect(result.current).toMatchObject({ status: "empty", result: null, error: null });
    expect(api.encrypt).not.toHaveBeenCalled();
  });

  it("debounces typing and only sends the latest text", async () => {
    const api = createFakeAPI();
    const { result, rerender } = renderHook(
      ({ text }) => useEncrypt({ api, enabled: true, text, e: "65537", n: "1022117" }),
      { initialProps: { text: "te" } },
    );
    await advance();
    api.encrypt.mockClear();

    rerender({ text: "tes" });
    await advance(LIVE_REQUEST_DELAY_MS - 50);
    expect(api.encrypt).not.toHaveBeenCalled();

    rerender({ text: "test" });
    await advance(LIVE_REQUEST_DELAY_MS);

    expect(api.encrypt).toHaveBeenCalledTimes(1);
    expect(api.encrypt).toHaveBeenCalledWith("test", "65537", "1022117", expect.any(AbortSignal));
    expect(result.current).toMatchObject({ status: "ready", result: FIXTURE_ENCRYPT });
  });

  it("never lets an older slow response overwrite a newer one", async () => {
    const first = deferred<TeachingEncryptResponse>();
    const second = deferred<TeachingEncryptResponse>();
    const api = createFakeAPI(undefined, () => first.promise);
    api.encrypt.mockImplementationOnce(() => first.promise).mockImplementationOnce(() => second.promise);

    const { result, rerender } = renderHook(
      ({ text }) => useEncrypt({ api, enabled: true, text, e: "65537", n: "1022117" }),
      { initialProps: { text: "a" } },
    );
    await advance();
    const firstSignal = api.encrypt.mock.calls[0][3] as AbortSignal;

    rerender({ text: "ab" });
    await advance(LIVE_REQUEST_DELAY_MS);
    expect(firstSignal.aborted).toBe(true);

    const latest: TeachingEncryptResponse = {
      ciphertext: ["1", "2"],
      display: "1 2",
      trace: [
        { index: 1, character: "a", codePoint: "97", ciphertext: "1" },
        { index: 2, character: "b", codePoint: "98", ciphertext: "2" },
      ],
    };
    await act(async () => second.resolve(latest));
    await act(async () => first.resolve(FIXTURE_ENCRYPT));

    expect(result.current).toMatchObject({ status: "ready", result: latest });
  });

  it("maps unsupported characters to an invalid state without clearing inputs", async () => {
    const api = createFakeAPI(undefined, encryptKnownText);
    const { result } = renderHook(() =>
      useEncrypt({ api, enabled: true, text: "hi😀", e: "17", n: "3233" }),
    );
    await advance();

    expect(result.current.status).toBe("invalid");
    expect(result.current.result).toBeNull();
    expect(result.current.error).toMatch(/Character 3/);
    expect(result.current.error).toMatch(/3233/);
  });

  it("reports request failures and recovers on retry", async () => {
    const api = createFakeAPI();
    api.encrypt.mockRejectedValueOnce(new Error("Network Error"));
    const { result } = renderHook(() =>
      useEncrypt({ api, enabled: true, text: "test", e: "65537", n: "1022117" }),
    );
    await advance();

    expect(result.current).toMatchObject({ status: "error", result: null, error: ENCRYPT_ERROR_MESSAGE });

    act(() => result.current.retry());
    expect(result.current).toMatchObject({ status: "loading", error: null });
    await advance();
    expect(result.current).toMatchObject({ status: "ready", result: FIXTURE_ENCRYPT });
  });

  it("stays idle when encryption is disabled and clears the previous result", async () => {
    const api = createFakeAPI();
    const { result, rerender } = renderHook(
      ({ enabled }) => useEncrypt({ api, enabled, text: "test", e: "65537", n: "1022117" }),
      { initialProps: { enabled: true } },
    );
    await advance();
    expect(result.current.status).toBe("ready");

    rerender({ enabled: false });
    expect(result.current).toMatchObject({ status: "idle", result: null });
  });

  it("treats a validation failure without a text field error as a request failure", async () => {
    const api = createFakeAPI(undefined, async () => {
      throw new TeachingValidationFailure([{ field: "body", code: "invalid_body", message: "Bad body." }]);
    });
    const { result } = renderHook(() =>
      useEncrypt({ api, enabled: true, text: "test", e: "65537", n: "1022117" }),
    );
    await advance();

    expect(result.current).toMatchObject({ status: "error", error: ENCRYPT_ERROR_MESSAGE });
  });
});
