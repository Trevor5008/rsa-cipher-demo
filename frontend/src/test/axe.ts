import axe from "axe-core";
import { expect } from "vitest";

const BLOCKING = new Set(["serious", "critical"]);

/** Fail the test when axe reports serious or critical violations (Story #26 AC). */
export const expectNoSeriousA11yViolations = async (container: HTMLElement) => {
  const { violations } = await axe.run(container, {
    // jsdom cannot evaluate color contrast reliably; production walkthrough covers contrast.
    rules: { "color-contrast": { enabled: false } },
  });

  const blocking = violations.filter((violation) => BLOCKING.has(violation.impact ?? ""));
  const summary = blocking
    .map((violation) => {
      const nodes = violation.nodes.map((node) => `  - ${node.target.join(" ")}: ${node.failureSummary}`).join("\n");
      return `${violation.id} [${violation.impact}]: ${violation.help}\n${nodes}`;
    })
    .join("\n\n");

  expect(blocking, summary || "expected no serious/critical axe violations").toEqual([]);
};
