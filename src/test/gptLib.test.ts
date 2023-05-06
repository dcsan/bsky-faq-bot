// test for dispatcher with mock bot
// import assert from "assert";


import { gptLib } from "../services/GptLib";

const clog = console


async function testGptLib() {

  const checks = [
    // "whats your name",
    "You're in front of a small cave. Are you going to go in or look around?",
    "Who was Einstein?",
    "What should I skeet about?"
  ]

  for (const input of checks) {
    clog.log('testing', { input })
    const result = await gptLib.reply(input)
    clog.log('gpt', { input, result })
  }
}

async function main() {
  await testGptLib().then(res => {
    console.log('done');
  }).catch(err => {
    console.log('err', err);
  })
}

main()
