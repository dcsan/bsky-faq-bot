// call the right command based on first /arg
import { BskyBot, Events } from "easy-bsky-bot-sdk";
import { MockBot } from "../test/MockBot";
import { faqManager } from "../models/FaqManager";
import { Faq, FaqReply } from "src/types";

const clog = console


async function checkFaq(event: any, bot: BskyBot | MockBot): Promise<FaqReply | undefined> {
  const { post } = event;
  const text: string = post.text;
  const faqReply = await faqManager.getReply(text)
  if (faqReply && faqReply?.reply) {
    await bot.reply(faqReply.reply, post);
    return faqReply
  }
  return undefined   // if no message in the reply
}

export {
  checkFaq as getReply
}
