// test for dispatcher with mock bot
// import assert from "assert";

import { AppConfig } from "../utils/AppConfig";
import { mudParser } from "../commands/mudCommands";

const clog = console

const testList = [
  { input: '/help', name: 'help', args: [''] },
  { input: '/go north', name: 'go', args: ['north'] },
  { input: '/go south', name: 'go', args: ['south'] },
]

async function testMudCommands() {
  clog.log('testMudCommands:', testList.length)

  for (let item of testList) {
    const input = item.input;

    const found = await mudParser.parseCommand(input);
    if (!found) {
      clog.error('no cmd found for:', item)
      return
    }
    if (found.name !== item.name) {
      console.error(`name mismatch: ${found.name} !== ${item.name}`)
      console.warn({ item, found })
    }
    else if (found.args && found.args[0] != item.args[0]) {
      console.error(`args mismatch: ${found.args} !== ${item.args}`)
      console.warn({ item, found })
    } else {
      console.log('✅ ', item.input)
    }
  }

}

async function main() {
  testMudCommands();
}

main().catch((err) => {
  console.error(err);
})
