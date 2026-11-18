import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import App from "./App";
import { FIXTURE_DECRYPT, FIXTURE_ENCRYPT, FIXTURE_KEY } from "./fixtures/teaching";
import { TeachingValidationFailure } from "./services/teachingAPI";
import {
  TEXTBOOK_KEY,
  createFakeAPI,
  deferred,
  decryptKnownText,
  deriveKnownKey,
  encryptKnownText,
} from "./test/teachingFakes";
import type { TeachingDecryptResponse, TeachingEncryptResponse, TeachingKey } from "./types/teaching";

const renderApp = (api = createFakeAPI()) => {
  const user = userEvent.setup();
  render(<App api={api} />);
  return { api, user };
};

const derivedValue = (term: string) => {
  const row = screen.getByText(term).parentElement as HTMLElement;
  return within(row).getByRole("definition");
};

const keyCard = (name: "Public key" | "Private key") => screen.getByRole("article", { name });

const expectDerived = async (n: string, phi: string, d: string) => {
  expect(await screen.findByText("Key pair ready.")).toBeInTheDocument();
  expect(derivedValue("n = p × q")).toHaveTextContent(n);
  expect(derivedValue("φ(n) = (p−1)(q−1)")).toHaveTextContent(phi);
  expect(derivedValue("d = e⁻¹ mod φ(n)")).toHaveTextContent(d);
};

const expectLiveCiphertext = async (display = FIXTURE_ENCRYPT.display) => {
  await waitFor(() => {
    expect(screen.getByRole("region", { name: "Ciphertext output" })).toHaveTextContent(display);
  });
};

const expectLiveMessage = async (message = FIXTURE_DECRYPT.message) => {
  await waitFor(() => {
    expect(screen.getByRole("region", { name: "Recovered message output" })).toHaveTextContent(message);
  });
};

describe("guided workspace layout", () => {
  it("shows the whole workflow as three numbered cards without any modal", async () => {
    renderApp();
    await expectDerived("1022117", "1020096", "832193");
    await expectLiveCiphertext();

    expect(screen.getAllByRole("region", { name: /^Step \d:/ })).toEqual([
      screen.getByRole("region", { name: "Step 1: Build a key pair" }),
      screen.getByRole("region", { name: "Step 2: Write a message" }),
      screen.getByRole("region", { name: "Step 3: Ciphertext" }),
    ]);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Prime p")).toBeInTheDocument();
    expect(screen.getByLabelText("Plain text to encrypt with the public key")).toBeInTheDocument();
  });

  it("uses a three-column grid from the md breakpoint and stacks in numbered order below it", () => {
    renderApp();
    const cards = screen.getAllByRole("region", { name: /^Step \d:/ });
    const grid = cards[0].parentElement as HTMLElement;

    expect(grid).toHaveClass("grid", "md:grid-cols-3");
    expect(Array.from(grid.children)).toEqual(cards);
    for (const card of cards) {
      expect(card).toHaveClass("min-w-0");
    }

    const keyFields = screen.getByLabelText("Prime p").closest(".grid") as HTMLElement;
    expect(keyFields).toHaveClass("grid-cols-1", "md:grid-cols-3");
  });

  it("announces when ciphertext is ready", async () => {
    renderApp();
    await expectLiveCiphertext();
    expect(await screen.findByText("Ciphertext updated")).toBeInTheDocument();
  });

  it("keeps long integers inside their own regions", async () => {
    const big = "1".repeat(300);
    const longKey: TeachingKey = {
      ...FIXTURE_KEY,
      n: big,
      d: big,
      publicKey: { e: "65537", n: big },
      privateKey: { d: big, n: big },
    };
    const longEncrypt: TeachingEncryptResponse = {
      ...FIXTURE_ENCRYPT,
      display: `${big} ${big}`,
      ciphertext: [big, big],
      trace: [
        { index: 1, character: "t", codePoint: "116", ciphertext: big },
        { index: 2, character: "e", codePoint: "101", ciphertext: big },
      ],
    };
    renderApp(createFakeAPI(async () => longKey, async () => longEncrypt));

    await screen.findByText("Key pair ready.");
    expect(derivedValue("n = p × q")).toHaveClass("break-all", "min-w-0");
    expect(within(keyCard("Public key")).getByText(`(e = 65537, n = ${big})`)).toHaveClass("break-all");
    expect(await screen.findByRole("region", { name: "Ciphertext output" })).toHaveClass("break-all");
    expect(await screen.findByRole("region", { name: "Encryption of each character" })).toHaveClass("overflow-x-auto");
  });

  it("renders the live worked example, trace table, and teaching-mode notice for the test fixture", async () => {
    const { api } = renderApp();
    await expectLiveCiphertext();

    expect(api.encrypt).toHaveBeenCalledWith("test", "65537", "1022117", expect.any(AbortSignal));
    const example = screen.getByText("Worked example: the first character, “t”").closest("figure");
    expect(example).toHaveTextContent("116");
    expect(example).toHaveTextContent("65537");
    expect(example).toHaveTextContent("1022117");
    expect(example).toHaveTextContent("924799");

    const table = screen.getByRole("table", { name: "Encryption of each character" });
    expect(within(table).getAllByRole("row")).toHaveLength(5);
    expect(within(table).getAllByRole("row")[1]).toHaveTextContent("1t116924799");
    expect(screen.getByRole("complementary", { name: "Teaching mode" })).toHaveTextContent(/OAEP/);
    expect(screen.queryByText(/^Sample$/)).not.toBeInTheDocument();
  });
});

describe("key presets and custom values", () => {
  it("starts on the Bigger primes preset and derives n, phi, and d", async () => {
    const { api } = renderApp();

    expect(screen.getByRole("button", { name: "Bigger primes (1009, 1013)" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Textbook (61, 53)" })).toHaveAttribute("aria-pressed", "false");
    await expectDerived("1022117", "1020096", "832193");
    expect(api.deriveKey).toHaveBeenCalledWith({ p: "1009", q: "1013", e: "65537" }, expect.any(AbortSignal));
  });

  it("selecting the Textbook preset updates p, q, e and recalculates the derived values", async () => {
    const { user } = renderApp();
    await screen.findByText("Key pair ready.");

    await user.click(screen.getByRole("button", { name: "Textbook (61, 53)" }));

    expect(screen.getByRole("button", { name: "Textbook (61, 53)" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Bigger primes (1009, 1013)" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByLabelText("Prime p")).toHaveValue("61");
    expect(screen.getByLabelText("Prime q")).toHaveValue("53");
    expect(screen.getByLabelText("Exponent e")).toHaveValue("17");
    await expectDerived(TEXTBOOK_KEY.n, TEXTBOOK_KEY.phi, TEXTBOOK_KEY.d);
    expect(within(keyCard("Private key")).getByText("(d = 2753, n = 3233)")).toBeInTheDocument();
    await expectLiveCiphertext("855 110 2159 855");
  });

  it("editing a field switches to custom values and never shows stale derived values", async () => {
    const { user } = renderApp();
    await screen.findByText("Key pair ready.");

    await user.clear(screen.getByLabelText("Exponent e"));

    expect(screen.getByText("Custom values")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bigger primes (1009, 1013)" })).toHaveAttribute("aria-pressed", "false");
    expect(derivedValue("n = p × q")).not.toHaveTextContent("1022117");
    expect(within(keyCard("Public key")).getByText("Waiting for a valid key pair")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Exponent e"), "65537");
    await expectDerived("1022117", "1020096", "832193");
    expect(screen.getByText("Custom values")).toBeInTheDocument();
  });
});

describe("validation, loading, and failure states", () => {
  it("shows specific inline errors, blocks the output, and keeps every input editable", async () => {
    const api = createFakeAPI(async (fields) => {
      if (fields.p === "1009") return deriveKnownKey(fields);
      throw new TeachingValidationFailure([
        { field: "p", code: "not_prime", message: `p = ${fields.p} is not a prime number.` },
      ]);
    });
    const { user } = renderApp(api);
    await expectLiveCiphertext();

    const p = screen.getByLabelText("Prime p");
    await user.clear(p);
    await user.type(p, "12");

    expect(await screen.findByText("p = 12 is not a prime number.")).toBeInTheDocument();
    expect(p).toHaveAttribute("aria-invalid", "true");
    expect(p).toHaveAccessibleDescription("p = 12 is not a prime number.");
    expect(p).toBeEnabled();
    expect(screen.getByLabelText("Prime q")).not.toHaveAttribute("aria-invalid");
    expect(screen.getByText("Fix the highlighted values to build a key pair.")).toBeInTheDocument();

    expect(screen.getByRole("region", { name: "Ciphertext output" })).toHaveTextContent("Waiting for a valid key pair.");
    const message = screen.getByLabelText("Plain text to encrypt with the public key");
    expect(message).toHaveAccessibleDescription("Build a valid key pair in step 1 to encrypt this message.");
    expect(message).toHaveValue("test");
    expect(message).toBeEnabled();

    await user.clear(p);
    await user.type(p, "1009");
    await expectDerived("1022117", "1020096", "832193");
    expect(p).not.toHaveAttribute("aria-invalid");
    await expectLiveCiphertext();
  });

  it("announces loading while the key is being derived", async () => {
    const pending = deferred<TeachingKey>();
    renderApp(createFakeAPI(() => pending.promise));

    expect(screen.getByText("Calculating the key pair…")).toBeInTheDocument();
    expect(derivedValue("n = p × q")).toHaveTextContent("Calculating…");
    expect(screen.getByLabelText("Prime p")).toHaveValue("1009");

    pending.resolve(FIXTURE_KEY);
    await expectDerived("1022117", "1020096", "832193");
  });

  it("reports an API failure without clearing inputs and recovers on retry", async () => {
    const api = createFakeAPI();
    api.deriveKey.mockRejectedValueOnce(new Error("Network Error"));
    const { user } = renderApp(api);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("couldn't reach the key service");
    expect(screen.getByLabelText("Prime p")).toHaveValue("1009");
    expect(screen.getByLabelText("Prime q")).toHaveValue("1013");
    expect(screen.getByLabelText("Exponent e")).toHaveValue("65537");
    expect(screen.getByRole("region", { name: "Ciphertext output" })).toHaveTextContent("Waiting for a valid key pair.");

    await user.click(within(alert).getByRole("button", { name: "Try again" }));

    await expectDerived("1022117", "1020096", "832193");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

describe("live encryption", () => {
  it("shows an empty instructional state without calling encrypt when plaintext is cleared", async () => {
    const { api, user } = renderApp();
    await expectLiveCiphertext();
    api.encrypt.mockClear();

    await user.click(screen.getByRole("button", { name: "Clear" }));

    expect(screen.getByLabelText("Plain text to encrypt with the public key")).toHaveValue("");
    expect(screen.getByRole("region", { name: "Ciphertext output" })).toHaveTextContent(
      "Type a message to see each character encrypted.",
    );
    expect(screen.getByText(/worked example and table appear here/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bigger primes (1009, 1013)" })).toHaveAttribute("aria-pressed", "true");
    expect(derivedValue("n = p × q")).toHaveTextContent("1022117");
    expect(api.encrypt).not.toHaveBeenCalled();
  });

  it("shows unsupported-character feedback without erasing the plaintext or key", async () => {
    const { user } = renderApp();
    await expectLiveCiphertext();

    await user.click(screen.getByRole("button", { name: "Textbook (61, 53)" }));
    await expectDerived(TEXTBOOK_KEY.n, TEXTBOOK_KEY.phi, TEXTBOOK_KEY.d);
    await expectLiveCiphertext("855 110 2159 855");

    const message = screen.getByLabelText("Plain text to encrypt with the public key");
    fireEvent.change(message, { target: { value: "hi😀" } });

    expect(await screen.findAllByText(/Character 3/)).not.toHaveLength(0);
    expect(message).toHaveValue("hi😀");
    expect(message).toHaveAttribute("aria-invalid", "true");
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/too large for this key/);
    expect(alert).not.toHaveTextContent("855 110 2159 855");
    expect(screen.getByLabelText("Prime p")).toHaveValue("61");
    expect(derivedValue("n = p × q")).toHaveTextContent("3233");
  });

  it("ignores a late response for older plaintext", async () => {
    const first = deferred<TeachingEncryptResponse>();
    const second = deferred<TeachingEncryptResponse>();
    const api = createFakeAPI();
    api.encrypt
      .mockImplementationOnce(() => first.promise)
      .mockImplementationOnce(() => second.promise)
      .mockImplementation(encryptKnownText);

    renderApp(api);
    await screen.findByText("Encrypting…");
    const firstSignal = api.encrypt.mock.calls[0][3] as AbortSignal;

    const message = screen.getByLabelText("Plain text to encrypt with the public key");
    fireEvent.change(message, { target: { value: "" } });
    await screen.findByText("Type a message to see each character encrypted.");
    expect(firstSignal.aborted).toBe(true);

    fireEvent.change(message, { target: { value: "ok" } });
    await waitFor(() => expect(api.encrypt).toHaveBeenCalledTimes(2));

    const latest: TeachingEncryptResponse = {
      ciphertext: ["1", "2"],
      display: "1 2",
      trace: [
        { index: 1, character: "o", codePoint: "111", ciphertext: "1" },
        { index: 2, character: "k", codePoint: "107", ciphertext: "2" },
      ],
    };
    second.resolve(latest);
    first.resolve(FIXTURE_ENCRYPT);

    await expectLiveCiphertext("1 2");
    const table = screen.getByRole("table", { name: "Encryption of each character" });
    expect(within(table).getAllByRole("row")[1]).toHaveTextContent("1o1111");
    expect(within(table).getAllByRole("row")[2]).toHaveTextContent("2k1072");
  });

  it("copies only the ciphertext and announces success without moving focus", async () => {
    renderApp();
    await expectLiveCiphertext();

    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      writable: true,
      value: { writeText },
    });

    const copy = screen.getByRole("button", { name: "Copy" });
    expect(copy).toBeEnabled();
    copy.focus();
    fireEvent.click(copy);

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(FIXTURE_ENCRYPT.display));
    expect(screen.getByText("Ciphertext copied")).toBeInTheDocument();
    expect(document.activeElement).toBe(copy);
  });

  it("Decrypt this switches to Decrypt mode and carries the live ciphertext", async () => {
    const { user } = renderApp();
    await expectLiveCiphertext();

    await user.click(screen.getByRole("button", { name: "Decrypt this →" }));

    expect(screen.getByRole("radio", { name: "Decrypt" })).toBeChecked();
    expect(screen.getByLabelText("Numbers separated by spaces, to decrypt with the private key")).toHaveValue(
      FIXTURE_ENCRYPT.display,
    );
    await expectLiveMessage("test");
    expect(await screen.findByRole("table", { name: "Decryption of each value" })).toBeInTheDocument();
    expect(screen.getByRole("complementary", { name: "Teaching mode" })).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "Encrypt" }));
    expect(screen.getByLabelText("Plain text to encrypt with the public key")).toHaveValue("test");
    await expectLiveCiphertext();
  });

  it("reports encrypt request failures with retry and keeps the plaintext", async () => {
    const api = createFakeAPI();
    api.encrypt.mockRejectedValueOnce(new Error("Network Error"));
    const { user } = renderApp(api);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("couldn't encrypt");
    expect(screen.getByLabelText("Plain text to encrypt with the public key")).toHaveValue("test");
    expect(screen.getByLabelText("Prime p")).toHaveValue("1009");

    await user.click(within(alert).getByRole("button", { name: "Try again" }));
    await expectLiveCiphertext();
  });
});

describe("mode switch", () => {
  it("moves the In use badge from the public key to the private key and updates the panels", async () => {
    const { user } = renderApp();
    await expectLiveCiphertext();

    expect(screen.getByRole("radio", { name: "Encrypt" })).toBeChecked();
    expect(within(keyCard("Public key")).getByText("In use")).toBeInTheDocument();
    expect(within(keyCard("Private key")).queryByText("In use")).not.toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "Decrypt" }));

    expect(screen.getByRole("radio", { name: "Decrypt" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Encrypt" })).not.toBeChecked();
    expect(within(keyCard("Private key")).getByText("In use")).toBeInTheDocument();
    expect(within(keyCard("Public key")).queryByText("In use")).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Step 2: Paste ciphertext" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Step 3: Recovered message" })).toBeInTheDocument();
    await expectLiveMessage("test");
    expect(await screen.findByRole("table", { name: "Decryption of each value" })).toBeInTheDocument();
    expect(screen.getByText("Using the private key")).toBeInTheDocument();
  });

  it("preserves the key pair and each mode's input across switches", async () => {
    const { api, user } = renderApp();
    await user.click(screen.getByRole("button", { name: "Textbook (61, 53)" }));
    await screen.findByText("Key pair ready.");

    const message = screen.getByLabelText("Plain text to encrypt with the public key");
    await user.clear(message);
    await user.type(message, "hello");

    await user.click(screen.getByRole("radio", { name: "Decrypt" }));
    const ciphertext = screen.getByLabelText("Numbers separated by spaces, to decrypt with the private key");
    expect(ciphertext).toHaveValue("924799 621270 2637 924799");
    // Textbook n is too small for the Bigger-primes fixture tokens → not a validated count.
    await waitFor(() => expect(screen.getByText("4 tokens")).toBeInTheDocument());
    await user.clear(ciphertext);
    await user.type(ciphertext, "1 2");

    await user.click(screen.getByRole("radio", { name: "Encrypt" }));
    expect(screen.getByLabelText("Plain text to encrypt with the public key")).toHaveValue("hello");
    expect(screen.getByText("5 characters")).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "Decrypt" }));
    expect(screen.getByLabelText("Numbers separated by spaces, to decrypt with the private key")).toHaveValue("1 2");

    expect(screen.getByLabelText("Prime p")).toHaveValue("61");
    expect(screen.getByRole("button", { name: "Textbook (61, 53)" })).toHaveAttribute("aria-pressed", "true");
    expect(derivedValue("d = e⁻¹ mod φ(n)")).toHaveTextContent("2753");
    expect(api.deriveKey).toHaveBeenCalledTimes(2);
  });

  it("is operable from the keyboard", async () => {
    const { user } = renderApp();
    const encrypt = screen.getByRole("radio", { name: "Encrypt" });

    encrypt.focus();
    await user.keyboard("{ArrowRight}");

    expect(screen.getByRole("radio", { name: "Decrypt" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Decrypt" })).toHaveFocus();
    expect(screen.getByRole("group", { name: "Mode" })).toBeInTheDocument();
  });

  it("clears only the current mode's input and the live encrypt output", async () => {
    const { user } = renderApp();
    await expectLiveCiphertext();

    await user.click(screen.getByRole("button", { name: "Clear" }));

    expect(screen.getByLabelText("Plain text to encrypt with the public key")).toHaveValue("");
    expect(screen.getByText("0 characters")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Ciphertext output" })).toHaveTextContent(
      "Type a message to see each character encrypted.",
    );

    await user.click(screen.getByRole("radio", { name: "Decrypt" }));
    expect(screen.getByLabelText("Numbers separated by spaces, to decrypt with the private key")).toHaveValue(
      "924799 621270 2637 924799",
    );
  });
});

describe("live decryption", () => {
  it("decrypts the fixture ciphertext into test with a live worked example and table", async () => {
    const { api, user } = renderApp();
    await expectLiveCiphertext();
    await user.click(screen.getByRole("radio", { name: "Decrypt" }));

    await expectLiveMessage("test");
    expect(await screen.findByText("Message recovered")).toBeInTheDocument();
    expect(api.decrypt).toHaveBeenCalledWith(
      FIXTURE_ENCRYPT.display,
      "832193",
      "1022117",
      expect.any(AbortSignal),
    );

    const example = screen.getByText("Worked example: the first value, “924799”").closest("figure");
    expect(example).toHaveTextContent("832193");
    expect(example).toHaveTextContent("1022117");
    expect(example).toHaveTextContent("116");
    expect(example).toHaveTextContent("t");

    const table = screen.getByRole("table", { name: "Decryption of each value" });
    expect(within(table).getAllByRole("row")).toHaveLength(5);
    expect(within(table).getAllByRole("row")[1]).toHaveTextContent("1924799116t");
    expect(screen.queryByText(/^Sample$/)).not.toBeInTheDocument();
  });

  it("accepts mixed whitespace in pasted ciphertext", async () => {
    const { user } = renderApp();
    await expectLiveCiphertext();
    await user.click(screen.getByRole("radio", { name: "Decrypt" }));
    await expectLiveMessage("test");

    const ciphertext = screen.getByLabelText("Numbers separated by spaces, to decrypt with the private key");
    fireEvent.change(ciphertext, { target: { value: "924799\n621270\t2637  924799" } });

    await expectLiveMessage("test");
    expect(screen.getByText("4 numbers")).toBeInTheDocument();
  });

  it("shows an empty instructional state without calling decrypt when ciphertext is cleared", async () => {
    const { api, user } = renderApp();
    await expectLiveCiphertext();
    await user.click(screen.getByRole("radio", { name: "Decrypt" }));
    await expectLiveMessage("test");
    api.decrypt.mockClear();

    await user.click(screen.getByRole("button", { name: "Clear" }));

    expect(screen.getByLabelText("Numbers separated by spaces, to decrypt with the private key")).toHaveValue("");
    expect(screen.getByRole("region", { name: "Recovered message output" })).toHaveTextContent(
      "Paste ciphertext to recover each character.",
    );
    expect(screen.getByText(/worked example and table appear here once you paste/i)).toBeInTheDocument();
    expect(derivedValue("n = p × q")).toHaveTextContent("1022117");
    expect(api.decrypt).not.toHaveBeenCalled();
  });

  it("shows bad-token feedback without erasing the ciphertext or key", async () => {
    const { user } = renderApp();
    await expectLiveCiphertext();
    await user.click(screen.getByRole("radio", { name: "Decrypt" }));
    await expectLiveMessage("test");

    const ciphertext = screen.getByLabelText("Numbers separated by spaces, to decrypt with the private key");
    fireEvent.change(ciphertext, { target: { value: "924799 abc" } });

    expect(await screen.findAllByText(/Value 2/)).not.toHaveLength(0);
    expect(ciphertext).toHaveValue("924799 abc");
    expect(ciphertext).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent(/non-negative whole number/);
    expect(screen.getByLabelText("Prime p")).toHaveValue("1009");
    // Invalid input must not be presented as a validated decrypted number count.
    expect(screen.queryByText("2 numbers")).not.toBeInTheDocument();
    expect(screen.getByText("2 tokens")).toBeInTheDocument();
  });

  it("shows out-of-range feedback for values not smaller than n", async () => {
    const { user } = renderApp();
    await expectLiveCiphertext();
    await user.click(screen.getByRole("radio", { name: "Decrypt" }));
    await expectLiveMessage("test");

    const ciphertext = screen.getByLabelText("Numbers separated by spaces, to decrypt with the private key");
    fireEvent.change(ciphertext, { target: { value: "924799 1022117" } });

    expect(await screen.findAllByText(/smaller than n = 1022117/)).not.toHaveLength(0);
    expect(ciphertext).toHaveValue("924799 1022117");
    expect(screen.getByRole("alert")).toHaveTextContent(/Value 2/);
  });

  it("shows inline feedback for negative ciphertext tokens", async () => {
    const { user } = renderApp();
    await expectLiveCiphertext();
    await user.click(screen.getByRole("radio", { name: "Decrypt" }));
    await expectLiveMessage("test");

    const ciphertext = screen.getByLabelText("Numbers separated by spaces, to decrypt with the private key");
    fireEvent.change(ciphertext, { target: { value: "924799 -1" } });

    expect(await screen.findAllByText(/Value 2/)).not.toHaveLength(0);
    expect(screen.getByRole("alert")).toHaveTextContent(/non-negative whole number/);
    expect(ciphertext).toHaveValue("924799 -1");
    expect(screen.queryByText("2 numbers")).not.toBeInTheDocument();
    expect(screen.getByText("2 tokens")).toBeInTheDocument();
  });

  it("shows inline feedback when a value decrypts to an unsupported Unicode code point", async () => {
    const api = createFakeAPI();
    api.decrypt.mockRejectedValueOnce(
      new TeachingValidationFailure([
        {
          field: "ciphertext",
          code: "invalid_code_point",
          message: "Value 1 decrypts to a number that is not a valid Unicode character.",
          index: 1,
        },
      ]),
    );
    const { user } = renderApp(api);
    await expectLiveCiphertext();
    await user.click(screen.getByRole("radio", { name: "Decrypt" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/not a valid Unicode character/);
    expect(screen.getByLabelText("Numbers separated by spaces, to decrypt with the private key")).toHaveValue(
      FIXTURE_ENCRYPT.display,
    );
    expect(screen.queryByText("4 numbers")).not.toBeInTheDocument();
    expect(screen.getByText("4 tokens")).toBeInTheDocument();
  });

  it("ignores a late response for older ciphertext", async () => {
    const first = deferred<TeachingDecryptResponse>();
    const second = deferred<TeachingDecryptResponse>();
    const api = createFakeAPI();
    api.decrypt
      .mockImplementationOnce(() => first.promise)
      .mockImplementationOnce(() => second.promise)
      .mockImplementation(decryptKnownText);

    const { user } = renderApp(api);
    await expectLiveCiphertext();
    await user.click(screen.getByRole("radio", { name: "Decrypt" }));
    await screen.findByText("Decrypting…");
    const firstSignal = api.decrypt.mock.calls[0][3] as AbortSignal;

    const ciphertext = screen.getByLabelText("Numbers separated by spaces, to decrypt with the private key");
    fireEvent.change(ciphertext, { target: { value: "" } });
    await screen.findByText("Paste ciphertext to recover each character.");
    expect(firstSignal.aborted).toBe(true);

    fireEvent.change(ciphertext, { target: { value: "1 2" } });
    await waitFor(() => expect(api.decrypt).toHaveBeenCalledTimes(2));
    await screen.findByText("Decrypting…");

    const latest: TeachingDecryptResponse = {
      message: "ab",
      trace: [
        { index: 1, ciphertext: "1", codePoint: "97", character: "a" },
        { index: 2, ciphertext: "2", codePoint: "98", character: "b" },
      ],
    };
    await act(async () => {
      second.resolve(latest);
      first.resolve(FIXTURE_DECRYPT);
    });

    await expectLiveMessage("ab");
    const table = screen.getByRole("table", { name: "Decryption of each value" });
    expect(within(table).getAllByRole("row")[1]).toHaveTextContent("1197a");
    expect(within(table).getAllByRole("row")[2]).toHaveTextContent("2298b");
  });

  it("copies only the recovered message and announces success without moving focus", async () => {
    const { user } = renderApp();
    await expectLiveCiphertext();
    await user.click(screen.getByRole("radio", { name: "Decrypt" }));
    await expectLiveMessage("test");

    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      writable: true,
      value: { writeText },
    });

    const copy = screen.getByRole("button", { name: "Copy" });
    expect(copy).toBeEnabled();
    copy.focus();
    fireEvent.click(copy);

    await waitFor(() => expect(writeText).toHaveBeenCalledWith("test"));
    expect(screen.getByText("Message copied")).toBeInTheDocument();
    expect(document.activeElement).toBe(copy);
  });

  it("Encrypt again switches to Encrypt mode and carries the recovered plaintext", async () => {
    const { user } = renderApp();
    await expectLiveCiphertext();
    await user.click(screen.getByRole("radio", { name: "Decrypt" }));
    await expectLiveMessage("test");

    await user.click(screen.getByRole("button", { name: "Encrypt again →" }));

    expect(screen.getByRole("radio", { name: "Encrypt" })).toBeChecked();
    expect(screen.getByLabelText("Plain text to encrypt with the public key")).toHaveValue("test");
    await expectLiveCiphertext();

    await user.click(screen.getByRole("radio", { name: "Decrypt" }));
    expect(screen.getByLabelText("Numbers separated by spaces, to decrypt with the private key")).toHaveValue(
      FIXTURE_ENCRYPT.display,
    );
  });

  it("reports decrypt request failures with retry and keeps the ciphertext", async () => {
    const api = createFakeAPI();
    api.decrypt.mockRejectedValueOnce(new Error("Network Error"));
    const { user } = renderApp(api);
    await expectLiveCiphertext();
    await user.click(screen.getByRole("radio", { name: "Decrypt" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("couldn't decrypt");
    expect(screen.getByLabelText("Numbers separated by spaces, to decrypt with the private key")).toHaveValue(
      FIXTURE_ENCRYPT.display,
    );
    expect(screen.getByLabelText("Prime p")).toHaveValue("1009");

    await user.click(within(alert).getByRole("button", { name: "Try again" }));
    await expectLiveMessage("test");
  });
});
