// test for dispatcher with mock bot
// import assert from "assert";

import { MockBot, MockEvent } from "./MockBot";
import { checkFaq } from "../commands/dispatcher";

const clog = console
const testBot = new MockBot();

function checkReply(expected: string, msg: string): boolean {
  const lastReply = testBot.lastReply
  if (!lastReply || !lastReply.startsWith(expected)) {
    clog.warn('error:', msg)
    clog.warn('expected:', expected)
    clog.warn('=>actual:', lastReply || '## NONE ##')
    return false
    // throw new Error('testDispatcher failed')
  }
  return true
}

async function checkOne(
  input: string,
  expected: string,
  msg: string) {
  const event = new MockEvent({
    text: input
  })
  await checkFaq(event, testBot) // reply is stashed in mockbot

  if (!checkReply(expected, msg)) {
    throw new Error('testDispatcher failed')
  }
}

async function testDispatcher() {
  const check1 = checkOne('faq did', 'faq topic: [DID]', '[DID] faq failed')
  // clog.log('testDispatcher passed')
}

async function main() {
  await testDispatcher().then(res => {
    console.log('done');
  }).catch(err => {
    console.log('err', err);
  })
}

main()
