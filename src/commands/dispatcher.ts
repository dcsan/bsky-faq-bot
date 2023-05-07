// call the right command based on first /arg
import { BskyBot, Events } from "easy-bsky-bot-sdk";
import { MockBot } from "../test/MockBot";
import { faqManager } from "../models/FaqManager";
// import { Faq, FaqReply } from "src/types";
import { gptLib } from "../services/GptLib";
import { mudParser } from "./mudParser";

const clog = console

/**
 * this will also reply to the post
 * @param event
 * @param bot
 * @returns
 */
async function handleInput(event: any, bot: BskyBot | MockBot): Promise<string | undefined> {
  const { post } = event;
  const input = post.text

  // waterfall to find a reply text
  const replyText: string | undefined =
    await mudParser.parseRespond(input) ||
    await faqManager.getReplyText(input) ||
    await gptLib.getReplyText(input)

  if (replyText && typeof replyText === 'string') {
    clog.log('replyText =>', replyText)
    await bot.reply(replyText, post);
  } else {
    const defaultReply = faqManager.notFoundReply(post.text)
    await bot.reply(defaultReply, post);
    console.warn('no reply for input:', post.text)
  }

  if (replyText) {
    return replyText // for testing
  }
  return
}

export {
  handleInput
}
