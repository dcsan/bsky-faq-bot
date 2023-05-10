import { GptReply } from "src/types";
import { AppConfig } from "../utils/AppConfig";

import {
  Configuration,
  OpenAIApi,
  CreateCompletionResponse,
  CreateCompletionRequest
} from "openai"
import { PostParams } from "easy-bsky-bot-sdk/lib/post";
const clog = console

class GptLib {
  openai: OpenAIApi;
  verbose: boolean = false

  constructor() {
    const configuration = new Configuration({
      apiKey: AppConfig.OPENAI_API_KEY,
    });
    this.openai = new OpenAIApi(configuration);
  }

  async complete(text: string, instruction?: string): Promise<CreateCompletionResponse> {
    text = this.expansions(text)
    instruction = instruction || "reply in 45 words or less. "
    const prompt = instruction + text
    const request: CreateCompletionRequest = {
      model: "text-davinci-003",
      prompt,
      max_tokens: 250, // 250 characters?
      // temperature: 0.2,
      temperature: 1.5, // more random
    }
    const completion = await this.openai.createCompletion(request)
    const data: CreateCompletionResponse = completion.data
    this.verbose && clog.log('completion.data', JSON.stringify(data, null, 2))
    return data
  }

  /**
   * replace some basic shortcuts
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

  async reply(input: string): Promise<GptReply> {
    const response = await this.complete(input)
    const first = response.choices[0]
    let output = first.text || ""
    // output = output.replace(/\n/g, '')
    output = output.trim()
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

