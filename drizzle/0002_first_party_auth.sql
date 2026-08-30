ALTER TABLE `users`
  ADD COLUMN `passwordHash` varchar(255),
  ADD COLUMN `preferredCurrency` varchar(8) NOT NULL DEFAULT 'USD',
  ADD COLUMN `verificationStatus` enum('not_started','pending','approved','rejected') NOT NULL DEFAULT 'not_started';
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);
--> statement-breakpoint
CREATE TABLE `auth_sessions` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `tokenHash` varchar(128) NOT NULL,
  `expiresAt` timestamp NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `auth_sessions_id` PRIMARY KEY(`id`),
  CONSTRAINT `auth_sessions_tokenHash_unique` UNIQUE(`tokenHash`)
);
--> statement-breakpoint
CREATE TABLE `receiving_addresses` (
  `id` int AUTO_INCREMENT NOT NULL,
  `asset` varchar(24) NOT NULL,
  `network` varchar(40) NOT NULL,
  `address` varchar(160) NOT NULL,
  `memo` varchar(128),
  `isActive` int NOT NULL DEFAULT 1,
  `updatedBy` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `receiving_addresses_id` PRIMARY KEY(`id`)
);
