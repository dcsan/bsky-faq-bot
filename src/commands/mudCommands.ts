import { gptLib } from "../services/GptLib";
import { MudCommand } from "../types";
import { AppConfig } from "../utils/AppConfig";
import { mudWrapper } from "./mudPrompts";


const clog = console


class MudParser {

  cmdList: MudCommand[]

  constructor() {
    const cmdList: MudCommand[] = [
      {
        keys: ['/help'],
        name: 'help',
        handler: this.help,
      },
      {
        keys: ['/go'],
        name: 'go',
        handler: this.go,
      },
      {
        keys: ['/look'],
        name: 'look',
        handler: this.look,
      }
    ]
    this.cmdList = cmdList
  }

  parseForBotName(input: string) {

    let content
    if (input.includes(AppConfig.BOT_HANDLE)) {
      content = input.split(AppConfig.BOT_HANDLE)[1]
    } else {
      content = input
    }
    return content
  }

  async parseCommand(input: string): Promise<MudCommand | undefined> {
    if (!input) {
      clog.error('no input for command')
      return
    }

    const content = this.parseForBotName(input)
    let key = content.split(' ')[0];

    // first one
    const cmd = this.cmdList.find((cmd) => {
      return cmd.keys.includes(key)
    })
    if (!cmd) {
      clog.warn('no cmd found for:', key)
      return undefined
    }

    let after = content.split(key)[1];  // everything after the key
    after = after.trim()
    const args = after.split(' ');
    // clog.log({ after, args })

    // @ts-ignore
    // const handler: any = this[cmd.func]

    // clog.log(`cmd key: ${key}, arg: ${after} `)

    if (!key) {
      return undefined;
    }
    const result = {
      args,
      // handler,
      input,
      ...cmd,
    }

    clog.log('cmd:', result)
    return result

  }

  public async runCommand(cmd: MudCommand): Promise<string> {
    if (!cmd.handler) {
      throw new Error('no handler for cmd:' + cmd.name)
    }
    const cmdText = await (cmd.handler(cmd.args))
    const prompt = await mudParser.wrapCommand(cmdText)
    // clog.log('cmd.result:', { result: cmdText, prompt })

    const output = await gptLib.reply(prompt)
    return output.output
  }

  public async help(args: string[] | undefined): Promise<string> {
    clog.log('help.cmd')
    return `help ${args}`
  }

  public async go(args: string[] | undefined): Promise<string> {
    clog.log('go.cmd')
    return `go ${args}`
  }

  public async look(args: string[] | undefined): Promise<string> {
    if (args) {
      return `examine ${args.join(' ')}`
    } else {
      return `look`
    }
  }

  async wrapCommand(text: string) {
    const output = mudWrapper.replace('[USER_COMMAND]', text)
    return output
  }

}


const mudParser = new MudParser()

export { mudParser }
