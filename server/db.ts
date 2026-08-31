import { and, desc, eq, gt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { adjustmentRequests, auditEvents, authSessions, depositIntents, InsertUser, receivingAddresses, subscriptions, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb(); if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod", "passwordHash", "preferredCurrency"] as const;
  for (const field of textFields) if (user[field] !== undefined) { if (user[field] !== null) values[field] = user[field] as never; updateSet[field] = user[field] ?? null; }
  if (user.verificationStatus !== undefined) { values.verificationStatus = user.verificationStatus; updateSet.verificationStatus = user.verificationStatus; }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId && ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) { const db = await getDb(); if (!db) return undefined; return (await db.select().from(users).where(eq(users.openId, openId)).limit(1))[0]; }
export async function getUserByEmail(email: string) { const db = await getDb(); if (!db) return undefined; return (await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1))[0]; }

export async function promoteUserByEmail(email: string) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.update(users).set({ role: "admin" }).where(eq(users.email, email.toLowerCase())); return getUserByEmail(email); }

export async function createLocalUser(input: { name: string; email: string; passwordHash: string; preferredCurrency: string }) {
  const db = await getDb(); if (!db) throw new Error("Database unavailable");
  const openId = `local_${crypto.randomUUID()}`;
  const normalizedEmail = input.email.toLowerCase();
  const result = await db.insert(users).values({ openId, name: input.name, email: normalizedEmail, passwordHash: input.passwordHash, preferredCurrency: input.preferredCurrency, loginMethod: "password", role: normalizedEmail === ENV.adminEmail ? "admin" : "user", verificationStatus: "not_started" });
  const id = Number(result[0]?.insertId ?? 0);
  return (await db.select().from(users).where(eq(users.id, id)).limit(1))[0];
}

export async function createAuthSession(userId: number, tokenHash: string, expiresAt: Date) {
  const db = await getDb(); if (!db) throw new Error("Database unavailable");
  await db.insert(authSessions).values({ userId, tokenHash, expiresAt });
}
export async function getUserBySessionHash(tokenHash: string) {
  const db = await getDb(); if (!db) return undefined;
  const rows = await db.select({ user: users }).from(authSessions).innerJoin(users, eq(authSessions.userId, users.id)).where(and(eq(authSessions.tokenHash, tokenHash), gt(authSessions.expiresAt, new Date()))).limit(1);
  return rows[0]?.user;
}
export async function deleteAuthSession(tokenHash: string) { const db = await getDb(); if (db) await db.delete(authSessions).where(eq(authSessions.tokenHash, tokenHash)); }

export async function updateUserProfile(userId: number, values: { preferredCurrency?: string; verificationStatus?: "not_started" | "pending" | "approved" | "rejected" }) {
  const db = await getDb(); if (!db) throw new Error("Database unavailable");
  await db.update(users).set(values).where(eq(users.id, userId));
  return (await db.select().from(users).where(eq(users.id, userId)).limit(1))[0];
}

export async function listUserDeposits(userId: number) { const db = await getDb(); if (!db) return []; return db.select().from(depositIntents).where(eq(depositIntents.userId, userId)).orderBy(desc(depositIntents.createdAt)); }
export async function listAllDeposits() { const db = await getDb(); if (!db) return []; return db.select().from(depositIntents).orderBy(desc(depositIntents.createdAt)); }
export async function createDepositIntent(input: typeof depositIntents.$inferInsert) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const result = await db.insert(depositIntents).values(input); return Number(result[0]?.insertId ?? 0); }

export async function getReceivingAddress(asset: string, network: string) { const db = await getDb(); if (!db) return undefined; return (await db.select().from(receivingAddresses).where(and(eq(receivingAddresses.asset, asset), eq(receivingAddresses.network, network), eq(receivingAddresses.isActive, 1))).limit(1))[0]; }
export async function listReceivingAddresses() { const db = await getDb(); if (!db) return []; return db.select().from(receivingAddresses).orderBy(desc(receivingAddresses.updatedAt)); }
export async function upsertReceivingAddress(input: { asset: string; network: string; address: string; memo?: string | null; updatedBy: number }) {
  const db = await getDb(); if (!db) throw new Error("Database unavailable");
  await db.update(receivingAddresses).set({ isActive: 0 }).where(and(eq(receivingAddresses.asset, input.asset), eq(receivingAddresses.network, input.network)));
  const result = await db.insert(receivingAddresses).values({ ...input, isActive: 1 });
  return Number(result[0]?.insertId ?? 0);
}

export async function createAdjustmentRequest(input: typeof adjustmentRequests.$inferInsert, actorId: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.transaction(async tx => { const result = await tx.insert(adjustmentRequests).values(input); await tx.insert(auditEvents).values({ actorId, action: "adjustment.requested", targetType: "adjustment_request", targetId: Number(result[0]?.insertId ?? 0), metadata: JSON.stringify({ asset: input.asset, amount: input.amount, direction: input.direction }) }); return Number(result[0]?.insertId ?? 0); }); }
export async function approveAdjustmentRequest(adjustmentId: number, approverId: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.transaction(async tx => { const rows = await tx.select().from(adjustmentRequests).where(eq(adjustmentRequests.id, adjustmentId)).limit(1); const request = rows[0]; if (!request) throw new Error("Adjustment request not found"); if (request.requestedBy === approverId) throw new Error("The requester cannot approve the same adjustment"); if (request.status !== "pending") throw new Error("Adjustment is no longer pending"); await tx.update(adjustmentRequests).set({ status: "approved", approvedBy: approverId, approvedAt: new Date() }).where(eq(adjustmentRequests.id, adjustmentId)); await tx.insert(auditEvents).values({ actorId: approverId, action: "adjustment.approved", targetType: "adjustment_request", targetId: adjustmentId, metadata: JSON.stringify({ requestedBy: request.requestedBy, amount: request.amount, asset: request.asset }) }); return { success: true, adjustmentId, status: "approved" as const }; }); }

export async function getSubscription(userId: number) { const db = await getDb(); if (!db) return undefined; return (await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).orderBy(desc(subscriptions.createdAt)).limit(1))[0]; }
export async function requestSubscription(userId: number, plan: string) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const result = await db.insert(subscriptions).values({ userId, plan, status: "pending" }); return Number(result[0]?.insertId ?? 0); }

export async function getUserDashboard(userId: number) { const user = await getUserById(userId); const deposits = await listUserDeposits(userId); return { totalEquity: "0.00", availableBalance: "0.00", unrealizedPnl: "0.00", currency: user?.preferredCurrency ?? "USD", verificationStatus: user?.verificationStatus ?? "not_started", deposits, environment: "account" as const }; }
export async function getUserById(userId: number) { const db = await getDb(); if (!db) return undefined; return (await db.select().from(users).where(eq(users.id, userId)).limit(1))[0]; }
export async function listUserActivity(userId: number) { const deposits = await listUserDeposits(userId); return deposits.map(deposit => ({ id: deposit.id, type: "deposit" as const, title: `${deposit.asset} deposit`, detail: `${deposit.txHash ?? "Awaiting transaction"} · ${deposit.status}`, amount: deposit.amount ?? "0", createdAt: deposit.createdAt })); }
