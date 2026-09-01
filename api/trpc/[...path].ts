import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../../server/routers";
import { createFetchContext } from "../../server/_core/context";

export default {
  async fetch(request: Request) {
    return fetchRequestHandler({
      endpoint: "/api/trpc",
      req: request,
      router: appRouter,
      createContext: createFetchContext,
    });
  },
};
