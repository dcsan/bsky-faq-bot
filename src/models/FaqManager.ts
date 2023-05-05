import fs from 'fs'
import path from 'path'
import { Faq, FaqReply } from '../types'
import { readValues } from '../utils/sheets'
import _ from 'lodash'
import { stringSimilarity } from "string-similarity-js";

// flat array of faqs from sheets
import faqsRaw from "../data/faqs.json"

const clog = console

const localConfig = {
  simThreshold: 0.6 // matching of strings
}

class FaqManager {

  faqData: Faq[] = []
  faqPath: string

  constructor() {
    // for writing
    this.faqPath = path.join(__dirname, '../data/faqs.json')
    this.loadFaqs()
  }

  async init() {
    this.loadFaqs()
  }

  async findFaqByQuestions(query: string): Promise<Faq | undefined> {
    let matches = []
    for (let faq of this.faqData) {
      if (!faq.questions) continue

      for (let exampleQuestion of faq.questions) {
        if (!exampleQuestion) continue // empty "" items
        // using a short substr length since we expect short questions
        const score = stringSimilarity(query, exampleQuestion, 5)
        if (score > localConfig.simThreshold) {
          clog.log(`score ${score} input :[${query}] => question: `, exampleQuestion)
          matches.push({ score, faq })
        }
      }
    }

    if (matches.length == 0) {
      clog.warn(`no faq by question for:[${query}]`)
      return
    }

    // sort by score and return only one item
    // TODO if scores are close, return top 3 matches and disambig in the client
    matches = matches.sort((a, b) => b.score - a.score)
    clog.log('matches', matches)
    return matches[0].faq

  }

  async findFaqByKeywords(query: string): Promise<Faq | undefined> {
    for (let faq of this.faqData) {
      if (!faq.keywords) continue // empty ones

      for (let keyword of faq.keywords) {
        if (!keyword) continue // empty "" items
        if (query.includes(keyword)) {
          clog.log(`faq found for query:[${query}] => topic: `, faq.topic)
          return faq
        }
      }
    }
    // TODO fuzzy match / levenshtein distance
    // TODO NLP search
    // TODO return top 3 matches
    clog.warn(`no faq found by keyword for:[${query}]`)
  }

  /**
   * @description pull faqs from google sheets
   */
  async fetchFaqs() {
    const data = await readValues('faqData') as any[]
    fs.writeFileSync(this.faqPath, JSON.stringify(data, null, 2))
    const faqs = this.formatRawFaqs(data)
    clog.log('wrote faqs to', this.faqPath)
  }

  /**
   * @description format from raw json rows
   * needed since some rows in the sheets data need splitting eg keywords
   * @param rows
   * assumes data rows are in this order:
   * "approved",
    "questions",
    "topic",
    "keywords",
    "answer",
    "linkUrl",
    "linkText"
    TODO - more flexible / dynamic format for data?
    or at least check the header row matches our assumption
   */
  formatRawFaqs(rows: string[][]): Faq[] {
    let faqRows: Faq[] = []
    rows.shift() // remove header row

    // some fields have multiple values. easier to handle this way
    // note separator is a "/"
    const splitItems = (line: string, separator = "/") => {
      if (!line) return
      let items = line.split(separator)
      items = items.map((item: string) => item.trim())
      return items
    }

    for (let row of rows) {
      let faq: Faq = {
        approved: parseInt(row[0]), // could be a boolean?
        questions: splitItems(row[1]),
        topic: row[2],
        keywords: splitItems(row[3]),
        answer: row[4],
        characters: parseInt(row[5]),
        linkUrl: row[6],
        linkText: row[7],
        imageUrl: row[8],
        imageAlt: row[9],
        author: row[10],
        seeAlso: splitItems(row[11]),
      }
      faq = this.fillDefaults(faq)
      faqRows.push(faq)
    }
    if (faqRows.length === 0) {
      throw new Error('no faqs found')
    }

    clog.info('formatted faqs', faqRows?.length)
    this.faqData = faqRows
    return faqRows
  }

  // add defaults or fill in missing values
  fillDefaults(faq: Faq): Faq {
    if (!faq.approved) { faq.approved = 1 }
    if (!faq.questions || faq.questions.length === 0) {
      if (faq.keywords) {
        faq.questions = faq.keywords.map((keyword: string) => `What is a ${keyword}`)
      }
    }
    return faq
  }

  /**
   * @description load faqs from local json file
   * @returns structured FAQs
   * NOT async as its called from constructor
   */
  loadFaqs() {
    clog.log('loading faqs from', this.faqPath)
    const data = faqsRaw as string[][]
    this.faqData = this.formatRawFaqs(data)
    clog.log('loaded faqs', this.faqData?.length)
    return data
  }

  showFaqs() {
    clog.log('faqData', this.faqData)
  }

  formatFaqReply(faq: Faq): string {
    const url = faq.linkUrl ? `\n🌐⇢ ${faq.linkUrl}` : ''
    const reply = `👀❓ [${faq.topic}]\n🤖💬 ${faq.answer} ${url}`
    return reply
  }

  notFoundReply(input: string): string {
    const options = [
      "Sorry IDK  🤖🤷",
      "I don't know maybe someone else can answer?",
      "no idea!",
      "I'm still a baby bot 🤖",
      "Let me know if you find out!",
      `hmmm, ${input} I'm not sure, sorry!`,
    ]
    const reply = _.sample(options) as string
    // const reply = `no faq found for [${input}]`
    return reply
  }

  /**
   * @description find a faq by keyword or the 'sorry no reply' message
   */
  async getFormattedReplyOrDefault(input: string): Promise<string | undefined> {
    const cleaned: string = input.trim().toLowerCase();
    const faq =
      await this.findFaqByQuestions(cleaned) ||
      await this.findFaqByKeywords(cleaned)

    if (faq) {
      return this.formatFaqReply(faq)
    }
    return undefined
    // if (!faq) return this.notFoundReply(input)
  }


  // async searchFaqs(input: string): Promise<Faq | undefined> {
  //   const faq = await this.findFaq(input)
  //   if (faq) return faq
  // }

  /**
   * if user says "faq <topic>" and we cannot find a faq we still reply wtih a 'not found'
   * @param text
   * @returns reply and faq if found
   */
  // async checkFaqCommand(text: string): Promise<FaqReply | undefined> {
  //   // TODO word boundary
  //   const chunks = text.match(/(faq )(.*)$/i)
  //   if (!chunks) {
  //     // TODO more cmds
  //     clog.warn('no regex match for faq')
  //     return undefined
  //   }
  //   clog.log('faq groups:', chunks)

  //   let reply: string | undefined = undefined
  //   let faq: Faq | undefined = undefined
  //   if (chunks[1] === 'faq ') {
  //     // match is 'faq<space><topic>' for the command - TODO word boundaries
  //     const topic = chunks[2]
  //     clog.log(`faq topic: [${topic}]`)
  //     faq = await faqManager.findFaq(topic)
  //     if (!faq) {
  //       reply = `sorry no faq found for [${topic}]`
  //       clog.warn(reply)
  //     } else {
  //       // format reply
  //       reply = `faq topic: [${faq.topic}]\nℹ️ ${faq.answer}`
  //       // TODO add links and find facets
  //       clog.log('faq reply:', reply)
  //     }
  //   }
  // const result = {
  //   reply,
  //   faq
  // }
  //   return result
  // }

}

// singleton
const faqManager = new FaqManager()

export { faqManager }

