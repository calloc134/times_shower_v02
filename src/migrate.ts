import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { db_url } from "./env";
import { migrate } from "drizzle-orm/postgres-js/migrator";

const main = async () => {
  // ポスグレに接続してクライアントを作成
  const db = drizzle(
    postgres(db_url, {
      max: 1,
    })
  );

  // マイグレーションの実行
  await migrate(db, {
    migrationsFolder: "./migrations",
  });
};

await main();
