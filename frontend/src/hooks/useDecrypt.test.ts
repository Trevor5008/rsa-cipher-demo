import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FIXTURE_DECRYPT, FIXTURE_ENCRYPT } from "../fixtures/teaching";
import { TeachingValidationFailure } from "../services/teachingAPI";
import { createFakeAPI, decryptKnownText, deferred } from "../test/teachingFakes";
import type { TeachingDecryptResponse } from "../types/teaching";
import { LIVE_REQUEST_DELAY_MS } from "./useEncrypt";
import { DECRYPT_ERROR_MESSAGE, useDecrypt } from "./useDecrypt";

const advance = (ms = 0) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });

const FIXTURE_DISPLAY = FIXTURE_ENCRYPT.display;

describe("useDecrypt", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("decrypts the fixture ciphertext as soon as a valid key is available", async () => {
    const api = createFakeAPI();
    const { result } = renderHook(() =>
      useDecrypt({ api, enabled: true, ciphertext: FIXTURE_DISPLAY, d: "832193", n: "1022117" }),
    );

    expect(result.current).toMatchObject({ status: "loading", result: null });
    await advance();
    expect(result.current).toMatchObject({ status: "ready", result: FIXTURE_DECRYPT });
    expect(api.decrypt).toHaveBeenCalledTimes(1);
    expect(api.decrypt).toHaveBeenCalledWith(FIXTURE_DISPLAY, "832193", "1022117", expect.any(AbortSignal));
  });

  it("skips the API for empty or whitespace-only ciphertext", async () => {
    const api = createFakeAPI();
    const { result, rerender } = renderHook(
      ({ ciphertext }) => useDecrypt({ api, enabled: true, ciphertext, d: "832193", n: "1022117" }),
      { initialProps: { ciphertext: FIXTURE_DISPLAY } },
    );
    await advance();
    api.decrypt.mockClear();

    rerender({ ciphertext: "" });
    await advance();
    expect(result.current).toMatchObject({ status: "empty", result: null, error: null });
    expect(api.decrypt).not.toHaveBeenCalled();

    rerender({ ciphertext: "  \n\t  " });
    await advance();
    expect(result.current).toMatchObject({ status: "empty", result: null });
    expect(api.decrypt).not.toHaveBeenCalled();
  });

  it("debounces typing and only sends the latest ciphertext", async () => {
    const api = createFakeAPI();
    const { result, rerender } = renderHook(
      ({ ciphertext }) => useDecrypt({ api, enabled: true, ciphertext, d: "832193", n: "1022117" }),
      { initialProps: { ciphertext: "924799" } },
    );
    await advance();
    api.decrypt.mockClear();

    rerender({ ciphertext: "924799 621270" });
    await advance(LIVE_REQUEST_DELAY_MS - 50);
    expect(api.decrypt).not.toHaveBeenCalled();

    rerender({ ciphertext: FIXTURE_DISPLAY });
    await advance(LIVE_REQUEST_DELAY_MS);

    expect(api.decrypt).toHaveBeenCalledTimes(1);
    expect(api.decrypt).toHaveBeenCalledWith(FIXTURE_DISPLAY, "832193", "1022117", expect.any(AbortSignal));
    expect(result.current).toMatchObject({ status: "ready", result: FIXTURE_DECRYPT });
  });

  it("never lets an older slow response overwrite a newer one", async () => {
    const first = deferred<TeachingDecryptResponse>();
    const second = deferred<TeachingDecryptResponse>();
    const api = createFakeAPI();
    api.decrypt.mockImplementationOnce(() => first.promise).mockImplementationOnce(() => second.promise);

    const { result, rerender } = renderHook(
      ({ ciphertext }) => useDecrypt({ api, enabled: true, ciphertext, d: "832193", n: "1022117" }),
      { initialProps: { ciphertext: "1" } },
    );
    await advance();
    const firstSignal = api.decrypt.mock.calls[0][3] as AbortSignal;

    rerender({ ciphertext: "1 2" });
    await advance(LIVE_REQUEST_DELAY_MS);
    expect(firstSignal.aborted).toBe(true);

    const latest: TeachingDecryptResponse = {
      message: "ab",
      trace: [
        { index: 1, ciphertext: "1", codePoint: "97", character: "a" },
        { index: 2, ciphertext: "2", codePoint: "98", character: "b" },
      ],
    };
    await act(async () => second.resolve(latest));
    await act(async () => first.resolve(FIXTURE_DECRYPT));

    expect(result.current).toMatchObject({ status: "ready", result: latest });
  });

  it("maps bad tokens to an invalid state without clearing inputs", async () => {
    const api = createFakeAPI(undefined, undefined, decryptKnownText);
    const { result } = renderHook(() =>
      useDecrypt({ api, enabled: true, ciphertext: "924799 abc", d: "832193", n: "1022117" }),
    );
    await advance();

    expect(result.current.status).toBe("invalid");
    expect(result.current.result).toBeNull();
    expect(result.current.error).toMatch(/Value 2/);
  });

  it("reports request failures and recovers on retry", async () => {
    const api = createFakeAPI();
    api.decrypt.mockRejectedValueOnce(new Error("Network Error"));
    const { result } = renderHook(() =>
      useDecrypt({ api, enabled: true, ciphertext: FIXTURE_DISPLAY, d: "832193", n: "1022117" }),
    );
    await advance();

    expect(result.current).toMatchObject({ status: "error", result: null, error: DECRYPT_ERROR_MESSAGE });

    act(() => result.current.retry());
    expect(result.current).toMatchObject({ status: "loading", error: null });
    await advance();
    expect(result.current).toMatchObject({ status: "ready", result: FIXTURE_DECRYPT });
  });

  it("stays idle when decryption is disabled and clears the previous result", async () => {
    const api = createFakeAPI();
    const { result, rerender } = renderHook(
      ({ enabled }) => useDecrypt({ api, enabled, ciphertext: FIXTURE_DISPLAY, d: "832193", n: "1022117" }),
      { initialProps: { enabled: true } },
    );
    await advance();
    expect(result.current.status).toBe("ready");

    rerender({ enabled: false });
    expect(result.current).toMatchObject({ status: "idle", result: null });
  });

  it("treats a validation failure without a ciphertext field error as a request failure", async () => {
    const api = createFakeAPI(undefined, undefined, async () => {
      throw new TeachingValidationFailure([{ field: "body", code: "invalid_body", message: "Bad body." }]);
    });
    const { result } = renderHook(() =>
      useDecrypt({ api, enabled: true, ciphertext: FIXTURE_DISPLAY, d: "832193", n: "1022117" }),
    );
    await advance();

    expect(result.current).toMatchObject({ status: "error", error: DECRYPT_ERROR_MESSAGE });
  });
});
