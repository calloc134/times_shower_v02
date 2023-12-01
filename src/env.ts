const discord_token = process.env.DISCORD_TOKEN || "";
const user_id = process.env.USER_ID || "";
const source_channel_id = process.env.SOURCE_CHANNEL_ID || "";
const target_channel_id = process.env.TARGET_CHANNEL_ID || "";
const db_url = process.env.DATABASE_URL || "";

export {
  discord_token,
  user_id,
  source_channel_id,
  target_channel_id,
  db_url
};
