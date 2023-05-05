import { faqManager } from './models/FaqManager'
const clog = console

async function main() {
  const cmd = process.argv[2]
  clog.log('cmd:', cmd)

  switch (cmd) {
    case 'faqs-fetch':
      await faqManager.fetchFaqs()
      break;

    case 'faqs-show':
      await faqManager.showFaqs()
      break;

    default:
      clog.warn('unknown cmd:', cmd)

  }

}


main().then(() => {
  clog.log('done')
}).catch((err) => {
  clog.error('err:', err)
})
