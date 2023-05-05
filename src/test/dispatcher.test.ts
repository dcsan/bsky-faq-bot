// test for dispatcher with mock bot
// import assert from "assert";

import { MockBot, MockEvent } from "./MockBot";
import { checkFaq } from "../commands/dispatcher";

const clog = console
const testBot = new MockBot();

// function getFaqReply(expected: string, msg: string): boolean {
//   const lastReply = testBot.lastReply
//   if (!lastReply || !lastReply.startsWith(expected)) {
//     clog.warn('error:', msg)
//     clog.warn('expected:', expected)
//     clog.warn('=>actual:', lastReply)
//     return false
//     // throw new Error('testDispatcher failed')
//   }
//   return true
// }

async function checkOne(
  input: string,
  expected: string | undefined,
  msg: string): Promise<string | undefined> {

  clog.log('\n----')

  const event = new MockEvent({
    text: input
  })
  testBot.reset()
  const replyMsg = await checkFaq(event, testBot) // reply is stashed in mockbot

  if (expected == undefined && replyMsg == undefined) {
    clog.log('✅ ', input, '=>', undefined)
    return
  }

  if (replyMsg?.startsWith(expected!)) {
    clog.log('✅ ', input, '=>', replyMsg)
  } else {
    clog.warn('❌ ', input, '=>', replyMsg)
    clog.warn('error:', msg)
    clog.warn('expected:', expected)
    clog.warn('=>actual:', replyMsg)
  }

  return replyMsg
}

async function testDispatcher() {
  const checks = [
    // input, expect, msg
    await checkOne("what's a did", 'ℹ️ [DID]', '[DID] faq failed'),
    await checkOne("what is a did", 'ℹ️ [DID]', '[DID] faq failed'),
    await checkOne("DID", 'ℹ️ [DID]', '[DID] faq failed'),
    await checkOne("PDS", 'ℹ️ [PDS]', '[PDS] faq failed'),
    await checkOne("skeet", 'ℹ️ [skeet]', 'Skeet faq failed'),
    await checkOne("why honk?", 'ℹ️ [honk]', 'HONK faq failed'),
    await checkOne("honk", 'ℹ️ [honk]', 'HONK faq failed'),
    await checkOne("What the hell is a skeet", 'ℹ️ [skeet]', 'Skeet faq failed'),
    await checkOne("i do not exist", undefined, 'found non-existent faq'),
  ]
  await Promise.all(checks)
  clog.log(checks)
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
