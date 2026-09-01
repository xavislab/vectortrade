import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone";
import type { User } from "../../drizzle/schema";
import { getRequestUser } from "../auth";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(opts: CreateExpressContextOptions): Promise<TrpcContext> {
  let user: User | null = null;
  try { user = await getRequestUser(opts.req); } catch { user = null; }
  return { req: opts.req, res: opts.res, user };
}

export async function createNodeContext(opts: CreateHTTPContextOptions): Promise<TrpcContext> {
  let user: User | null = null;
  try { user = await getRequestUser(opts.req as Parameters<typeof getRequestUser>[0]); } catch { user = null; }
  return { req: opts.req as unknown as TrpcContext["req"], res: opts.res as unknown as TrpcContext["res"], user };
}
