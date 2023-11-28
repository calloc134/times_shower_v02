import { Client, Message, TextChannel } from "discord.js";
// import { drizzle } from "drizzle-orm/postgres-js";
// import { migrate } from "drizzle-orm/postgres-js/migrator";
// import postgres from "postgres";
import {
  discord_token,
  user_id,
  source_channel_id,
  target_channel_id,
} from "./env";

const client = new Client({
  intents: ["MessageContent", "Guilds", "GuildMessages"],
});

// 特定のユーザーのID
const userId = user_id;

// メッセージを受信するチャンネルのID
const sourceChannelId = source_channel_id;

// メッセージを送信するチャンネルのID
const targetChannelId = target_channel_id;

// 送信先チャンネルのコンテキスト
let targetChannelContext: TextChannel | undefined;

// 特定のユーザーからのメッセージを特定のチャンネルに転送する
client.on("messageCreate", (message: Message) => {
  const { author, content, attachments, channelId } = message;
  console.debug(`messageCreate: ${author.id} ${content} ${channelId}`);

  // ユーザが指定したユーザで、かつメッセージを受信するチャンネルが指定したチャンネルの場合
  if (author.id === userId && channelId === sourceChannelId) {
    // 送信先チャンネルのコンテキストが取得できていない場合はエラー
    if (!targetChannelContext) {
      console.error("targetChannelContext is undefined");
      return;
    }

    // メッセージが返信である場合は送信しないようにする
    if (message.reference) {
      console.debug("message is reply");
      return;
    }

    // 添付ファイルがある場合は送信
    if (attachments.size > 0) {
      targetChannelContext.send({
        files: attachments.map((attachment) => {
          console.debug(`attachment: ${attachment.url}`);
          return {
            attachment: attachment.url,
            name: attachment.name,
          };
        }),
      });
    }

    // コンテンツがある場合は送信
    if (content) {
      targetChannelContext.send(content);
    }
  }
});

//Botがきちんと起動したか確認
client.once("ready", () => {
  console.log("Ready!");
  if (client.user) {
    console.log(client.user.tag);
  }

  // 送信先チャンネルのコンテキストを取得
  targetChannelContext = client.channels.cache.get(
    targetChannelId
  ) as TextChannel;
});

client.login(discord_token);
