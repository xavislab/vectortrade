import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const depositIntents = mysqlTable("deposit_intents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  asset: varchar("asset", { length: 24 }).notNull(),
  network: varchar("network", { length: 40 }).notNull(),
  address: varchar("address", { length: 128 }).notNull(),
  memo: varchar("memo", { length: 128 }),
  status: mysqlEnum("status", ["address_assigned", "detected", "confirming", "under_review", "credited", "settled", "exception"]).default("address_assigned").notNull(),
  txHash: varchar("txHash", { length: 160 }),
  amount: decimal("amount", { precision: 32, scale: 12 }),
  confirmations: int("confirmations").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const ledgerAccounts = mysqlTable("ledger_accounts", {
  id: int("id").autoincrement().primaryKey(),
  ownerType: mysqlEnum("ownerType", ["customer", "platform", "suspense", "treasury"]).notNull(),
  ownerId: int("ownerId"),
  asset: varchar("asset", { length: 24 }).notNull(),
  accountName: varchar("accountName", { length: 96 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const journalEntries = mysqlTable("journal_entries", {
  id: int("id").autoincrement().primaryKey(),
  sourceType: varchar("sourceType", { length: 48 }).notNull(),
  sourceId: int("sourceId"),
  status: mysqlEnum("status", ["pending_approval", "posted", "reversed"]).default("pending_approval").notNull(),
  reason: text("reason").notNull(),
  createdBy: int("createdBy").notNull(),
  approvedBy: int("approvedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  approvedAt: timestamp("approvedAt"),
});

export const journalLines = mysqlTable("journal_lines", {
  id: int("id").autoincrement().primaryKey(),
  journalEntryId: int("journalEntryId").notNull(),
  accountId: int("accountId").notNull(),
  asset: varchar("asset", { length: 24 }).notNull(),
  signedAmount: decimal("signedAmount", { precision: 32, scale: 12 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const adjustmentRequests = mysqlTable("adjustment_requests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  asset: varchar("asset", { length: 24 }).notNull(),
  amount: decimal("amount", { precision: 32, scale: 12 }).notNull(),
  direction: mysqlEnum("direction", ["credit", "debit"]).notNull(),
  reason: text("reason").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "posted"]).default("pending").notNull(),
  requestedBy: int("requestedBy").notNull(),
  approvedBy: int("approvedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  approvedAt: timestamp("approvedAt"),
});

export const holds = mysqlTable("holds", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  asset: varchar("asset", { length: 24 }).notNull(),
  amount: decimal("amount", { precision: 32, scale: 12 }).notNull(),
  reason: text("reason").notNull(),
  status: mysqlEnum("status", ["active", "released"]).default("active").notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  releasedAt: timestamp("releasedAt"),
});

export const auditEvents = mysqlTable("audit_events", {
  id: int("id").autoincrement().primaryKey(),
  actorId: int("actorId").notNull(),
  action: varchar("action", { length: 96 }).notNull(),
  targetType: varchar("targetType", { length: 48 }).notNull(),
  targetId: int("targetId"),
  requestId: varchar("requestId", { length: 96 }),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type DepositIntent = typeof depositIntents.$inferSelect;
export type AdjustmentRequest = typeof adjustmentRequests.$inferSelect;
