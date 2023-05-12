import { genImage } from "../services/StabAi";
import { gptLib } from "../services/GptLib";
import { MudCommand } from "../types";
import { AppConfig } from "../utils/AppConfig";
import { mudInstruction } from "./mudPrompts";
import { PostParams } from "easy-bsky-bot-sdk/lib/post";


const clog = console

// todo handle direct responses like "take what?"
// handle "you can't do that" responses
// handle "you can't go that way" responses
// plaintext responses vs those needing more
// go/look/... only without a /slash = show hint for now
// how to pass through more fuzzy commands without it going to the basic GPT facts responder?

// TODO: /drop /inventory /help

const localConfig = {
  instruction: mudInstruction // system message on each prompt
}

class MudParser {

  cmdList: MudCommand[]

  constructor() {
    const cmdList: MudCommand[] = [
      {
        keys: ['/help'],
        name: 'help',
        handler: this.help,
        help: '[help]\ncommands are: \n/go <direction> \n/look <item>\n/take <item>',
        type: 'text'
      },

      {
        keys: ['/go'],
        name: 'go',
        handler: this.go,
      },

      {
        keys: ['/look', '/inspect', '/examine', '/search', '/find', '/read', '/listen', '/smell', '/taste'],
        name: 'look',
        handler: this.look,
      },
      {
        name: 'take',
        keys: ['/take', '/get', '/pickup'],
        handler: this.take,
      },
      {
        name: 'use',
        keys: ['/use', '/open', '/unlock'],
        handler: this.take,
      },

    ]
    this.cmdList = cmdList
  }

  stripBotName(input: string): string {
    let content = input
    if (input.includes(AppConfig.BOT_HANDLE)) {
      const parts = input.split(AppConfig.BOT_HANDLE)
      if (parts.length == 1) {
        content = input // actually its just the name then?
      } else if (parts.length == 2) {
        // @name rest = 2 parts
        const [name, rest] = parts
        content = rest
      } else {
        // ok @name rest = 3 parts
        const [before, name, rest] = parts
        content = rest
      }
      clog.log('parseForBotName:', content)
    } else {
      content = input
    }
    return content
  }

  async parseRespond(input: string): Promise<PostParams | undefined> {

    const found = await mudParser.parseCommand(input);
    if (!found) {
      return undefined
    }

    const postReply: PostParams | undefined = await mudParser.runCommand(found)
    clog.log('mud response=>\n', { input, found, postReply })
    return postReply
  }

  async parseCommand(input: string): Promise<MudCommand | undefined> {
    if (!input) {
      clog.error('no input for command')
      return
    }

    // const content = input
    const content = this.stripBotName(input) // bot name is never passed

    let key = content.split(' ')[0];

    // first one
    const cmd = this.cmdList.find((cmd) => {
      return cmd.keys.includes(key)
    })

    if (!cmd) {
      clog.warn('no cmd found for:', key)
      return undefined
    }

    let arg = content.split(key)[1];  // everything after the key
    arg = arg.trim()
    // const args = after.split(' ');
    // clog.log({ after, args })

    // @ts-ignore
    // const handler: any = this[cmd.func]

    // clog.log(`cmd key: ${key}, arg: ${after} `)

    if (!key) {
      return undefined;
    }
    const result = {
      arg,
      // handler,
      input,
      ...cmd,
    }

    clog.log('cmd:', result)
    return result

  }

  public async runCommand(cmd: MudCommand): Promise<PostParams | undefined> {

    if (cmd.type === 'text') {
      return {
        text: cmd.help!
      }
    }

    if (!cmd.handler) {
      throw new Error('no handler for cmd:' + cmd.name)
    }
    const cmdText = await (cmd.handler(cmd.arg))
    const prompt = await mudParser.wrapCommand(cmdText)
    // clog.log('cmd.result:', { result: cmdText, prompt })
    const response = await gptLib.reply(prompt, localConfig.instruction)

    let postReply: PostParams = {
      text: response.output
    }

    // for look commands lets grab an image
    if (cmd.name === 'look') {
      const paths: string[] = await genImage(response.output)
      postReply.imageUrl = paths[0]
      postReply.imageAlt = response.output
    }

    return postReply
  }

  public async help(arg: string | undefined): Promise<string> {
    clog.log('help.cmd')
    return `help ${arg}`
  }

  public async go(arg: string | undefined): Promise<string> {
    clog.log('go.cmd')
    return `go ${arg}`
  }

  public async look(arg: string | undefined): Promise<string> {
    if (arg) {
      return `look at ${arg}`
    } else {
      return `look`
    }
  }

  public async take(arg: string | undefined): Promise<string> {
    if (arg) {
      return `take the ${arg}`
    } else {
      return `take`
    }
  }

  async wrapCommand(text: string) {
    return text
    // const output = localConfig.instruction.replace('[USER_COMMAND]', text)
    // return output
  }

}


const mudParser = new MudParser()

export { mudParser }
