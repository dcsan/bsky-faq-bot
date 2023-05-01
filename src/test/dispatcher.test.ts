// test for dispatcher with mock bot

import { MockBot, MockEvent } from "./MockBot";
import { dispatchEvent } from "../commands/dispatcher";


async function testDispatcher() {
  const bot = new MockBot();
  const event = new MockEvent({
    text: 'faq moot'
  })
  await dispatchEvent(event, bot);
}

async function main() {
  await testDispatcher().then(res => {
    console.log('res', res);
  }).catch(err => {
    console.log('err', err);
  })
}

main()
