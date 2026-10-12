import { useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";

type FeedStatus = "loading" | "live" | "delayed" | "stale" | "error";

const POLL_MS = 20_000;
const LIVE_WINDOW_MS = 60_000;
const DELAYED_WINDOW_MS = 5 * 60_000;

function useNow(intervalMs: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

function formatTime(iso: string | null | undefined) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

/** Shared public ticker query, so Home, the terminal strip and the market pulse share one poll. */
export function useTickerFeed() {
  const query = trpc.marketData.ticker.useQuery(undefined, {
    refetchInterval: POLL_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    staleTime: 10_000,
    retry: 1,
  });
  const now = useNow(5_000);
  const data = query.data;
  const items = data?.items ?? [];
  const dataAgeMs = data?.updatedAt ? now - Date.parse(data.updatedAt) : Infinity;
  const lastSuccessAgeMs = query.dataUpdatedAt ? now - query.dataUpdatedAt : Infinity;

  let status: FeedStatus;
  if (query.isLoading && !data) status = "loading";
  else if (!items.length) status = "error";
  else if (!query.isError && lastSuccessAgeMs < LIVE_WINDOW_MS && dataAgeMs < LIVE_WINDOW_MS) status = "live";
  else if (dataAgeMs < DELAYED_WINDOW_MS) status = "delayed";
  else status = "stale";

  const sources = useMemo(() => Array.from(new Set((data?.sources ?? []).filter(s => s.ok).map(s => s.source))), [data?.sources]);
  return { query, items, status, sources, updatedAt: data?.updatedAt ?? null, error: query.error?.message || data?.error };
}

const statusLabel: Record<FeedStatus, string> = { loading: "Connecting", live: "Live", delayed: "Delayed", stale: "Stale", error: "Feed offline" };

export default function LiveTicker({ variant = "home" }: { variant?: "home" | "terminal" }) {
  const { query, items, status, sources, updatedAt, error } = useTickerFeed();
  const duration = Math.max(28, items.length * 4.5);

  return (
    <div className={`ticker-bar ticker-${variant}`} role="region" aria-label="Live market ticker">
      <div className={`ticker-health ticker-health-${status}`} aria-live="polite">
        <span className={`status-dot ticker-${status}`} aria-hidden="true" />
        <span className="ticker-health-label">{statusLabel[status]}</span>
      </div>

      <div className="ticker-viewport">
        {status === "loading" && (
          <div className="ticker-skeleton" aria-hidden="true">
            {Array.from({ length: 8 }).map((_, index) => <span key={index} className="ticker-skeleton-item" />)}
          </div>
        )}
        {status === "error" && (
          <div className="ticker-error">
            <span>Live prices unavailable{error ? ` — ${error}` : ""}.</span>
            <button type="button" onClick={() => query.refetch()} disabled={query.isFetching}>{query.isFetching ? "Retrying…" : "Retry"}</button>
          </div>
        )}
        {items.length > 0 && (
          <div className="ticker-track" style={{ animationDuration: `${duration}s` }}>
            {[0, 1].map(copy => (
              <div className="ticker-group" key={copy} aria-hidden={copy === 1 ? true : undefined}>
                {items.map(item => (
                  <span key={`${copy}-${item.market}-${item.symbol}`} className="ticker-item">
                    <span className="ticker-symbol">{item.symbol}</span>
                    <span className="ticker-price">{item.price}</span>
                    <span className={item.direction === "up" ? "ticker-up" : item.direction === "down" ? "ticker-down" : "ticker-flat"}>
                      {item.direction === "up" ? "▲ " : item.direction === "down" ? "▼ " : ""}{item.change}
                    </span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="ticker-meta">
        {items.length > 0 ? <>{sources.join(" · ") || "Market data"} · <time dateTime={updatedAt ?? undefined}>{formatTime(updatedAt)}</time></> : status === "loading" ? "Fetching prices…" : "No data"}
      </div>
    </div>
  );
}
