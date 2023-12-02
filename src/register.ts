import fetch from "node-fetch";
import {
  SHOW_SOURCE_CHANNEL_ID_COMMAND,
  SHOW_TARGET_CHANNEL_ID_COMMAND,
  ADD_SOUECE_CHANNEL_ID_COMMAND,
  ADD_TARGET_CHANNEL_ID_COMMAND,
  REMOVE_SOURCE_CHANNEL_ID_COMMAND,
  REMOVE_TARGET_CHANNEL_ID_COMMAND,
} from "./slash_command";

const main = async () => {
  const APPLICATION_ID = "";
  const BOT_TOKEN = "";

  const result = await fetch(
    `https://discord.com/api/v8/applications/${APPLICATION_ID}/commands`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        SHOW_SOURCE_CHANNEL_ID_COMMAND,
        SHOW_TARGET_CHANNEL_ID_COMMAND,
        ADD_SOUECE_CHANNEL_ID_COMMAND,
        ADD_TARGET_CHANNEL_ID_COMMAND,
        REMOVE_SOURCE_CHANNEL_ID_COMMAND,
        REMOVE_TARGET_CHANNEL_ID_COMMAND,
      ]),
    }
  );

  // 成功の可否と、レスポンスの内容を表示
  console.log(result.status);
  console.log(await result.json());
};

main();
