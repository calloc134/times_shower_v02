import { Client, Message, TextChannel } from "discord.js";
import {
  InteractionResponseType,
  InteractionType,
  verifyKey,
} from "discord-interactions";
import fastify from "fastify";
import { fastifyRawBody } from "fastify-raw-body";
import { discord_token, user_id, db_url, port, public_key } from "./env";

import {
  SHOW_SOURCE_CHANNEL_ID_COMMAND,
  SHOW_TARGET_CHANNEL_ID_COMMAND,
  ADD_SOUECE_CHANNEL_ID_COMMAND,
  ADD_TARGET_CHANNEL_ID_COMMAND,
  REMOVE_SOURCE_CHANNEL_ID_COMMAND,
  REMOVE_TARGET_CHANNEL_ID_COMMAND,
  Request,
} from "./slash_command";
import { dbClosure } from "./dbClosure";

const main = async () => {
  // discordクライアントを作成
  const client = new Client({
    intents: ["MessageContent", "Guilds", "GuildMessages"],
  });

  // データベースのクライアントの作成
  const {
    getSourceChannelList,
    getTargetChannelList,
    addSourceChannelList,
    removeSourceChannelList,
    addTargetChannelList,
    removeTargetChannelList,
  } = await dbClosure(db_url);

  // 特定のユーザーからのメッセージを特定のチャンネルに転送する
  client.on("messageCreate", async (message: Message) => {
    const { author, content, attachments } = message;
    const channel_id = message.channelId;
    console.log(`messageCreate: ${author.id} ${content} ${channel_id}`);

    // ユーザが指定したユーザでない場合は何もしない
    if (author.id !== user_id) {
      return;
    }

    // 送信元チャンネルのセットを取得
    const source_channel_set = await getSourceChannelList();
    // 登録されていない場合は何もしない
    if (!source_channel_set.has(channel_id)) {
      console.error("channel is not registered");
      return;
    }

    // 長さが0でない場合は、データベースに登録されているので、メッセージを送信する
    // メッセージが返信である場合は送信しないようにする
    if (message.reference) {
      console.error("message is reply");
      return;
    }

    // もしメッセージが"；"で始まっている場合は何もしない
    if (content.startsWith("；")) {
      console.error("message starts with '；'");
      return;
    }

    // メッセージを送信するチャンネルのセットを取得
    const target_channel_list = (await getTargetChannelList()).map(
      (channel) => {
        // チャンネルがない場合は何もしない
        if (!channel) {
          return;
        }
        return client.channels.cache.get(channel) as TextChannel;
      }
    );

    // 添付ファイルがある場合はそれぞれ送信
    if (attachments.size > 0) {
      target_channel_list.forEach((channel) => {
        // チャンネルがない場合は何もしない
        if (!channel) {
          return;
        }
        // ファイルを送信
        channel.send({
          files: attachments.map((attachment) => attachment.url),
        });
      });
    }

    // https://twitter.comまたはhttps://x.comのリンクを含む場合は、https://fxtwitter.comに置換する
    const replaced_content1 = content.replace(
      /https?:\/\/twitter\.com|https?:\/\/x\.com/g,
      "https://fxtwitter.com"
    );

    target_channel_list.forEach((channel) => {
      // チャンネルがない場合は何もしない
      if (!channel) {
        return;
      }
      // メッセージを送信
      channel.send(replaced_content1);
    });
  });

  //Botがきちんと起動したか確認
  client.once("ready", () => {
    console.info("Ready!");
    if (client.user) {
      console.info(client.user.tag);
    }
  });

  // fastifyのインスタンスを作成
  const server = fastify({
    logger: true,
  });

  // fastifyのインスタンスにfastifyRawBodyを登録
  await server.register(fastifyRawBody, {
    runFirst: true,
  });

  client.login(discord_token);

  // スラッシュコマンドの実装

  // ルーティングの定義
  server.get("/", (_, response) => {
    console.info("Handling GET request");
    response.send({ hello: "world" });
  });

  // リクエストの前処理として署名の検証を行う
  server.addHook("preHandler", async (request, response) => {
    // ヘッダの内容をログとして出力
    console.info("x-signature-ed25519", request.headers["x-signature-ed25519"]);
    console.info(
      "x-signature-timestamp",
      request.headers["x-signature-timestamp"]
    );
    console.info("rawBody", request.rawBody);

    // 形式がPOSTの場合のみ署名の検証を行う
    if (request.method === "POST") {
      const signature = request.headers["x-signature-ed25519"];
      const timestamp = request.headers["x-signature-timestamp"];

      // 署名の検証を行う
      const isValidRequest = verifyKey(
        request.rawBody || "",
        // @ts-expect-error
        signature,
        timestamp,
        public_key
      );

      // 署名の検証に失敗した場合はその時点で401エラーを返す
      if (!isValidRequest) {
        console.info("Invalid Request");
        return response.status(401).send({ error: "Bad request signature " });
      }
    }
  });

  // POSTリクエストの処理
  server.post<{
    Body: Request["body"];
  }>("/", async (request, response) => {
    // リクエストのメッセージを取得
    const message = request.body;

    // PINGの場合はPONGを返す
    // メッセージのタイプに応じて処理を分岐
    if (message.type === InteractionType.PING) {
      // もし、メッセージのタイプがPONGだった場合はPONGを返す
      console.info("Handling Ping request");
      response.send({
        type: InteractionResponseType.PONG,
      });
    }

    // 送信ユーザを取得
    const user = message.member.user;

    // もし投稿者が指定されたユーザでない場合は400エラーを返す
    if (user.id !== user_id) {
      console.error("User is not allowed");
      return response.status(200).send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `投稿者が不正です`,
        },
      });
    }

    if (message.type === InteractionType.APPLICATION_COMMAND) {
      // もし、メッセージのタイプがAPPLICATION_COMMANDだった場合はコマンドの処理を行う
      console.info("Handling Application Command request");

      // コマンドの種類に応じて処理を分岐
      switch (message.data.name) {
        // もし、コマンドの種類がPOSTだった場合は投稿の処理を行う

        case SHOW_SOURCE_CHANNEL_ID_COMMAND.name: {
          // チャンネルリストを取得
          const source_channel_set = await getSourceChannelList();

          // チャンネルリストを表示する
          console.info("Success to show channel IDs");
          return response.status(200).send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `チャンネルID一覧: ${Array.from(
                source_channel_set.values()
              ).join(", ")}`,
            },
          });
        }
        case SHOW_TARGET_CHANNEL_ID_COMMAND.name: {
          // チャンネルリストを取得
          const target_channel_list = await getTargetChannelList();

          // チャンネルリストを表示する
          console.info("Success to show channel IDs");
          return response.status(200).send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `チャンネルID一覧: ${target_channel_list.join(", ")}`,
            },
          });
        }
        case ADD_SOUECE_CHANNEL_ID_COMMAND.name: {
          // チャンネルIDを取得
          const channelId = message.data.options.find(
            (option) =>
              option.name === ADD_SOUECE_CHANNEL_ID_COMMAND.options[0].name
          )?.value;

          // チャンネルIDがない場合は400エラーを返す
          if (!channelId) {
            console.error("Channel ID is empty");
            return response.status(200).send({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                content: `チャンネルIDが空です`,
              },
            });
          }
          try {
            // チャンネルIDを追加する
            await addSourceChannelList(channelId);
          } catch (error) {
            console.error(error);
            // もし、チャンネルIDの追加に失敗した場合は500エラーを返す
            console.error("Failed to add channel ID");
            return response.status(200).send({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                content: `チャンネルIDの追加に失敗しました: ${channelId}`,
              },
            });
          }

          // チャンネルIDを追加したことを返す
          console.info("Success to add channel ID");
          return response.status(200).send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `チャンネルIDを追加しました: ${channelId}`,
            },
          });
        }
        case ADD_TARGET_CHANNEL_ID_COMMAND.name: {
          // チャンネルIDを取得
          const channelId = message.data.options.find(
            (option) =>
              option.name === ADD_TARGET_CHANNEL_ID_COMMAND.options[0].name
          )?.value;

          // チャンネルIDがない場合は400エラーを返す
          if (!channelId) {
            console.error("Channel ID is empty");
            return response.status(200).send({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                content: `チャンネルIDが空です`,
              },
            });
          }
          try {
            // チャンネルIDを追加する
            await addTargetChannelList(channelId);
          } catch (error) {
            console.error(error);
            // もし、チャンネルIDの追加に失敗した場合は500エラーを返す
            console.error("Failed to add channel ID");
            return response.status(200).send({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                content: `チャンネルIDの追加に失敗しました: ${channelId}`,
              },
            });
          }

          // チャンネルIDを追加したことを返す
          console.info("Success to add channel ID");
          return response.status(200).send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `チャンネルIDを追加しました: ${channelId}`,
            },
          });
        }
        case REMOVE_SOURCE_CHANNEL_ID_COMMAND.name: {
          // チャンネルIDを取得
          const channelId = message.data.options.find(
            (option) =>
              option.name === REMOVE_SOURCE_CHANNEL_ID_COMMAND.options[0].name
          )?.value;

          // チャンネルIDがない場合は400エラーを返す
          if (!channelId) {
            console.error("Channel ID is empty");
            return response.status(200).send({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                content: `チャンネルIDが空です`,
              },
            });
          }

          try {
            // クエリを削除する
            await removeSourceChannelList(channelId);
          } catch (error) {
            console.error(error);
            // もし、チャンネルIDの削除に失敗した場合は500エラーを返す
            console.error("Failed to remove channel ID");
            return response.status(200).send({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                content: `チャンネルIDの削除に失敗しました: ${channelId}`,
              },
            });
          }

          // チャンネルIDを削除したことを返す
          console.info("Success to remove channel ID");
          return response.status(200).send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `チャンネルIDを削除しました: ${channelId}`,
            },
          });
        }
        case REMOVE_TARGET_CHANNEL_ID_COMMAND.name: {
          // チャンネルIDを取得
          const channelId = message.data.options.find(
            (option) =>
              option.name === REMOVE_TARGET_CHANNEL_ID_COMMAND.options[0].name
          )?.value;

          // チャンネルIDがない場合は400エラーを返す
          if (!channelId) {
            console.error("Channel ID is empty");
            return response.status(200).send({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                content: `チャンネルIDが空です`,
              },
            });
          }

          try {
            // クエリを削除する
            await removeTargetChannelList(channelId);
          } catch (error) {
            console.error(error);
            // もし、チャンネルIDの削除に失敗した場合は500エラーを返す
            console.error("Failed to remove channel ID");
            return response.status(200).send({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                content: `チャンネルIDの削除に失敗しました: ${channelId}`,
              },
            });
          }

          // チャンネルIDを削除したことを返す
          console.info("Success to remove channel ID");
          return response.status(200).send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `チャンネルIDを削除しました: ${channelId}`,
            },
          });
        }
        default: {
          console.error("Unknown Command");
          response.status(200).send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `不明なコマンドです`,
            },
          });
        }
      }
    } else {
      console.error("Unknown Type");

      response.status(200).send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `不明なタイプです`,
        },
      });
    }
  });

  server
    .listen({
      port: Number(port),
      host: "0.0.0.0",
    })
    .then((address) => {
      console.info(`Server listening on ${address}`);
    });
};

main();
