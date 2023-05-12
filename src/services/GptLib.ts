import { GptReply } from "src/types";
import { AppConfig } from "../utils/AppConfig";

import {
  Configuration,
  OpenAIApi,
  CreateCompletionResponse,
  CreateCompletionRequest,
  CreateChatCompletionRequest,
  CreateChatCompletionResponse
} from "openai"
import { PostParams } from "easy-bsky-bot-sdk/lib/post";
const clog = console

const localConfig = {
  model: 'gpt-3.5-turbo',
  maxTokens: 250,
  temperature: 0.5,  // 0 - 2 1=normal
  instruction: "reply in 45 words or less. ", // default system command
}

class GptLib {
  openai: OpenAIApi;
  verbose: boolean = false

  constructor() {
    const configuration = new Configuration({
      apiKey: AppConfig.OPENAI_API_KEY,
    });
    this.openai = new OpenAIApi(configuration);
  }

  async complete(text: string, instruction?: string): Promise<CreateChatCompletionResponse> {
    text = this.expansions(text)
    instruction = instruction || localConfig.instruction
    const prompt = instruction + text
    const request: CreateChatCompletionRequest = {
      model: localConfig.model,
      messages: [
        // TODO add history in here
        {
          "role": "system",
          "content": instruction
        },
        {
          "role": "user",
          "content": text
        },
      ],
      // prompt,
      max_tokens: localConfig.maxTokens,
      temperature: localConfig.temperature, // more random
    }
    // const completion = await this.openai.createCompletion(request)
    clog.log('request', JSON.stringify(request, null, 2))
    const completion = await this.openai.createChatCompletion(request)
    clog.log('response', JSON.stringify(completion.data, null, 2))
    return completion.data
  }

  extractMessage(completion: CreateChatCompletionResponse): string | undefined {
    const choice = completion.choices.pop()
    if (!choice) {
      throw new Error('no choice')
    }
    const text = choice.message?.content
    return text
  }

  /**
   * replace some basic shortcuts like woa = wrong answers only
   * @param input
   * @returns
   */
  expansions(input: string): string {
    for (let items of AppConfig.EXPANSIONS) {
      const [search, replace] = items
      // const rex = `/${search}/g`
      const rex = new RegExp(`${search}`, "i")
      input = input.replace(rex, replace) // reuse input
      // console.log('\nrex=>', rex)
      // console.log('before=>', input)
      // console.log('replace=>', search, replace)
      // console.log('after=>', after)
    }
    return input
  }

  async reply(input: string, instruction?: string): Promise<GptReply> {
    const response = await this.complete(input, instruction)
    const msg = this.extractMessage(response)
    if (!msg) {
      throw new Error('no message')
    }

    // const data: CreateCompletionResponse = completion.data
    // this.verbose && clog.log('completion.data', JSON.stringify(data, null, 2))
    // return msg

    // const first = response.choices[0]
    // let output = first.text || ""
    // output = output.replace(/\n/g, '')
    let output = msg.trim()
    const length = output.length
    if (length > 200) {
      clog.warn('too long', { length, text: output })
      output = output.slice(0, 200) + '...'
    }
    const result: GptReply = { input, output, length }
    return result
    // return text?.trim()
  }

  async getReplyPost(input: string): Promise<PostParams | undefined> {
    const response = await this.reply(input)
    return {
      text: response.output
    }
  }

}

const gptLib = new GptLib()

export { gptLib }

