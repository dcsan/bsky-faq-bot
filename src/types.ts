export type Faq = {
  approved: number; // 0 or 1
  questions: string[]; // alt phrasings
  topic: string;  // main topic
  keywords: string[];  // search terms
  answer: string; // answer text can contain /n newlines
  linkUrl?: string  // web link to more info
  linkText?: string  // web link to more info
}
