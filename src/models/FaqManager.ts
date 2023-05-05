import fs from 'fs'
import path from 'path'
import { Faq } from '../types'
import { readValues } from '../utils/sheets'

// flat array of faqs from sheets
import faqsRaw from "../data/faqs.json"

const clog = console

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

  async findFaq(query: string): Promise<Faq | undefined> {
    for (let faq of this.faqData) {
      for (let keyword of faq.keywords!) {
        if (!keyword) continue // empty ones
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

  /**
   * @description pull faqs from google sheets
   */
  async fetchFaqs() {
    const data = await readValues('faqData') as any[]
    fs.writeFileSync(this.faqPath, JSON.stringify(data, null, 2))
    const faqs = this.formatFaqs(data)
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
  formatFaqs(rows: string[][]): Faq[] {
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
    clog.info('formatted faqs', faqRows)
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
    this.faqData = this.formatFaqs(data)
    clog.log('formatted faqData', this.faqData)
    return data
  }

  showFaqs() {
    clog.log('faqData', this.faqData)
  }

}

// singleton
const faqManager = new FaqManager()

export { faqManager }
