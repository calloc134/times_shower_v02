import { integer, text, pgTable } from "drizzle-orm/pg-core";

const channel_list = pgTable("channel_list", {
  ulid: text("ulid").primaryKey().notNull(), // ULID
  channel_id: integer("channel_id").notNull(), // チャンネルID
  type: integer("type").notNull(), // チャンネルのタイプ
  // 0: 送信元チャンネル
  // 1: 転送先チャンネル
});

const watch_list = pgTable("watch_list", {
  ulid: text("ulid").primaryKey(),
  user_id: integer("user_id").notNull(),
  message_id: integer("message_id").notNull(),
  message_content: text("message_content").notNull(),
});

export { watch_list, channel_list };
