// test for dispatcher with mock bot
// import assert from "assert";

import { PostParams } from "easy-bsky-bot-sdk/lib/post";
import { mudParser } from "../commands/mudParser";
// import { AppConfig } from "../utils/AppConfig";
// import { gptLib } from "src/services/GptLib";

const clog = console

const testList = [
  { input: '/help', name: 'help', arg: '' },
  { input: '/go north', name: 'go', arg: 'north' },
  { input: '/go south', name: 'go', arg: 'south' },
]

async function testMudCommands() {
  clog.log('testMudCommands:', testList.length)

  for (let item of testList) {
    const input = item.input;
    clog.log('\n-- item:', item.input)

    const found = await mudParser.parseCommand(input);
    if (!found) {
      clog.error('no cmd found for:', item)
      return
    }
    if (found.name !== item.name) {
      console.error(`name mismatch: ${found.name} !== ${item.name}`)
      console.warn({ item, found })
      continue
    }
    if (found.arg && found.arg != item.arg) {
      console.error(`args mismatch: ${found.arg} !== ${item.arg}`)
      console.warn({ item, found })
      continue
    }
    if (!found.handler) {
      console.error(`handler not found:`, item, found)
      continue
    }

    console.log('✅ ', item.input)
    const postReply: PostParams | undefined = await mudParser.runCommand(found)
    // if (!cmdText) {
    //   console.error('no result for:', item)
    //   continue
    // }

    clog.log('output:', postReply)
  }

}

async function main() {
  testMudCommands();
}

main().catch((err) => {
  console.error(err);
})
