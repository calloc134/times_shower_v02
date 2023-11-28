const discord_token = process.env.DISCORD_TOKEN || "";
const user_id = process.env.USER_ID || "";
const source_channel_id = process.env.SOURCE_CHANNEL_ID || "";
const target_channel_id = process.env.TARGET_CHANNEL_ID || "";
const db_url = process.env.DATABASE_URL;
const db_user = process.env.DATABASE_USER;
const db_password = process.env.DATABASE_PASSWORD;
const db_host = process.env.DATABASE_HOST;
const db_port = process.env.DATABASE_PORT;
const db_name = process.env.DATABASE_NAME;

export {
  discord_token,
  user_id,
  source_channel_id,
  target_channel_id,
  db_url,
  db_user,
  db_password,
  db_host,
  db_port,
  db_name,
};
