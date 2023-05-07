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
    if (found.args && found.args[0] != item.args[0]) {
      console.error(`args mismatch: ${found.args} !== ${item.args}`)
      console.warn({ item, found })
      continue
    }
    if (!found.handler) {
      console.error(`handler not found:`, item, found)
      continue
    }

    console.log('✅ ', item.input)
    const result = await mudParser.runCommand(found)
    clog.log('cmd.result:', result)

  }

}

async function main() {
  testMudCommands();
}

main().catch((err) => {
  console.error(err);
})
