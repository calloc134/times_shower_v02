import { int } from "drizzle-orm/mysql-core";
import { integer, text, pgTable } from "drizzle-orm/pg-core";

const channel_list = pgTable("channel_list", {
  id: integer("id").primaryKey(), // とりあえずIDを主キーにする
  channel_id: integer("channel_id").notNull(), // チャンネルID
  channel_name: text("channel_name").notNull(), // チャンネル名
  type: integer("type").notNull(), // チャンネルのタイプ
  // 0: 送信元チャンネル
  // 1: 転送先チャンネル
});

const watch_list = pgTable("watch_list", {
  id: integer("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  message_id: integer("message_id").notNull(),
  message_content: text("message_content").notNull(),
});

export { watch_list, channel_list };
