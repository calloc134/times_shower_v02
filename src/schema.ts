import { integer, text, pgTable } from "drizzle-orm/pg-core";

const watch_list = pgTable("watch_list", {
  id: integer("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  message_id: integer("message_id").notNull(),
  message_content: text("message_content").notNull(),
});

export { watch_list };
