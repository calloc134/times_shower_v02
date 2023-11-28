CREATE TABLE IF NOT EXISTS "watch_list" (
	"id" integer PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"message_id" integer NOT NULL,
	"message_content" text NOT NULL
);
