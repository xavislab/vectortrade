import { createHTTPHandler } from "@trpc/server/adapters/standalone";
import { appRouter } from "../../server/routers";
import { createNodeContext } from "../../server/_core/context";

const trpcHandler = createHTTPHandler({
  router: appRouter,
  createContext: createNodeContext,
  basePath: "/api/trpc/",
});

export default function handler(req: Parameters<typeof trpcHandler>[0], res: Parameters<typeof trpcHandler>[1]) {
  return trpcHandler(req, res);
}
