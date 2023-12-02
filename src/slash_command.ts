import { InteractionType } from "discord-interactions";

// 登録されている送信元チャンネルIDを表示するコマンドの定義
const SHOW_SOURCE_CHANNEL_ID_COMMAND = {
  name: "show_source_channel_id",
  description: "チャンネルIDを表示する",
};

// 登録されている転送先チャンネルIDを表示するコマンドの定義
const SHOW_TARGET_CHANNEL_ID_COMMAND = {
  name: "show_target_channel_id",
  description: "チャンネルIDを表示する",
};

// 送信元チャンネルを追加するコマンドの定義
const ADD_SOUECE_CHANNEL_ID_COMMAND = {
  name: "add_source_channel_id",
  description: "送信元チャンネルIDを追加する",
  options: [
    {
      name: "channel_id",
      description: "チャンネルID",
      type: InteractionType.MESSAGE_COMPONENT,
      required: true,
    },
  ],
};

// 転送先チャンネルを追加するコマンドの定義
const ADD_TARGET_CHANNEL_ID_COMMAND = {
  name: "add_target_channel_id",
  description: "転送先チャンネルIDを追加する",
  options: [
    {
      name: "channel_id",
      description: "チャンネルID",
      type: InteractionType.MESSAGE_COMPONENT,
      required: true,
    },
  ],
};

// 送信元チャンネルを削除するコマンドの定義
const REMOVE_SOURCE_CHANNEL_ID_COMMAND = {
  name: "remove_source_channel_id",
  description: "送信元チャンネルIDを削除する",
  options: [
    {
      name: "channel_id",
      description: "チャンネルID",
      type: InteractionType.MESSAGE_COMPONENT,
      required: true,
    },
  ],
};

// 転送先チャンネルを削除するコマンドの定義
const REMOVE_TARGET_CHANNEL_ID_COMMAND = {
  name: "remove_target_channel_id",
  description: "転送先チャンネルIDを削除する",
  options: [
    {
      name: "channel_id",
      description: "チャンネルID",
      type: InteractionType.MESSAGE_COMPONENT,
      required: true,
    },
  ],
};

type ObjectType = {
  app_permissions: string; // アプリの権限（文字列）
  application_id: string; // アプリケーションのID（文字列）
  channel: {
    flags: number; // チャンネルに関連するフラグ（数値）
    guild_id: string; // ギルド（サーバー）のID（文字列）
    id: string; // チャンネル自体のID（文字列）
    last_message_id: string; // 最後に送信されたメッセージのID（文字列）
    name: string; // チャンネルの名前（文字列）
    nsfw: boolean; // NSFW（Not Safe for Work）かどうか（真偽値）
    parent_id: string; // 親カテゴリのID（文字列）
    permissions: string; // チャンネルの権限（文字列）
    position: number; // チャンネルの位置（数値）
    rate_limit_per_user: number; // ユーザーごとのレート制限（数値）
    topic: null | string; // チャンネルのトピック（nullまたは文字列）
    type: number; // チャンネルのタイプ（数値）
  };
  channel_id: string; // チャンネルのID（文字列）
  data: {
    id: string; // データ項目のID（文字列）
    name: string; // データ項目の名前（文字列）
    options: any[]; // オプション（不明な型の配列）
    type: number; // データ項目のタイプ（数値）
  };
  entitlement_sku_ids: any[]; // エンタイトルメントSKUのID（不明な型の配列）
  entitlements: any[]; // エンタイトルメント（不明な型の配列）
  guild: {
    features: any[]; // ギルド（サーバー）の特徴（不明な型の配列）
    id: string; // ギルド（サーバー）のID（文字列）
    locale: string; // ギルド（サーバー）のロケール（言語設定、文字列）
  };
  guild_id: string; // ギルド（サーバー）のID（文字列）
  guild_locale: string; // ギルド（サーバー）のロケール（言語設定、文字列）
  id: string; // オブジェクト自体のID（文字列）
  locale: string; // ロケール（言語設定、文字列）
  member: {
    avatar: null | string; // メンバーのアバター（nullまたは文字列）
    communication_disabled_until: null | string; // コミュニケーションが無効になる時間（nullまたは文字列）
    deaf: boolean; // メンバーが音声を聞こえない設定か（真偽値）
    flags: number; // メンバーに関するフラグ（数値）
    joined_at: string; // メンバーが参加した時間（文字列）
    mute: boolean; // メンバーがミュートされているか（真偽値）
    nick: null | string; // メンバーのニックネーム（nullまたは文字列）
    pending: boolean; // メンバーの承認が保留中か（真偽値）
    permissions: string; // メンバーの権限（文字列）
    premium_since: null | string; // プレミアム会員になった日（nullまたは文字列）
    roles: any[]; // メンバーの役割（不明な型の配列）
    unusual_dm_activity_until: null | string; // 異常なDM活動が検出されるまでの時間（nullまたは文字列）
    user: {
      avatar: string; // ユーザーのアバター（文字列）
      avatar_decoration_data: null | any; // アバターの装飾データ（nullまたは不明な型）
      discriminator: string; // ユーザーの識別子（文字列）
      global_name: string; // ユーザーのグローバル名（文字列）
      id: string; // ユーザーのID（文字列）
      public_flags: number; // ユーザーに関する公開フラグ（数値）
      username: string; // ユーザー名（文字列）
    };
  };
  token: string; // トークン（文字列）
  type: InteractionType; // オブジェクトのタイプ（数値）
  version: number; // バージョン（数値）
};

// リクエストの形式の定義
type Request = {
  body: ObjectType;
};

export {
  SHOW_SOURCE_CHANNEL_ID_COMMAND,
  SHOW_TARGET_CHANNEL_ID_COMMAND,
  ADD_SOUECE_CHANNEL_ID_COMMAND,
  ADD_TARGET_CHANNEL_ID_COMMAND,
  REMOVE_SOURCE_CHANNEL_ID_COMMAND,
  REMOVE_TARGET_CHANNEL_ID_COMMAND,
  Request,
};
