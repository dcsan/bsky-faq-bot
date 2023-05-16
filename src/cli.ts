import { faqManager } from './models/FaqManager'
import { storyManager } from './models/StoryManager'
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

    case 'story-fetch-parse':
      await storyManager.fetchAll()
      await storyManager.parseScenes()
      break;

    case 'story-parse-scenes':
      await storyManager.parseScenes()
      break;

    case 'story-render':
      await storyManager.renderScenes()
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
