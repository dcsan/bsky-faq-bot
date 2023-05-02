import * as dotenv from "dotenv";
dotenv.config();

function env(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`${key} not set in .env`);
  return value;
}

// define values here so we get intellisense
// read at startup so we throw err on any missing env values
const AppConfig = {
  // bluesky auth
  BOT_HANDLE: env('BOT_HANDLE'),
  BOT_PASSWORD: env('BOT_PASSWORD'),

  // google sheets
  // SERVICE_ACCOUNT_EMAIL: env('SERVICE_ACCOUNT_EMAIL'),
  // SERVICE_ACCOUNT_PRIVATE_KEY: env('SERVICE_ACCOUNT_PRIVATE_KEY'),
  FAQ_SHEET_ID: env('FAQ_SHEET_ID')
}


export { AppConfig }
