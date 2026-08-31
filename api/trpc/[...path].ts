import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";

const middleware = createExpressMiddleware({
  router: appRouter,
  createContext,
});

export default function handler(req: any, res: any) {
  return middleware(req, res, () => undefined);
}
