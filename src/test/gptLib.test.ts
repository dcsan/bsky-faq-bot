// test for dispatcher with mock bot
// import assert from "assert";


import { mudInstruction } from "../commands/mudPrompts";
import { gptLib } from "../services/GptLib";

const clog = console

const localConfig = {
  instructions: mudInstruction
}


function assertMatch(actual: string, expect: string): boolean {
  if (actual.startsWith(expect)) return true
  console.log('match failed:')
  console.log('  expect: ', expect)
  console.log('  actual: ', actual)
  throw new Error(`expect: ${actual} to start with ${expect}`)
}


describe("test gptLib", () => {
  test("commands", async () => {

    const checks = [
      // "whats your name",
      // "You're in front of a small cave. Are you going to go in or look around?",
      // "Who was Einstein?",
      // "What should I skeet about?",
      "/go north",
      "/look",
    ]

    for (const input of checks) {
      clog.log('testing', { input })
      const result = await gptLib.reply(input, localConfig.instructions)
      clog.log('gpt', { input, result })
    }
  })

  test('expansions', async () => {
    const checks = [
      ["whats your name? WOA", "whats your name?  wrong answers only"],
      ["whats your name? #WOA", "whats your name? # wrong answers only"],
    ]
    for (const [input, expected] of checks) {
      const actual = gptLib.expansions(input)
      assertMatch(actual, expected)
    }
  })

})
