import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import postgres from "postgres";
import { Client, Message, TextChannel } from "discord.js";
import { discord_token, user_id, db_url } from "./env";
import { channel_list } from "./schema";

// discordクライアントを作成
const client = new Client({
  intents: ["MessageContent", "Guilds", "GuildMessages"],
});

// ポスグレに接続してクライアントを作成
const db = drizzle(postgres(db_url));

// 特定のユーザーのID
const userId = user_id;

// メッセージを受信するチャンネルのIDのリストと更新日時を含む構造体
const sourceChannelContextStruct = {
  // いつ更新されたかを記録する
  updatedAt: new Date(),
  // メッセージを受信するチャンネルのIDのリスト
  sourceChannelIdList: Array<number>(),
};

// 送信先チャンネルのコンテキストの構造体
const targetChannelContextStruct = {
  // いつ更新されたかを記録する
  updatedAt: new Date(),
  // 送信先チャンネルのコンテキストのリスト
  contexts: Array<TextChannel>(),
};

// 特定のユーザーからのメッセージを特定のチャンネルに転送する
client.on("messageCreate", async (message: Message) => {
  const { author, content, attachments } = message;
  const channelId = Number(message.channelId);
  console.debug(`messageCreate: ${author.id} ${content} ${channelId}`);

  // ユーザが指定したユーザでない場合は何もしない
  if (author.id !== userId) {
    return;
  }

  // メッセージを受信するチャンネルの構造体が
  // 1分以上更新されていない場合は、データベースからチャンネルのIDを取得する
  if (
    new Date().getTime() - sourceChannelContextStruct.updatedAt.getTime() >
    1000 * 60
  ) {
    // データベースからチャンネルのIDを取得する
    const channelList = await db
      .select({
        channel_id: channel_list.channel_id,
      })
      .from(channel_list)
      .where(
        eq(channel_list.type, 0) // 送信元チャンネル
      );

    // チャンネルのIDのリストを更新する
    sourceChannelContextStruct.sourceChannelIdList = channelList.map(
      (channel) => channel.channel_id
    );

    // 更新日時を更新する
    sourceChannelContextStruct.updatedAt = new Date();
  }

  // 構造体のリストに登録されているかを確認
  // 登録されていない場合は何もしない
  if (!sourceChannelContextStruct.sourceChannelIdList.includes(channelId)) {
    console.debug("channel is not registered");
    return;
  }

  // 長さが0でない場合は、データベースに登録されているので、メッセージを送信する
  // メッセージが返信である場合は送信しないようにする
  if (message.reference) {
    console.debug("message is reply");
    return;
  }

  // メッセージを送信するチャンネルの構造体が
  // 1分以上更新されていない場合は、データベースからチャンネルのIDを取得する
  if (
    new Date().getTime() - targetChannelContextStruct.updatedAt.getTime() >
    1000 * 60
  ) {
    // データベースからチャンネルのIDを取得する
    const channelList = await db
      .select({
        channel_id: channel_list.channel_id,
      })
      .from(channel_list)
      .where(
        eq(channel_list.type, 1) // 転送先チャンネル
      );

    // チャンネルのIDのリストを更新する
    targetChannelContextStruct.contexts = channelList.map((channel) => {
      return client.channels.cache.get(
        channel.channel_id.toString()
      ) as TextChannel;
    });

    // 更新日時を更新する
    targetChannelContextStruct.updatedAt = new Date();
  }

  // 添付ファイルがある場合はそれぞれ送信
  if (attachments.size > 0) {
    targetChannelContextStruct.contexts.forEach((context) => {
      context.send({
        files: attachments.map((attachment) => {
          console.debug(`attachment: ${attachment.url}`);
          return {
            attachment: attachment.url,
            name: attachment.name,
          };
        }),
      });
    });
  }

  // コンテンツがある場合は送信
  if (content) {
    targetChannelContextStruct.contexts.forEach((context) => {
      context.send(content);
    });
  }
});

//Botがきちんと起動したか確認
client.once("ready", () => {
  console.log("Ready!");
  if (client.user) {
    console.log(client.user.tag);
  }
});

client.login(discord_token);
