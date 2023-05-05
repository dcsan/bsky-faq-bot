// call the right command based on first /arg
import { BskyBot, Events } from "easy-bsky-bot-sdk";
import { MockBot } from "../test/MockBot";
import { faqManager } from "../models/FaqManager";
import { Faq, FaqReply } from "src/types";

const clog = console

/**
 * this will also reply to the post
 * @param event
 * @param bot
 * @returns
 */
async function checkFaq(event: any, bot: BskyBot | MockBot): Promise<string | undefined> {
  const { post } = event;
  const reply: string | undefined = await faqManager.getFormattedReplyOrDefault(post.text)
  if (reply) {
    await bot.reply(reply, post);
    return reply // for testing
  }
  return
}

export {
  checkFaq
}
