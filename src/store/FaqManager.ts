import { faqData } from './faqData'

export type Faq = {
  questions: string[]; // alt phrasings
  keywords: string[];  // search terms
  topic: string;  // main topic
  answer: string; // answer text can contain /n newlines
  link?: string  // web link to more info
}

const clog = console

const FaqManager = {

  async findFaq(query: string): Promise<Faq | undefined> {
    for (let faq of faqData) {
      for (let keyword of faq.keywords) {
        if (query.includes(keyword)) {
          clog.log(`faq found for kw:[${keyword}] =>`, faq)
          return faq
        }
      }
    }

    // TODO fuzzy match / levenshtein distance
    // TODO NLP search
    // TODO return top 3 matches

    clog.warn(`no faq found for query:[${query}]`)
  }
}

export { FaqManager }