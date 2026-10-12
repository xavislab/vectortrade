import { describe, expect, it } from "vitest";
import { combineTicker, parseKrakenTicker, tickerDirection } from "./marketData";

describe("public market ticker", () => {
  it("derives direction from the change label", () => {
    expect(tickerDirection("+2.40%")).toBe("up");
    expect(tickerDirection("-0.80%")).toBe("down");
    expect(tickerDirection("−0.80%")).toBe("down");
    expect(tickerDirection("LIVE")).toBe("flat");
    expect(tickerDirection("—")).toBe("flat");
  });

  it("combines successful snapshots and reports the oldest update time", () => {
    const result = combineTicker([
      { market: "crypto", source: "DEX Screener", updatedAt: "2026-10-12T10:00:10.000Z", items: [{ symbol: "BTC/USD", price: "$1", change: "+1.00%", source: "DEX Screener" }] },
      { market: "memecoins", source: "DEX Screener", updatedAt: "2026-10-12T10:00:00.000Z", items: [{ symbol: "PEPE/USD", price: "0.00001", change: "-3.00%", source: "DEX Screener" }] },
    ]);
    expect(result.items.map(i => i.direction)).toEqual(["up", "down"]);
    expect(result.updatedAt).toBe("2026-10-12T10:00:00.000Z");
    expect(result.error).toBeUndefined();
  });

  it("never invents prices when every provider fails", () => {
    const result = combineTicker([{ market: "crypto", source: "DEX Screener", updatedAt: "2026-10-12T10:00:00.000Z", items: [], error: "Provider returned 429" }]);
    expect(result.items).toHaveLength(0);
    expect(result.updatedAt).toBeNull();
    expect(result.error).toBe("Provider returned 429");
  });

  it("parses Kraken tickers into real prices with change from the daily open", () => {
    const items = parseKrakenTicker(["BTC", "PEPE", "DOGE"], { error: [], result: { XXBTZUSD: { c: ["80000.0", "1"], o: "79000.0" }, PEPEUSD: { c: ["0.000004", "1"], o: "0.000005" }, XDGUSD: { c: ["0.087", "1"], o: "0.087" } } });
    expect(items.map(i => i.symbol)).toEqual(["BTC/USD", "PEPE/USD", "DOGE/USD"]);
    expect(items[0].change).toBe("+1.27%");
    expect(items[1].change).toBe("-20.00%");
    expect(items[0].source).toBe("Kraken");
  });
});
