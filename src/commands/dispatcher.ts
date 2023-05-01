// call the right command based on first /arg
import { BskyBot, Events } from "easy-bsky-bot-sdk";
import { MockBot } from "../test/MockBot";

const clog = console

async function dispatchEvent(event: any, bot: BskyBot | MockBot) {
  const { post } = event;
  const text: string = post.text;
  // TODO word boundary
  const groups = text.match(/(faq )(.*)$/)
  if (!groups) {
    clog.warn('no faq match')
    return
  }
  clog.log('groups', groups)
  // match has a space in for the command
  if (groups[1] === 'faq ') {
    const topic = groups[2]
    clog.log(`faq found: [${topic}]`)
    await bot.reply(`faq reply to topic: [${topic}]`, post);
  } else {
    clog.log('no faq match', groups)
  }
}

export {
  dispatchEvent
}
