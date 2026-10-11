import { integer, numeric, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  passwordHash: varchar("passwordHash", { length: 255 }),
  preferredCurrency: varchar("preferredCurrency", { length: 8 }).default("USD").notNull(),
  verificationStatus: text("verificationStatus", { enum: ["not_started", "pending", "approved", "rejected"] }).default("not_started").notNull(),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const authSessions = pgTable("auth_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  tokenHash: varchar("tokenHash", { length: 128 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  plan: varchar("plan", { length: 96 }).notNull(),
  status: text("status", { enum: ["pending", "active", "paused", "cancelled"] }).default("pending").notNull(),
  startedAt: timestamp("startedAt"),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const receivingAddresses = pgTable("receiving_addresses", {
  id: serial("id").primaryKey(),
  asset: varchar("asset", { length: 24 }).notNull(),
  network: varchar("network", { length: 40 }).notNull(),
  address: varchar("address", { length: 160 }).notNull(),
  memo: varchar("memo", { length: 128 }),
  isActive: integer("isActive").default(1).notNull(),
  updatedBy: integer("updatedBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const depositIntents = pgTable("deposit_intents", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  asset: varchar("asset", { length: 24 }).notNull(),
  network: varchar("network", { length: 40 }).notNull(),
  address: varchar("address", { length: 128 }).notNull(),
  memo: varchar("memo", { length: 128 }),
  status: text("status", { enum: ["address_assigned", "detected", "confirming", "under_review", "credited", "settled", "exception"] }).default("address_assigned").notNull(),
  txHash: varchar("txHash", { length: 160 }),
  amount: numeric("amount", { precision: 32, scale: 12 }),
  confirmations: integer("confirmations").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const ledgerAccounts = pgTable("ledger_accounts", {
  id: serial("id").primaryKey(),
  ownerType: text("ownerType", { enum: ["customer", "platform", "suspense", "treasury"] }).notNull(),
  ownerId: integer("ownerId"),
  asset: varchar("asset", { length: 24 }).notNull(),
  accountName: varchar("accountName", { length: 96 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  sourceType: varchar("sourceType", { length: 48 }).notNull(),
  sourceId: integer("sourceId"),
  status: text("status", { enum: ["pending_approval", "posted", "reversed"] }).default("pending_approval").notNull(),
  reason: text("reason").notNull(),
  createdBy: integer("createdBy").notNull(),
  approvedBy: integer("approvedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  approvedAt: timestamp("approvedAt"),
});

export const journalLines = pgTable("journal_lines", {
  id: serial("id").primaryKey(),
  journalEntryId: integer("journalEntryId").notNull(),
  accountId: integer("accountId").notNull(),
  asset: varchar("asset", { length: 24 }).notNull(),
  signedAmount: numeric("signedAmount", { precision: 32, scale: 12 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const adjustmentRequests = pgTable("adjustment_requests", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  asset: varchar("asset", { length: 24 }).notNull(),
  amount: numeric("amount", { precision: 32, scale: 12 }).notNull(),
  direction: text("direction", { enum: ["credit", "debit"] }).notNull(),
  reason: text("reason").notNull(),
  status: text("status", { enum: ["pending", "approved", "rejected", "posted"] }).default("pending").notNull(),
  requestedBy: integer("requestedBy").notNull(),
  approvedBy: integer("approvedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  approvedAt: timestamp("approvedAt"),
});

export const holds = pgTable("holds", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  asset: varchar("asset", { length: 24 }).notNull(),
  amount: numeric("amount", { precision: 32, scale: 12 }).notNull(),
  reason: text("reason").notNull(),
  status: text("status", { enum: ["active", "released"] }).default("active").notNull(),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  releasedAt: timestamp("releasedAt"),
});

export const auditEvents = pgTable("audit_events", {
  id: serial("id").primaryKey(),
  actorId: integer("actorId").notNull(),
  action: varchar("action", { length: 96 }).notNull(),
  targetType: varchar("targetType", { length: 48 }).notNull(),
  targetId: integer("targetId"),
  requestId: varchar("requestId", { length: 96 }),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type AuthSession = typeof authSessions.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type ReceivingAddress = typeof receivingAddresses.$inferSelect;
export type DepositIntent = typeof depositIntents.$inferSelect;
export type AdjustmentRequest = typeof adjustmentRequests.$inferSelect;
