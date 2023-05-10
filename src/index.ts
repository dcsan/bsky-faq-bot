import * as dotenv from "dotenv";
import { BskyBot, Events } from "easy-bsky-bot-sdk";
import { handleInput } from "./commands/dispatcher";
import { atToWeb } from "./utils/atHelpers";

import { AppConfig } from "./utils/AppConfig";
import { faqManager } from "./models/FaqManager";
import { MockBot } from "./test/MockBot";

dotenv.config();
const clog = console

const replyCache: { [key: string]: string } = {};

const localConfig = {
  pollInterval: 5000
}

// async so we can have multiple pings and bots
// TODO - DB
async function checkCache(cid: string): Promise<string | undefined> {
  if (replyCache[cid]) {
    clog.log('already handled', cid, replyCache[cid])
    return replyCache[cid];
  }
  replyCache[cid] = 'x' // handled - fill in value later
  return undefined;
}

async function processReply(event: any, bot: BskyBot | MockBot) {
  const { post } = event;
  const handled = await checkCache(post.cid);
  if (handled) {
    // dont handle twice
    return
  }

  clog.log(`mention=> \nfrom: ${post.author.handle} \ntext: [${post.text}]`);
  await handleInput(event, bot)

  // dont await for these
  bot.like(post);
  // TODO - do not follow if already following
  bot.follow(post.author.did);

}



async function main() {
  const handle = AppConfig.BOT_HANDLE;
  const password = AppConfig.BOT_PASSWORD;

  const botOwner = await {
    handle,
    contact: handle,
  };

  // clog.log('botOwner', botOwner);
  BskyBot.setOwner(botOwner);

  const bot = new BskyBot({
    handle: handle,
    replyToNonFollowers: true,
    showPolling: true
  });
  await bot.login(password);

  // await bot.post({ text: "bot sez hello world" });


  bot.setHandler(Events.MENTION, async (event) => {
    clog.log('[mention] event', event)
    await processReply(event, bot)
  });

  bot.setHandler(Events.REPLY, async (event) => {
    clog.log('[reply] event', event)
    await processReply(event, bot)
    // const { post } = event;
    // const handled = await checkCache(post.cid);
    // if (handled) {
    //   clog.log('[reply] already handled', post.cid)
    //   return
    // }

    // clog.log(`reply=> \nfrom: ${post.author.handle} \ntext: [${post.text}]`);
    // clog.log(`uri: `, atToWeb(post.uri));
    // clog.log('post =>', JSON.stringify(post, null, 2));

    // await bot.like(post);
    // await bot.follow(post.author.did);
    // await handleInput(event, bot)

    // post.mentions.forEach((mention) => {
    //   clog.log(`mention`, mention);
    // });

    // clog.log(`post: https://staging.bsky.app/profile/${user.handle}`);

  });

  bot.setHandler(Events.FOLLOW, async (event) => {
    const { user } = event;
    await bot.follow(user.did);
    clog.log(`\n--\nnew follow: ${user.handle}`);
    clog.log(` uri: https://staging.bsky.app/profile/${user.handle}`);
  });

  bot.startPolling({
    // interval: 10000,  // ms = 10s
    interval: localConfig.pollInterval,  // ms = 10s
  }); // start polling for events
  clog.log("bot started polling:", botOwner);
}

main().catch((err) => {
  console.error("uncaught error in main:", err);
  process.exit(1);
});
