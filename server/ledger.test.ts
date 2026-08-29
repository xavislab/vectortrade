import { describe, expect, it } from "vitest";
import { canApproveAdjustment, depositEventKey, isBalanced } from "../shared/ledger";

describe("ledger invariants", () => {
  it("accepts a balanced double-entry posting", () => {
    expect(isBalanced([{ signedAmount: "2500.00" }, { signedAmount: "-2500.00" }])).toBe(true);
  });

  it("rejects an unbalanced posting", () => {
    expect(isBalanced([{ signedAmount: "2500.00" }, { signedAmount: "-2499.99" }])).toBe(false);
  });

  it("requires a different approver and enforces the threshold", () => {
    expect(canApproveAdjustment(10, 11, "750.00")).toBe(true);
    expect(canApproveAdjustment(10, 10, "750.00")).toBe(false);
    expect(canApproveAdjustment(10, 11, "1500.00")).toBe(false);
  });

  it("normalizes the same blockchain callback to one idempotency key", () => {
    expect(depositEventKey("Ethereum", "0xABC", 0)).toBe(depositEventKey("ethereum", "0xabc", 0));
    expect(depositEventKey("ethereum", "0xabc", 0)).not.toBe(depositEventKey("ethereum", "0xabc", 1));
  });
});
