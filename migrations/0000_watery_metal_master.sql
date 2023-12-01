CREATE TABLE IF NOT EXISTS "channel_list" (
	"id" integer PRIMARY KEY NOT NULL,
	"channel_id" integer NOT NULL,
	"channel_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "watch_list" (
	"id" integer PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"message_id" integer NOT NULL,
	"message_content" text NOT NULL
);
