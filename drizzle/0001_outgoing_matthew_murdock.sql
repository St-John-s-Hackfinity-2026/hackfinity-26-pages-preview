CREATE TABLE `organizerSettings` (
	`id` int NOT NULL,
	`googleSheetsWebhookUrl` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `organizerSettings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `squads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`participationType` enum('individual','group') NOT NULL,
	`teamName` varchar(120) NOT NULL,
	`leaderName` varchar(120) NOT NULL,
	`leaderClass` varchar(80) NOT NULL,
	`schoolName` varchar(180) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(32) NOT NULL,
	`projectCategory` varchar(120) NOT NULL,
	`projectTitle` varchar(180) NOT NULL,
	`projectDescription` text NOT NULL,
	`members` json NOT NULL,
	`sheetSyncStatus` enum('not_configured','pending','synced','failed') NOT NULL DEFAULT 'not_configured',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `squads_id` PRIMARY KEY(`id`)
);
