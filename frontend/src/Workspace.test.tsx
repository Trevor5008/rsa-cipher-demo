import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";
import { FIXTURE_KEY } from "./fixtures/teaching";
import { TeachingValidationFailure } from "./services/teachingAPI";
import { TEXTBOOK_KEY, createFakeAPI, deferred, deriveKnownKey } from "./test/teachingFakes";
import type { TeachingKey } from "./types/teaching";

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

describe("guided workspace layout", () => {
  it("shows the whole workflow as three numbered cards without any modal", async () => {
    renderApp();
    await expectDerived("1022117", "1020096", "832193");

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
    renderApp(createFakeAPI(async () => longKey));

    await screen.findByText("Key pair ready.");
    expect(derivedValue("n = p × q")).toHaveClass("break-all", "min-w-0");
    expect(within(keyCard("Public key")).getByText(`(e = 65537, n = ${big})`)).toHaveClass("break-all");
    expect(screen.getByRole("region", { name: "Encryption of each character (sample)" })).toHaveClass("overflow-x-auto");
  });

  it("renders the sample worked example, trace table, and teaching-mode notice", async () => {
    renderApp();
    await screen.findByText("Key pair ready.");

    expect(screen.getByText("Worked example: the first character, “t”")).toBeInTheDocument();
    const table = screen.getByRole("table", { name: "Encryption of each character (sample)" });
    expect(within(table).getAllByRole("row")).toHaveLength(5);
    expect(within(table).getAllByRole("row")[1]).toHaveTextContent("1t116924799");
    expect(screen.getByRole("complementary", { name: "Teaching mode" })).toHaveTextContent(/OAEP/);
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
    await screen.findByText("Key pair ready.");

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
    await user.type(message, "!");
    expect(message).toHaveValue("test!");

    await user.clear(p);
    await user.type(p, "1009");
    await expectDerived("1022117", "1020096", "832193");
    expect(p).not.toHaveAttribute("aria-invalid");
    expect(screen.getByRole("region", { name: "Ciphertext output" })).toHaveTextContent("924799 621270 2637 924799");
  });

  it("announces loading while the key is being derived", async () => {
    const pending = deferred<TeachingKey>();
    renderApp(createFakeAPI(() => pending.promise));

    expect(screen.getByRole("status")).toHaveTextContent("Calculating the key pair…");
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

describe("mode switch", () => {
  it("moves the In use badge from the public key to the private key and updates the panels", async () => {
    const { user } = renderApp();
    await screen.findByText("Key pair ready.");

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
    expect(screen.getByRole("region", { name: "Recovered message output" })).toHaveTextContent("test");
    expect(screen.getByRole("table", { name: "Decryption of each value (sample)" })).toBeInTheDocument();
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
    expect(screen.getByText("4 numbers")).toBeInTheDocument();
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

  it("clears only the current mode's input", async () => {
    const { user } = renderApp();
    await user.click(screen.getByRole("button", { name: "Clear" }));

    expect(screen.getByLabelText("Plain text to encrypt with the public key")).toHaveValue("");
    expect(screen.getByText("0 characters")).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "Decrypt" }));
    expect(screen.getByLabelText("Numbers separated by spaces, to decrypt with the private key")).toHaveValue(
      "924799 621270 2637 924799",
    );
  });
});
