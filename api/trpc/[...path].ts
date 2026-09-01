import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../../server/routers";
import { createFetchContext } from "../../server/_core/context";

async function handle(request: Request) {
  try {
    return await fetchRequestHandler({
      endpoint: "/api/trpc",
      req: request,
      router: appRouter,
      createContext: createFetchContext,
    });
  } catch (error) {
    console.error("[tRPC] request failed", error);
    return Response.json(
      { error: { json: { message: error instanceof Error ? error.message : "Internal API error", code: -32603, data: { code: "INTERNAL_SERVER_ERROR", httpStatus: 500 } } } },
      { status: 500 },
    );
  }
}

export function GET(request: Request) {
  return handle(request);
}

export function POST(request: Request) {
  return handle(request);
}
