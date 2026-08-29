import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { adjustmentRequests, auditEvents, depositIntents, InsertUser, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function listUserDeposits(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(depositIntents).where(eq(depositIntents.userId, userId)).orderBy(desc(depositIntents.createdAt));
}

export async function listAllDeposits() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(depositIntents).orderBy(desc(depositIntents.createdAt));
}

export async function createDepositIntent(input: typeof depositIntents.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const result = await db.insert(depositIntents).values(input);
  return result[0]?.insertId;
}

export async function createAdjustmentRequest(input: typeof adjustmentRequests.$inferInsert, actorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  return db.transaction(async (tx) => {
    const result = await tx.insert(adjustmentRequests).values(input);
    await tx.insert(auditEvents).values({
      actorId,
      action: "adjustment.requested",
      targetType: "adjustment_request",
      targetId: Number(result[0]?.insertId ?? 0),
      metadata: JSON.stringify({ asset: input.asset, amount: input.amount, direction: input.direction }),
    });
    return Number(result[0]?.insertId ?? 0);
  });
}

export async function approveAdjustmentRequest(adjustmentId: number, approverId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  return db.transaction(async (tx) => {
    const rows = await tx.select().from(adjustmentRequests).where(eq(adjustmentRequests.id, adjustmentId)).limit(1);
    const request = rows[0];
    if (!request) throw new Error("Adjustment request not found");
    if (request.requestedBy === approverId) throw new Error("The requester cannot approve the same adjustment");
    if (request.status !== "pending") throw new Error("Adjustment is no longer pending");
    await tx.update(adjustmentRequests).set({ status: "approved", approvedBy: approverId, approvedAt: new Date() }).where(eq(adjustmentRequests.id, adjustmentId));
    await tx.insert(auditEvents).values({ actorId: approverId, action: "adjustment.approved", targetType: "adjustment_request", targetId: adjustmentId, metadata: JSON.stringify({ requestedBy: request.requestedBy, amount: request.amount, asset: request.asset }) });
    return { success: true, adjustmentId, status: "approved" as const };
  });
}

export async function getUserDashboard(userId: number) {
  const deposits = await listUserDeposits(userId);
  return {
    totalEquity: "28450.68",
    availableBalance: "24982.40",
    unrealizedPnl: "1842.20",
    deposits,
    environment: "demo" as const,
  };
}

export async function listUserActivity(userId: number) {
  const deposits = await listUserDeposits(userId);
  return deposits.map((deposit) => ({
    id: deposit.id,
    type: "deposit" as const,
    title: `${deposit.asset} deposit`,
    detail: `${deposit.txHash ?? "Awaiting transaction"} · ${deposit.status}`,
    amount: deposit.amount ?? "0",
    createdAt: deposit.createdAt,
  }));
}
