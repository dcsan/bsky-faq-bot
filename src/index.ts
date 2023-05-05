import * as dotenv from "dotenv";
import { BskyBot, Events } from "easy-bsky-bot-sdk";
import { checkFaq } from "./commands/dispatcher";
import { atToWeb } from "./utils/atHelpers";

import { AppConfig } from "./utils/AppConfig";
import { faqManager } from "./models/FaqManager";

dotenv.config();

async function main() {
  const handle = AppConfig.BOT_HANDLE;
  const password = AppConfig.BOT_PASSWORD;

  const botOwner = await {
    handle,
    contact: handle,
  };

  // console.log('botOwner', botOwner);
  BskyBot.setOwner(botOwner);

  const bot = new BskyBot({
    handle: handle,
    replyToNonFollowers: true,
  });

  await bot.login(password);

  // await bot.post({ text: "bot sez hello world" });

  bot.setHandler(Events.MENTION, async (event) => {
    const { post } = event;
    console.log(`got mention from ${post.author.handle}: ${post.text}`);
    await bot.like(post);

    // const { user } = event;
    // await bot.follow(user.did);

    const reply: string | undefined = await checkFaq(event, bot)

    if (reply && typeof reply === 'string') {
      await bot.reply(reply, post);
    } else {
      const defaultReply = faqManager.notFoundReply(post.text)
      await bot.reply(defaultReply, post);
      console.warn('no reply for input:', post.text)
    }
    // TODO chatGPT etc
  });

  bot.setHandler(Events.REPLY, async (event) => {
    const { post } = event;
    await bot.like(post);
    console.log(`\n--\ngot reply from: `, post.author.handle);
    console.log(`uri: `, atToWeb(post.uri));
    console.log(`text: `, post.text);
    post.mentions.forEach((mention) => {
      console.log(`mention`, mention);
    });

    console.log('post =>', JSON.stringify(post, null, 2));
    // console.log(`post: https://staging.bsky.app/profile/${user.handle}`);

  });

  bot.setHandler(Events.FOLLOW, async (event) => {
    const { user } = event;
    await bot.follow(user.did);
    console.log(`\n--\nnew follow: ${user.handle}`);
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
