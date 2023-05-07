import { MudCommand } from "../types";
import { AppConfig } from "../utils/AppConfig";


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

  public async runCommand(cmd: MudCommand): Promise<void> {
    if (!cmd.handler) {
      clog.error('no handler for cmd:', cmd)
      return
    }
    const result = await (cmd.handler(cmd.args))
    return result
  }

  public async help(args: string[] | undefined): Promise<string> {
    clog.log('help.cmd')
    return `help ${args}`
  }

  public async go(args: string[] | undefined): Promise<string> {
    clog.log('go.cmd')
    return `go ${args}`
  }

}

const mudParser = new MudParser();


// const commandAlias = [
//   {
//     keys: ['help'],
//     name: 'help command',
//     description: 'list commands',
//     handler: mudCommands.help
//   },
// ]

export { mudParser }
