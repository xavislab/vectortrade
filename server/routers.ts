import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { approveAdjustmentRequest, createAdjustmentRequest, createDepositIntent, getUserDashboard, listAllDeposits, listUserActivity, listUserDeposits } from "./db";

const demoAddress = "0x7A92C6d3B1e8b92D419e9a17F74f4C11";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  dashboard: router({
    summary: protectedProcedure.query(({ ctx }) => getUserDashboard(ctx.user.id)),
    activity: protectedProcedure.query(({ ctx }) => listUserActivity(ctx.user.id)),
  }),
  deposits: router({
    listMine: protectedProcedure.query(({ ctx }) => listUserDeposits(ctx.user.id)),
    createIntent: protectedProcedure.input(z.object({ asset: z.string().min(2).max(24), network: z.string().min(2).max(40) })).mutation(({ ctx, input }) => createDepositIntent({ userId: ctx.user.id, asset: input.asset, network: input.network, address: demoAddress, status: "address_assigned", confirmations: 0 })),
  }),
  admin: router({
    listDeposits: adminProcedure.query(() => listAllDeposits()),
    requestAdjustment: adminProcedure.input(z.object({ userId: z.number().int().positive(), asset: z.string().min(2).max(24), amount: z.string().regex(/^\d+(\.\d{1,12})?$/), direction: z.enum(["credit", "debit"]), reason: z.string().min(10).max(2000) })).mutation(({ ctx, input }) => createAdjustmentRequest({ userId: input.userId, asset: input.asset, amount: input.amount, direction: input.direction, reason: input.reason, requestedBy: ctx.user.id, status: "pending" }, ctx.user.id)),
    approveAdjustment: adminProcedure.input(z.object({ adjustmentId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      if (!ctx.user.id) throw new TRPCError({ code: "UNAUTHORIZED" });
      try {
        return await approveAdjustmentRequest(input.adjustmentId, ctx.user.id);
      } catch (error) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Unable to approve adjustment" });
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;
