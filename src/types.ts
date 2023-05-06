export type Faq = {
  approved?: number; // 0 or 1
  questions?: string[]; // alt phrasings
  topic?: string;  // main topic
  keywords?: string[];  // search terms
  answer?: string; // answer text can contain /n newlines
  characters?: number; // character count
  linkUrl?: string  // web link to more info
  linkText?: string  // web link to more info
  imageUrl?: string
  imageAlt?: string
  author?: string
  seeAlso?: string[]
}

// faq with a formatted reply
export type FaqReply = {
  reply?: string
  faq?: Faq
}


export type GptReply = {
  input: string
  output: string
  length: number
}

// export type GptReplyChoice = {
//   text: string
//   "index": number,
//   "logprobs": any,
//   "finish_reason": string // "length" or "stop"
// }

// export type GptReplyData = {
//   choices: GptReplyChoice[]
//   "usage": {
//     "prompt_tokens": number,
//     "completion_tokens": number,
//     "total_tokens": number
//   }
// }


