import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { clearSession, hashPassword, setSessionCookie, signInWithPassword } from "./auth";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { approveAdjustmentRequest, createAdjustmentRequest, createDepositIntent, createLocalUser, getReceivingAddress, getUserDashboard, getUserByEmail, listAllDeposits, listReceivingAddresses, listUserActivity, listUserDeposits, getSubscription, requestSubscription, updateUserProfile, upsertReceivingAddress } from "./db";

const currency = z.enum(["USD", "EUR", "GBP", "NGN", "CAD", "AUD"]);
const credentials = z.object({ email: z.string().email().max(320), password: z.string().min(8).max(128) });

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    register: publicProcedure.input(z.object({ name: z.string().trim().min(2).max(120), email: z.string().email().max(320), password: z.string().min(8).max(128), preferredCurrency: currency })).mutation(async ({ ctx, input }) => {
      if (await getUserByEmail(input.email)) throw new TRPCError({ code: "CONFLICT", message: "An account with this email already exists" });
      const user = await createLocalUser({ name: input.name, email: input.email, passwordHash: await hashPassword(input.password), preferredCurrency: input.preferredCurrency });
      if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Unable to create account" });
      const signedIn = await signInWithPassword(input.email, input.password);
      if (!signedIn) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Unable to start account session" });
      setSessionCookie(ctx.req, ctx.res, signedIn.token);
      return signedIn.user;
    }),
    login: publicProcedure.input(credentials).mutation(async ({ ctx, input }) => {
      const signedIn = await signInWithPassword(input.email, input.password);
      if (!signedIn) throw new TRPCError({ code: "UNAUTHORIZED", message: "Email or password is incorrect" });
      setSessionCookie(ctx.req, ctx.res, signedIn.token);
      return signedIn.user;
    }),
    logout: publicProcedure.mutation(async ({ ctx }) => { await clearSession(ctx.req, ctx.res); return { success: true } as const; }),
    updateCurrency: protectedProcedure.input(z.object({ preferredCurrency: currency })).mutation(({ ctx, input }) => updateUserProfile(ctx.user.id, input)),
    submitVerification: protectedProcedure.input(z.object({ legalName: z.string().min(2).max(160), dateOfBirth: z.string().min(4).max(30), country: z.string().min(2).max(80) })).mutation(({ ctx }) => updateUserProfile(ctx.user.id, { verificationStatus: "pending" })),
  }),
  dashboard: router({
    summary: protectedProcedure.query(({ ctx }) => getUserDashboard(ctx.user.id)),
    activity: protectedProcedure.query(({ ctx }) => listUserActivity(ctx.user.id)),
  }),
  subscriptions: router({
    current: protectedProcedure.query(({ ctx }) => getSubscription(ctx.user.id)),
    request: protectedProcedure.input(z.object({ plan: z.string().min(2).max(96) })).mutation(({ ctx, input }) => requestSubscription(ctx.user.id, input.plan)),
  }),
  deposits: router({
    listMine: protectedProcedure.query(({ ctx }) => listUserDeposits(ctx.user.id)),
    destination: protectedProcedure.input(z.object({ asset: z.string().min(2).max(24), network: z.string().min(2).max(40) })).query(({ input }) => getReceivingAddress(input.asset, input.network)),
    createIntent: protectedProcedure.input(z.object({ asset: z.string().min(2).max(24), network: z.string().min(2).max(40), amount: z.string().regex(/^\d+(\.\d{1,12})?$/).optional(), txHash: z.string().max(160).optional() })).mutation(async ({ ctx, input }) => {
      const address = await getReceivingAddress(input.asset, input.network);
      if (!address) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "No receiving address is configured for this asset and network yet" });
      return createDepositIntent({ userId: ctx.user.id, asset: input.asset, network: input.network, address: address.address, memo: address.memo, status: "under_review", confirmations: 0, amount: input.amount, txHash: input.txHash });
    }),
  }),
  admin: router({
    listDeposits: adminProcedure.query(() => listAllDeposits()),
    listReceivingAddresses: adminProcedure.query(() => listReceivingAddresses()),
    setReceivingAddress: adminProcedure.input(z.object({ asset: z.string().min(2).max(24), network: z.string().min(2).max(40), address: z.string().min(8).max(160), memo: z.string().max(128).optional() })).mutation(({ ctx, input }) => upsertReceivingAddress({ ...input, updatedBy: ctx.user.id })),
    requestAdjustment: adminProcedure.input(z.object({ userId: z.number().int().positive(), asset: z.string().min(2).max(24), amount: z.string().regex(/^\d+(\.\d{1,12})?$/), direction: z.enum(["credit", "debit"]), reason: z.string().min(10).max(2000) })).mutation(({ ctx, input }) => createAdjustmentRequest({ userId: input.userId, asset: input.asset, amount: input.amount, direction: input.direction, reason: input.reason, requestedBy: ctx.user.id, status: "pending" }, ctx.user.id)),
    approveAdjustment: adminProcedure.input(z.object({ adjustmentId: z.number().int().positive() })).mutation(async ({ ctx, input }) => { try { return await approveAdjustmentRequest(input.adjustmentId, ctx.user.id); } catch (error) { throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Unable to approve adjustment" }); } }),
  }),
});
export type AppRouter = typeof appRouter;
