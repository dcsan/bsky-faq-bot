// call the right command based on first /arg
import { BskyBot, Events } from "easy-bsky-bot-sdk";
import { MockBot } from "../test/MockBot";
import { FaqManager } from "../store/FaqManager";

const clog = console

async function dispatchEvent(event: any, bot: BskyBot | MockBot) {
  const { post } = event;
  const text: string = post.text;
  // TODO word boundary
  const chunks = text.match(/(faq )(.*)$/i)
  if (!chunks) {
    clog.warn('no regex match')
    return
  }
  clog.log('faq groups:', chunks)

  if (chunks[1] === 'faq ') {
    // match is 'faq<space>' for the command - TODO word boundaries
    const topic = chunks[2]
    clog.log(`faq topic: [${topic}]`)
    let msg = ''
    const faq = await FaqManager.findFaq(topic)
    if (!faq) {
      msg = `sorry no faq found for [${topic}]`
      clog.warn('no answer for topic', topic)
    } else {
      // format reply
      msg = `faq topic: [${faq.topic}]\nℹ️ ${faq.answer}`
      // TODO add link
      clog.log('faq reply:', msg)
      await bot.reply(msg, post);
    }
  }
}

export {
  dispatchEvent
}
