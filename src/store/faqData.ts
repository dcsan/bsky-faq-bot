// there can be a few ways to ask the question, hence the array
// keywords are used first to quick match then the question for more fuzzy matches

import { Faq } from './FaqManager'

const faqData: Faq[] = [
  {
    questions: [
      'What is AT Proto',
    ],
    topic: 'AT Proto',
    keywords: ['at proto', 'atproto', 'at-proto'],
    answer: "AT Proto is a protocol to support decentralized social networking",
    link: 'https://atproto.com/docs'
  },

  {
    questions: [
      'What is a PDS',
    ],
    topic: 'PDS',
    keywords: ['pds'],
    answer: "Personal Data Server (PDS): A server hosting user data. Acts as the user's personal agent on the network.",
    link: 'https://atproto.com/docs'
  },

  {
    questions: [
      'What is a DID',
    ],
    topic: 'DID',
    keywords: ['did'],
    answer: "DIDs are unique global identifiers which strongly identify repositories.",
    link: 'https://atproto.com/docs'
  },

  {
    questions: [
      'What is a repository',
    ],
    topic: 'repository',
    keywords: ['repo', 'repository', 'data repository'],
    answer: "A Data Repository is a collection of data published by a single user.Repositories are self- authenticating data structures, meaning each update is signed and can be verified by anyone",
    link: 'https://atproto.com/guides/data-repos#data-repositories'
  },

]

export { faqData }
