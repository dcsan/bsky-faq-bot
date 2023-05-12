// import fetch from 'node-fetch'
import fs from 'node:fs'
import { AppConfig } from '../utils/AppConfig'
import { ensureDir } from '../utils/localFiles'


export async function genImage(prompt: string): Promise<string[]> {

  const engineId = 'stable-diffusion-v1-5'
  const apiHost = process.env.API_HOST ?? 'https://api.stability.ai'
  const apiKey = AppConfig.STABILITY_API_KEY

  if (!apiKey) throw new Error('Missing Stability API key.')

  const response = await fetch(
    `${apiHost}/v1/generation/${engineId}/text-to-image`,
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

  if (!response.ok) {
    throw new Error(`Non-200 response: ${await response.text()}`)
  }

  interface GenerationResponse {
    artifacts: Array<{
      base64: string
      seed: number
      finishReason: string
    }>
  }

  const responseJSON = (await response.json()) as GenerationResponse

  const outDir = `./temp/gen/${Date.now()}`
  await ensureDir(outDir)

  const results: string[] = []

  responseJSON.artifacts.forEach((image, index) => {
    const imagePath = `${outDir}/img-${index}.png`
    fs.writeFileSync(
      imagePath,
      Buffer.from(image.base64, 'base64')
    )
    results.push(imagePath)
  })
  return results
}

function testGen() {
  const results = genImage('A duck walks into a bar.').then((res) => {
    console.log(res)
  }).catch((err) => {
    console.error(err)
  })
  console.log('results', results)
}

testGen()
