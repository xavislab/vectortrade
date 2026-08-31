import { ENV } from "./_core/env";

type MarketKey = "crypto" | "forex" | "stocks" | "memecoins";
type MarketItem = { symbol: string; price: string; change: string; source: string; url?: string; liquidity?: number };
const cache = new Map<string, { expiresAt: number; value: LiveMarketResult }>();
const TTL_MS = 20_000;
const symbols: Record<MarketKey, string[]> = {
  crypto: ["BTC", "ETH", "SOL", "XRP"],
  memecoins: ["PEPE", "BONK", "WIF", "DOGE"],
  forex: ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD"],
  stocks: ["NVDA", "AAPL", "TSLA", "SPY"],
};
export type LiveMarketResult = { market: MarketKey; items: MarketItem[]; updatedAt: string; source: string; error?: string };

function money(value: unknown) { const n = Number(value); if (!Number.isFinite(n)) return "—"; if (Math.abs(n) < 0.001) return n.toFixed(8); if (Math.abs(n) < 10) return n.toFixed(4); return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`; }
function percent(value: unknown) { const n = Number(value); if (!Number.isFinite(n)) return "—"; return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`; }
async function json(url: string, init?: RequestInit) { const response = await fetch(url, { ...init, signal: AbortSignal.timeout(8000), headers: { Accept: "application/json", ...(init?.headers || {}) } }); if (!response.ok) throw new Error(`Provider returned ${response.status}`); return response.json(); }

async function dexSnapshot(market: MarketKey): Promise<LiveMarketResult> {
  const querySymbols = symbols[market];
  const results = await Promise.all(querySymbols.map(async symbol => {
    const body = await json(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(symbol)}`) as { pairs?: any[] };
    const pairs = (body.pairs || []).filter(pair => pair?.priceUsd && (!pair?.liquidity?.usd || Number(pair.liquidity.usd) > 10_000));
    pairs.sort((a, b) => Number(b?.liquidity?.usd || 0) - Number(a?.liquidity?.usd || 0));
    const pair = pairs[0];
    if (!pair) return null;
    const change = pair.priceChange?.h24 ?? pair.priceChange?.h1 ?? null;
    return { symbol: `${pair.baseToken?.symbol || symbol}/USD`, price: money(pair.priceUsd), change: percent(change), source: "DEX Screener", url: pair.url, liquidity: Number(pair.liquidity?.usd || 0) } as MarketItem;
  }));
  const items = results.filter(Boolean) as MarketItem[];
  if (!items.length) throw new Error("No liquid pairs were returned for this market");
  return { market, items, updatedAt: new Date().toISOString(), source: "DEX Screener" };
}

async function twelveSnapshot(market: MarketKey): Promise<LiveMarketResult> {
  if (!ENV.twelveDataApiKey) return { market, items: [], updatedAt: new Date().toISOString(), source: "Twelve Data", error: "Twelve Data API key is not configured" };
  const items = (await Promise.all(symbols[market].map(async symbol => {
    const url = `https://api.twelvedata.com/price?symbol=${encodeURIComponent(symbol)}&apikey=${encodeURIComponent(ENV.twelveDataApiKey)}`;
    const body = await json(url) as { price?: string; currency?: string; code?: number; message?: string };
    if (!body.price) return null;
    return { symbol, price: money(body.price), change: "LIVE", source: "Twelve Data" } as MarketItem;
  }))).filter(Boolean) as MarketItem[];
  if (!items.length) throw new Error("No live prices were returned by Twelve Data");
  return { market, items, updatedAt: new Date().toISOString(), source: "Twelve Data" };
}

export async function getLiveMarketSnapshot(market: MarketKey): Promise<LiveMarketResult> {
  const hit = cache.get(market); if (hit && hit.expiresAt > Date.now()) return hit.value;
  try {
    const value = market === "crypto" || market === "memecoins" ? await dexSnapshot(market) : await twelveSnapshot(market);
    cache.set(market, { expiresAt: Date.now() + TTL_MS, value }); return value;
  } catch (error) {
    const value = { market, items: [], updatedAt: new Date().toISOString(), source: market === "crypto" || market === "memecoins" ? "DEX Screener" : "Twelve Data", error: error instanceof Error ? error.message : "Market provider unavailable" };
    cache.set(market, { expiresAt: Date.now() + 5_000, value }); return value;
  }
}
