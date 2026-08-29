import { describe, expect, it } from "vitest";
import { adminWorkflowModules, canSurfaceSettlementAction, isDemoOnlyEnvironment, requiresIndependentApproval, userWorkflowModules } from "../shared/workflowPolicies";

describe("enhanced user and admin workflow policies", () => {
  it("includes the video-informed user and admin modules", () => {
    expect(userWorkflowModules).toEqual(expect.arrayContaining(["wallet", "withdrawal", "verification", "support", "settings"]));
    expect(adminWorkflowModules).toEqual(expect.arrayContaining(["deposits", "withdrawals", "users", "kyc", "plans", "messages", "audit"]));
  });

  it("requires independent high-risk approval for an adjustment", () => {
    expect(requiresIndependentApproval(10, 11, true)).toBe(true);
    expect(requiresIndependentApproval(10, 10, true)).toBe(false);
    expect(requiresIndependentApproval(10, 11, false)).toBe(false);
  });

  it("gates settlement on KYC, destination verification, risk review, and an approver", () => {
    expect(canSurfaceSettlementAction({ kycApproved: true, destinationVerified: true, riskClear: true, hasApprover: true })).toBe(true);
    expect(canSurfaceSettlementAction({ kycApproved: true, destinationVerified: true, riskClear: false, hasApprover: true })).toBe(false);
  });

  it("identifies the shipped product mode as demo-only without providers or custody", () => {
    expect(isDemoOnlyEnvironment(false, false)).toBe(true);
    expect(isDemoOnlyEnvironment(true, false)).toBe(false);
  });
});
