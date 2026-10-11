CREATE TABLE IF NOT EXISTS "adjustment_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"asset" varchar(24) NOT NULL,
	"amount" numeric(32, 12) NOT NULL,
	"direction" text NOT NULL,
	"reason" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"requestedBy" integer NOT NULL,
	"approvedBy" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"approvedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"actorId" integer NOT NULL,
	"action" varchar(96) NOT NULL,
	"targetType" varchar(48) NOT NULL,
	"targetId" integer,
	"requestId" varchar(96),
	"metadata" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"tokenHash" varchar(128) NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "auth_sessions_tokenHash_unique" UNIQUE("tokenHash")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "deposit_intents" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"asset" varchar(24) NOT NULL,
	"network" varchar(40) NOT NULL,
	"address" varchar(128) NOT NULL,
	"memo" varchar(128),
	"status" text DEFAULT 'address_assigned' NOT NULL,
	"txHash" varchar(160),
	"amount" numeric(32, 12),
	"confirmations" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "holds" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"asset" varchar(24) NOT NULL,
	"amount" numeric(32, 12) NOT NULL,
	"reason" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"releasedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "journal_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"sourceType" varchar(48) NOT NULL,
	"sourceId" integer,
	"status" text DEFAULT 'pending_approval' NOT NULL,
	"reason" text NOT NULL,
	"createdBy" integer NOT NULL,
	"approvedBy" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"approvedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "journal_lines" (
	"id" serial PRIMARY KEY NOT NULL,
	"journalEntryId" integer NOT NULL,
	"accountId" integer NOT NULL,
	"asset" varchar(24) NOT NULL,
	"signedAmount" numeric(32, 12) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ledger_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"ownerType" text NOT NULL,
	"ownerId" integer,
	"asset" varchar(24) NOT NULL,
	"accountName" varchar(96) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "receiving_addresses" (
	"id" serial PRIMARY KEY NOT NULL,
	"asset" varchar(24) NOT NULL,
	"network" varchar(40) NOT NULL,
	"address" varchar(160) NOT NULL,
	"memo" varchar(128),
	"isActive" integer DEFAULT 1 NOT NULL,
	"updatedBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"plan" varchar(96) NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"startedAt" timestamp,
	"expiresAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"passwordHash" varchar(255),
	"preferredCurrency" varchar(8) DEFAULT 'USD' NOT NULL,
	"verificationStatus" text DEFAULT 'not_started' NOT NULL,
	"loginMethod" varchar(64),
	"role" text DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "auth_sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "receiving_addresses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "deposit_intents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ledger_accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "journal_entries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "journal_lines" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "adjustment_requests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "holds" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_events" ENABLE ROW LEVEL SECURITY;
