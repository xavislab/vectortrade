// Deposits run on public test networks only. Test coins come free from faucets and have no market value.
export const TESTNET_DEPOSIT_OPTIONS = [
  { asset: "BTC", network: "Bitcoin Testnet4", faucet: "https://mempool.space/testnet4/faucet" },
  { asset: "ETH", network: "Ethereum Sepolia", faucet: "https://sepoliafaucet.com" },
  { asset: "USDC", network: "Ethereum Sepolia", faucet: "https://faucet.circle.com" },
  { asset: "POL", network: "Polygon Amoy", faucet: "https://faucet.polygon.technology" },
  { asset: "SOL", network: "Solana Devnet", faucet: "https://faucet.solana.com" },
] as const;

export type TestnetDepositOption = (typeof TESTNET_DEPOSIT_OPTIONS)[number];

export function findTestnetOption(asset: string, network: string) {
  return TESTNET_DEPOSIT_OPTIONS.find(option => option.asset === asset && option.network === network);
}

export function isValidTestnetAddress(network: string, address: string) {
  const value = address.trim();
  if (network === "Bitcoin Testnet4") return /^(tb1[02-9ac-hj-np-z]{8,87}|[mn2][1-9A-HJ-NP-Za-km-z]{25,34})$/.test(value);
  if (network === "Ethereum Sepolia" || network === "Polygon Amoy") return /^0x[0-9a-fA-F]{40}$/.test(value);
  if (network === "Solana Devnet") return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value);
  return false;
}
