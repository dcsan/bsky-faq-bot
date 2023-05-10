// call the right command based on first /arg
import { BskyBot, Events, PostParam } from "easy-bsky-bot-sdk";
import { MockBot } from "../test/MockBot";
import { faqManager } from "../models/FaqManager";
// import { Faq, FaqReply } from "src/types";
import { gptLib } from "../services/GptLib";
import { mudParser } from "./mudParser";
import { PostParams } from "easy-bsky-bot-sdk/lib/post";

const clog = console

/**
 * this will also reply to the post
 * @param event
 * @param bot
 * @returns
 */
async function handleInput(event: any, bot: BskyBot | MockBot): Promise<PostParams | undefined> {
  const { post } = event;
  const input = post.text

  // waterfall to find a reply text
  const replyPost: PostParams | undefined | string =
    await mudParser.parseRespond(input) ||
    await faqManager.getReplyPost(input) ||
    await gptLib.getReplyPost(input)

  if (replyPost) {
    clog.log('replyText =>', replyPost)
    // @ts-ignore
    await bot.reply(replyPost, post);
  } else {
    const defaultReply = faqManager.notFoundReply(post.text)
    await bot.reply(defaultReply, post);
    console.warn('no reply for input:', post.text)
  }

  if (replyPost) {
    return replyPost // for testing
  }
  return
}

export {
  handleInput
}
