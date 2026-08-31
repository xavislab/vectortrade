CREATE TABLE `subscriptions` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `plan` varchar(96) NOT NULL,
  `status` enum('pending','active','paused','cancelled') NOT NULL DEFAULT 'pending',
  `startedAt` timestamp NULL,
  `expiresAt` timestamp NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
CREATE INDEX `subscriptions_user_id_idx` ON `subscriptions` (`userId`);
