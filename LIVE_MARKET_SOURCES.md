# Live market-data sources

## DEX Screener
Source: https://docs.dexscreener.com/api/reference

The official API reference documents public REST endpoints on `https://api.dexscreener.com`, including pair lookup, token-pair lookup, token search, latest token profiles, and market metadata. The reference states a 60 requests-per-minute rate limit for the latest token-profile and related public endpoints. Pair responses include chain, DEX, pair URL/address, base/quote tokens, USD/native price, transactions, volume, price change, liquidity, market cap/FDV, pair creation time, and token information. This is suitable for Crypto and Memecoins discovery/display, but it is not a custody, wallet-signing, settlement, or execution service.

## Twelve Data
Source: https://twelvedata.com/docs

The official documentation states that Twelve Data covers stocks, forex, ETFs, commodities, cryptocurrencies, and more. It provides REST and WebSocket endpoints and requires an API key for authenticated requests. The `/price` endpoint can return latest prices; `/time_series` returns OHLCV-style historical data. The documentation recommends server-side key storage, error handling for unavailable data, rate-limit handling, and caching. This is suitable for Forex and Stocks, and can also support selected crypto symbols when the configured plan includes them.

## CoinGecko
Source: https://docs.coingecko.com/reference/introduction

The official documentation describes REST, WebSocket, and webhook delivery for crypto market data, with on-chain DEX data powered by GeckoTerminal. This is suitable as an alternative or supplement for Crypto data, especially when symbol-to-asset mapping and broad token coverage are needed.

## Implementation decision

Use backend adapters and a short-lived cache. Use DEX Screener for Memecoins and DEX-based Crypto discovery, and Twelve Data for Forex and Stocks. Keep provider API keys server-side. The frontend should display provider status and an updated timestamp and should show a clear error/empty state when a provider key is missing, rate-limited, or unavailable. Do not use hardcoded prices as a fallback for pages labeled live.
