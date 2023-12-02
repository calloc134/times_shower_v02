ALTER TABLE "channel_list" RENAME COLUMN "id" TO "ulid";--> statement-breakpoint
ALTER TABLE "watch_list" RENAME COLUMN "id" TO "ulid";--> statement-breakpoint
ALTER TABLE "channel_list" ALTER COLUMN "ulid" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "watch_list" ALTER COLUMN "ulid" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "channel_list" DROP COLUMN IF EXISTS "channel_name";