// call the right command based on first /arg
import { BskyBot, Events } from "easy-bsky-bot-sdk";
import { MockBot } from "../test/MockBot";
import { faqManager } from "../models/FaqManager";

const clog = console

async function getReply(event: any, bot: BskyBot | MockBot): Promise<string | undefined> {
  const { post } = event;
  const text: string = post.text;
  // TODO word boundary
  const chunks = text.match(/(faq )(.*)$/i)
  if (!chunks) {
    // TODO more cmds
    clog.warn('no regex match for faq')
    return undefined
  }
  clog.log('faq groups:', chunks)

  let msg = ''
  if (chunks[1] === 'faq ') {
    // match is 'faq<space><topic>' for the command - TODO word boundaries
    const topic = chunks[2]
    clog.log(`faq topic: [${topic}]`)
    const faq = await faqManager.findFaq(topic)
    if (!faq) {
      msg = `sorry no faq found for [${topic}]`
      clog.warn(msg)
      await bot.reply(msg, post);
    } else {
      // format reply
      msg = `faq topic: [${faq.topic}]\nℹ️ ${faq.answer}`
      // TODO add link
      clog.log('faq reply:', msg)
    }
  }

  return msg

}

export {
  getReply
}
