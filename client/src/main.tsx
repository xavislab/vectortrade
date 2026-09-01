import { trpc } from "@/lib/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient();

async function apiFetch(input: RequestInfo | URL, init?: RequestInit) {
  const response = await globalThis.fetch(input, { ...(init ?? {}), credentials: "include" });
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const message = (await response.text()).trim() || `Request failed with status ${response.status}`;
    return new Response(JSON.stringify({ error: { json: { message, code: -32603, data: { code: "INTERNAL_SERVER_ERROR", httpStatus: response.status } } } }), {
      status: response.status,
      headers: { "content-type": "application/json" },
    });
  }
  return response;
}

const trpcClient = trpc.createClient({ links: [httpBatchLink({ url: `${import.meta.env.VITE_API_BASE_URL || ""}/api/trpc`, transformer: superjson, fetch: apiFetch })] });

createRoot(document.getElementById("root")!).render(<trpc.Provider client={trpcClient} queryClient={queryClient}><QueryClientProvider client={queryClient}><App /></QueryClientProvider></trpc.Provider>);
