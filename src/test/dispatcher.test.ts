// test for dispatcher with mock bot

import { MockBot, MockEvent } from "./MockBot";
import { getReply } from "../commands/dispatcher";

const clog = console

async function testDispatcher() {
  const bot = new MockBot();
  const event = new MockEvent({
    text: 'hey bot /faq did'
  })
  await getReply(event, bot);
  // TODO export assert
  if (!bot.lastReply.startsWith('faq topic: [DID]\nℹ️ DIDs are unique global identifiers ')) {
    throw new Error('testDispatcher failed')
  }
  clog.log('testDispatcher passed')
}

async function main() {
  await testDispatcher().then(res => {
    console.log('res', res);
  }).catch(err => {
    console.log('err', err);
  })
}

main()
