// test for dispatcher with mock bot
// import assert from "assert";

import { MockBot, MockEvent } from "./MockBot";
import { handleInput } from "../commands/dispatcher";
import { faqManager } from "../models/FaqManager";

const clog = console
const testBot = new MockBot();

/**
 * check whole input chain including openAI/GPT replies
 * @param input
 * @param expected
 * @param msg
 * @returns
 */
async function checkHandleInput(
  input: string,
  expected: string | undefined,
  msg?: string
): Promise<boolean> {

  const event = new MockEvent({
    text: input
  })
  testBot.reset()
  const actual = await handleInput(event, testBot) // reply is stashed in mockbot
  return assertMatch(input, expected, actual, msg)
}

/**
 * just check the FAQ manager - keywords/fuzzy string
 * @param input
 * @param expected
 * @param msg
 * @returns
 */
async function checkFaqReply(
  input: string,
  expected: string | undefined,
  msg?: string
): Promise<boolean> {
  const actual = await faqManager.getReplyText(input)
  return assertMatch(input, expected, actual, msg)
}

/**
 * show message on output pass/fail
 * @param input
 * @param expected
 * @param actual
 * @param msg
 * @returns
 */
function assertMatch(
  input: string,
  expected: string | undefined,
  actual: string | undefined,
  msg?: string
): boolean {

  if (expected == undefined && actual == undefined) {
    clog.log('✅ ', input, '=>', undefined)
    return true
  }

  if (actual?.startsWith(expected!)) {
    clog.log('✅ ', input, '=>', actual.split('\n')[0])
    return true
  } else {
    clog.warn('❌ ', input, '=>', actual)
    clog.warn('error:', msg)
    clog.warn('expected:', expected)
    clog.warn('=>actual:', actual)
    return false
  }

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

    // keywords with boundaries
    await checkFaqReply("tell me about shitposting", undefined, 'should NOT match shitposting (on post/skeet)'),
    await checkFaqReply("tell me a post", '👀❓ [skeet]', 'SHOULD match on post'),
    await checkFaqReply("Why not use ActivityPub?", '👀❓ [ActivityPub]', 'punctuation on user keyword input'),

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
