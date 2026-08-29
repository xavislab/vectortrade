export const userWorkflowModules = ["wallet", "deposit", "withdrawal", "plans", "verification", "referrals", "support", "settings"] as const;
export const adminWorkflowModules = ["deposits", "withdrawals", "users", "kyc", "plans", "messages", "settings", "audit"] as const;

export function requiresIndependentApproval(requesterId: number, approverId: number, isHighRisk: boolean) {
  return requesterId !== approverId && isHighRisk;
}

export function canSurfaceSettlementAction(input: { kycApproved: boolean; destinationVerified: boolean; riskClear: boolean; hasApprover: boolean }) {
  return input.kycApproved && input.destinationVerified && input.riskClear && input.hasApprover;
}

export function isDemoOnlyEnvironment(providerConnected: boolean, custodyEnabled: boolean) {
  return !providerConnected && !custodyEnabled;
}
