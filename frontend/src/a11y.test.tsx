import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";
import { FIXTURE_DECRYPT, FIXTURE_ENCRYPT } from "./fixtures/teaching";
import { expectNoSeriousA11yViolations } from "./test/axe";
import { createFakeAPI } from "./test/teachingFakes";

describe("automated accessibility (Story #26)", () => {
  it("reports no serious or critical violations in Encrypt ready state", async () => {
    const { container } = render(<App api={createFakeAPI()} />);

    await waitFor(() => {
      expect(screen.getByRole("region", { name: "Ciphertext output" })).toHaveTextContent(
        FIXTURE_ENCRYPT.display,
      );
    });
    expect(await screen.findByText("Ciphertext updated")).toBeInTheDocument();

    await expectNoSeriousA11yViolations(container);
  });

  it("reports no serious or critical violations in Decrypt ready state", async () => {
    const user = userEvent.setup();
    const { container } = render(<App api={createFakeAPI()} />);

    await waitFor(() => {
      expect(screen.getByRole("region", { name: "Ciphertext output" })).toHaveTextContent(
        FIXTURE_ENCRYPT.display,
      );
    });

    await user.click(screen.getByRole("radio", { name: "Decrypt" }));
    await waitFor(() => {
      expect(screen.getByRole("region", { name: "Recovered message output" })).toHaveTextContent(
        FIXTURE_DECRYPT.message,
      );
    });
    expect(await screen.findByText("Message recovered")).toBeInTheDocument();

    await expectNoSeriousA11yViolations(container);
  });
});
