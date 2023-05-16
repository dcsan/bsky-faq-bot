import fs from 'node:fs'
import { AppConfig } from '../utils/AppConfig'
import { ensureDir } from '../utils/localFiles'

const localConfig = {
  // engineId: 'stable-diffusion-v1-5',
  engineId: 'stable-diffusion-xl-beta-v2-2-2',
}

interface GenerationResponse {
  artifacts: Array<{
    base64: string
    seed: number
    finishReason: string
  }>
}

const clog = console

export async function genImage(prompt: string, outDir?: string): Promise<string[]> {

  // const engineId = 'stable-diffusion-v1-5'
  const apiHost = process.env.API_HOST ?? 'https://api.stability.ai'
  const apiKey = AppConfig.STABILITY_API_KEY

  if (!apiKey) throw new Error('Missing Stability API key.')
  let response: any

  try {
    // @ts-ignore
    response = await fetch(
      `${apiHost}/v1/generation/${localConfig.engineId}/text-to-image`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          text_prompts: [
            {
              text: prompt,
            },
          ],
          cfg_scale: 7,
          clip_guidance_preset: 'FAST_BLUE',
          height: 512,
          width: 512,
          samples: 1,
          steps: 30,
        }),
      }
    )


  } catch (err) {
    // timeout?
    console.error('genImage fetch error', err)
    return ['']
  }

  if (!response.ok) {
    // TODO retry
    clog.error(`Non-200 response: ${await response.text()}`)
    clog.log('input', { prompt })
    return [""]
  }

  const responseJSON = (await response.json()) as GenerationResponse

  outDir = outDir || `./temp/gen/${Date.now()}`
  await ensureDir(outDir)

  const results: string[] = []

  responseJSON.artifacts.forEach((image, index) => {
    const randomName = `${Date.now()}-${index}`
    const imagePath = `${outDir}/${randomName}.png`
    fs.writeFileSync(
      imagePath,
      Buffer.from(image.base64, 'base64')
    )
    results.push(imagePath)
  })
  return results
}


function testGenerate() {
  const results = genImage('A duck walks into a bar.').then((res) => {
    console.log(res)
  }).catch((err) => {
    console.error(err)
  })
  console.log('results', results)
}


// testGen()
