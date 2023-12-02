const port = process.env.PORT || 3000;
const discord_token = process.env.DISCORD_TOKEN || "";
const user_id = process.env.USER_ID || "";
const db_url = process.env.DATABASE_URL || "";

export { port, discord_token, user_id, db_url };
