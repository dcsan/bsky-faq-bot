import * as dotenv from "dotenv";
import { BskyBot, Events } from "easy-bsky-bot-sdk";
import { getReply } from "./commands/dispatcher";

dotenv.config();

async function main() {
  const handle = process.env.BOT_HANDLE;
  if (!handle) throw new Error("BOT_HANDLE not set in .env");
  const password = process.env.BOT_PASSWORD;
  if (!password) throw new Error("BOT_PASSWORD not set in .env");

  const botOwner = await {
    handle,
    contact: handle,
  };

  // console.log('botOwner', botOwner);
  BskyBot.setOwner(botOwner);

  const bot = new BskyBot({
    handle: handle,
  });

  await bot.login(password);

  // await bot.post({ text: "bot sez hello world" });

  bot.setHandler(Events.MENTION, async (event) => {
    const { post } = event;
    console.log(`got mention from ${post.author.handle}: ${post.text}`);
    await bot.like(post);
    const msg: string | undefined = await getReply(event, bot);
    if (msg) {
      await bot.reply(msg, post);
    }
  });

  bot.setHandler(Events.REPLY, async (event) => {
    const { post } = event;
    await bot.like(post);
    console.log(`got reply from: [${post.author.handle}]`);
    console.log(`uri: ${post.uri}`);
    console.log(`text: ${post.text}`);
    post.mentions.forEach((mention) => {
      console.log(`mention`, mention);
    });

    console.log('post =>', JSON.stringify(post, null, 2));
    // console.log(`post: https://staging.bsky.app/profile/${user.handle}`);

  });

  bot.setHandler(Events.FOLLOW, async (event) => {
    const { user } = event;
    await bot.follow(user.did);
    console.log(`\n new follow: ${user.handle}`);
    console.log(` uri: https://staging.bsky.app/profile/${user.handle}`);
  });

  bot.startPolling({
    interval: 10000,  // ms = 10s
  }); // start polling for events
  console.log("bot started polling:", botOwner);
}

main().catch((err) => {
  console.error("uncaught error in main:", err);
  process.exit(1);
});
