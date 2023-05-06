// test for dispatcher with mock bot
// import assert from "assert";

import { MockBot, MockEvent } from "./MockBot";
import { handleInput } from "../commands/dispatcher";
import { faqManager } from "../models/FaqManager";

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

async function checkHandleInput(
  input: string,
  expected: string | undefined,
  msg?: string): Promise<string | undefined> {

  clog.log('\n----')

  const event = new MockEvent({
    text: input
  })
  testBot.reset()
  const replyMsg = await handleInput(event, testBot) // reply is stashed in mockbot

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

async function checkFaqReply(
  input: string, expected: string | undefined, msg?: string
): Promise<boolean> {
  const output = await faqManager.getReplyText(input)
  if (output != expected) {
    clog.warn('❌ ', input, '=>', output)
    clog.warn('expected:', expected)
    clog.warn('=>actual:', output)
    msg && clog.warn(msg)
    return false
  }
  return true
}

async function testDispatcher() {
  const checks = [
    // input, expect, msg

    // based on full question matches / string sim
    await checkHandleInput("what's a did", '👀❓ [DID]', '[DID] faq failed'),
    await checkHandleInput("what is a did", '👀❓ [DID]', '[DID] faq failed'),
    await checkHandleInput("What is a PDS", '👀❓ [PDS]', '[PDS] faq failed'),
    await checkHandleInput("What's psky", '👀❓ [psky]', '[psky] faq failed'),

    await checkHandleInput("what in the world is a DID I wonder", '👀❓ [DID]', '[DID] long '),
    await checkHandleInput("onboarding guide", '👀❓ [getting started]'),
    await checkHandleInput("newbie", '👀❓ [getting started]'),


    // single word keyword items
    await checkHandleInput("DID", '👀❓ [DID]', '[DID] faq failed'),
    await checkHandleInput("PDS", '👀❓ [PDS]', '[PDS] faq failed'),
    await checkHandleInput("skeet", '👀❓ [skeet]', 'Skeet faq failed'),
    await checkHandleInput("why honk?", '👀❓ [honk]', 'HONK faq failed'),
    await checkHandleInput("honk", '👀❓ [honk]', 'HONK faq failed'),
    await checkHandleInput("What the hell is a skeet", '👀❓ [skeet]', 'Skeet faq failed'),

    // check not existing items are passed thru
    await checkFaqReply("i do not exist", undefined, 'found non-existent faq'),

  ]
  await Promise.all(checks)
  // clog.log(checks)
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
