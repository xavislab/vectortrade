export function isBalanced(lines: Array<{ signedAmount: string | number }>) {
  const total = lines.reduce((sum, line) => sum + Number(line.signedAmount), 0);
  return Math.abs(total) < 0.000000000001;
}

export function canApproveAdjustment(requestedBy: number, approvingUser: number, amount: string | number, threshold = 1000) {
  if (requestedBy === approvingUser) return false;
  const numericAmount = Number(amount);
  return Number.isFinite(numericAmount) && numericAmount > 0 && numericAmount <= threshold;
}

export function depositEventKey(network: string, txHash: string, outputIndex = 0) {
  return `${network.toLowerCase()}:${txHash.toLowerCase()}:${outputIndex}`;
}
