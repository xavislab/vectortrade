CREATE TABLE `adjustment_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`asset` varchar(24) NOT NULL,
	`amount` decimal(32,12) NOT NULL,
	`direction` enum('credit','debit') NOT NULL,
	`reason` text NOT NULL,
	`status` enum('pending','approved','rejected','posted') NOT NULL DEFAULT 'pending',
	`requestedBy` int NOT NULL,
	`approvedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`approvedAt` timestamp,
	CONSTRAINT `adjustment_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`actorId` int NOT NULL,
	`action` varchar(96) NOT NULL,
	`targetType` varchar(48) NOT NULL,
	`targetId` int,
	`requestId` varchar(96),
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deposit_intents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`asset` varchar(24) NOT NULL,
	`network` varchar(40) NOT NULL,
	`address` varchar(128) NOT NULL,
	`memo` varchar(128),
	`status` enum('address_assigned','detected','confirming','under_review','credited','settled','exception') NOT NULL DEFAULT 'address_assigned',
	`txHash` varchar(160),
	`amount` decimal(32,12),
	`confirmations` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deposit_intents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `holds` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`asset` varchar(24) NOT NULL,
	`amount` decimal(32,12) NOT NULL,
	`reason` text NOT NULL,
	`status` enum('active','released') NOT NULL DEFAULT 'active',
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`releasedAt` timestamp,
	CONSTRAINT `holds_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `journal_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceType` varchar(48) NOT NULL,
	`sourceId` int,
	`status` enum('pending_approval','posted','reversed') NOT NULL DEFAULT 'pending_approval',
	`reason` text NOT NULL,
	`createdBy` int NOT NULL,
	`approvedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`approvedAt` timestamp,
	CONSTRAINT `journal_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `journal_lines` (
	`id` int AUTO_INCREMENT NOT NULL,
	`journalEntryId` int NOT NULL,
	`accountId` int NOT NULL,
	`asset` varchar(24) NOT NULL,
	`signedAmount` decimal(32,12) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `journal_lines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ledger_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerType` enum('customer','platform','suspense','treasury') NOT NULL,
	`ownerId` int,
	`asset` varchar(24) NOT NULL,
	`accountName` varchar(96) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ledger_accounts_id` PRIMARY KEY(`id`)
);
