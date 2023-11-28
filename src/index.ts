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

  if (author.id === userId && channelId === sourceChannelId) {
    if (!targetChannelContext) {
      console.error("targetChannelContext is undefined");
      return;
    }

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

  targetChannelContext = client.channels.cache.get(
    targetChannelId
  ) as TextChannel;
});

client.login(discord_token);
