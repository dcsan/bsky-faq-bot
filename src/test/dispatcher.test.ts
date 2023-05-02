// test for dispatcher with mock bot
import assert from "assert";

import { MockBot, MockEvent } from "./MockBot";
import { getReply } from "../commands/dispatcher";

const clog = console

async function testDispatcher() {
  const bot = new MockBot();
  const event = new MockEvent({
    text: 'hey bot /faq did'
  })
  const reply = await getReply(event, bot);
  assert(reply, 'reply is undefined')

  await bot.reply(reply!) // stash in bot.lastReply
  // TODO export assert
  const expected = 'faq topic: [DID]'
  if (!bot.lastReply.startsWith(expected)) {
    clog.warn('expected:', expected)
    clog.warn('=>actual:', bot.lastReply)
    throw new Error('testDispatcher failed')
  }
  clog.log('testDispatcher passed')
}

async function main() {
  await testDispatcher().then(res => {
    console.log('done');
  }).catch(err => {
    console.log('err', err);
  })
}

main()
