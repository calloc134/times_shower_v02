import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { caching } from "cache-manager";
import { ulid } from "ulidx";
import { channel_list } from "./schema";
import { Client, TextChannel } from "discord.js";

const dbClosure = async (db_url: string) => {
  // ポスグレに接続してクライアントを作成
  const db = drizzle(postgres(db_url));

  // キャッシュの設定
  const memory_cache = await caching("memory", {
    max: 100,
    ttl: 60 * 1000,
  });

  // 送信元チャンネルのデータを返却する関数
  const getSourceChannelList = async () => {
    // もしキャッシュにデータがあればそれを返却する
    const cache = (await memory_cache.get("source_channel_list")) as
      | Set<string>
      | undefined;
    if (cache) {
      console.debug("cache hit", cache);
      return cache;
    }

    // データベースから送信元チャンネルのデータを取得する
    const channelList = await db
      .select({
        channel_id: channel_list.channel_id,
      })
      .from(channel_list)
      .where(
        eq(channel_list.type, 0) // 送信元チャンネル
      );

    // 結果を求める
    const result = new Set(channelList.map((channel) => channel.channel_id));

    // キャッシュにデータを追加する
    await memory_cache.set("source_channel_list", result);

    console.debug("cache miss", result);

    // 結果を返却する
    return result;
  };

  // 転送先チャンネルのデータを返却する関数
  const getTargetChannelList = async () => {
    // もしキャッシュにデータがあればそれを返却する
    const cache = (await memory_cache.get("target_channel_list")) as
      | Array<string>
      | undefined;
    if (cache) {
      console.debug("cache hit", cache);
      return cache;
    }

    // データベースから転送先チャンネルのデータを取得する
    const channelList = await db
      .select({
        channel_id: channel_list.channel_id,
      })
      .from(channel_list)
      .where(
        eq(channel_list.type, 1) // 転送先チャンネル
      );

    // 結果を求める
    const result = channelList.map((channel) => channel.channel_id);

    // キャッシュにデータを追加する
    await memory_cache.set("target_channel_list", result);

    console.debug("cache miss", result);

    // 結果を返却する
    return result;
  };

  // 送信元チャンネルのデータを追加する関数
  const addSourceChannelList = async (channel_id: string) => {
    // データベースに送信元チャンネルのデータを追加する
    await db.insert(channel_list).values({
      ulid: ulid(),
      channel_id: channel_id, // チャンネルID
      type: 0, // 送信元チャンネル
    });

    // キャッシュを削除する
    await memory_cache.del("source_channel_list");
  };

  // 転送先チャンネルのデータを追加する関数
  const addTargetChannelList = async (channel_id: string) => {
    // データベースに転送先チャンネルのデータを追加する
    await db.insert(channel_list).values({
      ulid: ulid(),
      channel_id: channel_id, // チャンネルID
      type: 1, // 転送先チャンネル
    });

    // キャッシュを削除する
    await memory_cache.del("target_channel_list");
  };

  // 送信元チャンネルのデータを削除する関数
  const removeSourceChannelList = async (channel_id: string) => {
    // データベースから送信元チャンネルのデータを削除する
    await db.delete(channel_list).where(
      eq(channel_list.channel_id, channel_id) // チャンネルID
    );

    // キャッシュを削除する
    await memory_cache.del("source_channel_list");
  };

  // 転送先チャンネルのデータを削除する関数
  const removeTargetChannelList = async (channel_id: string) => {
    // データベースから転送先チャンネルのデータを削除する
    await db.delete(channel_list).where(
      eq(channel_list.channel_id, channel_id) // チャンネルID
    );

    // キャッシュを削除する
    await memory_cache.del("target_channel_list");
  };

  return {
    getSourceChannelList,
    getTargetChannelList,
    addSourceChannelList,
    addTargetChannelList,
    removeSourceChannelList,
    removeTargetChannelList,
  };
};

export { dbClosure };
