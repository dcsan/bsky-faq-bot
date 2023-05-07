import { MudCommand } from "../types";
import { AppConfig } from "../utils/AppConfig";


const clog = console

const cmdList = [
  {
    keys: ['/help'],
    name: 'help',
    func: 'help',
  },
  {
    keys: ['/go'],
    name: 'go',
    func: 'help',
  }
]

class MudParser {


  constructor() {
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
    const cmd = cmdList.find((cmd) => {
      return cmd.keys.includes(key)
    })
    if (!cmd) {
      clog.warn('no cmd found for:', key)
      return undefined
    }

    let after = content.split(key)[1];  // everything after the key
    after = after.trim()
    const args = after.split(' ');
    clog.log({ after, args })

    // @ts-ignore
    const handler: any = this[cmd.func]

    clog.log(`cmd key: ${key}, arg: ${after} `)
    if (!key) {
      return undefined;
    }
    return {
      ...cmd,
      args,
      handler
    }
  }

  public async go(args: string[]): Promise<void> {
    clog.log('go command')
  }

  public runCommand(key: string, args: string[]): void {

  }

  public async help(args: string[]): Promise<void> {
    clog.log('help command goes here')
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
