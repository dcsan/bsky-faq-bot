import * as fs from 'fs'
import * as path from 'path'
import { AppConfig } from "../utils/AppConfig";
import { readValues } from "../utils/sheets";
import { genImage } from '../services/StabAi';
import { ensureDir } from '../utils/localFiles';

const clog = console

type repItem = {
  key: string
  val: string
}

// line on the scene sheet
type Scene = {
  name: string
  drawing: string
  location: string
  expanded: string
  dialog: string
  description: string
  caption: string
  actor: string
  lyrics: string
}


const localConfig = {
  // style: 'retroFuture'
  style: 'futureNoir'

}

const styleTags =
  `
<style type="text/css" rel="stylesheet">
  .dialog {
    font-style: italic;
    color: #CCCCFF;
  }
  .caption {
    font-style: italic;
  }
</style>
`


class StoryManager {

  replacers: repItem[] = []
  scenes: Scene[]
  storyFile: string // path to story
  basePath = `../data/story`
  renderPath: string
  dataPath: string

  constructor() {
    this.dataPath = path.join(__dirname, this.basePath, 'data')
    this.renderPath = path.join(__dirname, this.basePath, 'renders', `${Date.now()}`)
    ensureDir(this.renderPath)
    ensureDir(this.dataPath)
    this.storyFile = path.join(this.renderPath, `story.md`)
    clog.log('storyPath', this.renderPath)
  }

  async loadAll() {
    this.replacers = this.readFile('replacers', 'blob')
    this.scenes = this.readFile('scenes', 'blob')
  }

  async buildReplacers() {
    const layers = [
      'actors', 'locations', 'styles'
    ]
    for (let layer of layers) {
      const data = await fs.readFileSync(this.storyDataPath(layer, 'blob'), 'utf8')
      const blob = JSON.parse(data)
      clog.log('blob', layer, blob)
      for (let line of blob) {
        const item = {
          key: line.key, val: line.val
        }
        this.replacers.push(item)
      }
    }
    // clog.log('instItems', this.instItems)
    await this.writeFile('replacers', 'blob', this.replacers)
    clog.log('wrote replacers')
  }

  async fetchAll() {
    const tabs = [
      'actors',
      'locations',
      'styles',
      'scenes',
    ]
    for (let tabName of tabs) {
      clog.log('story.fetchAll', tabName)
      const raw = await readValues(tabName, AppConfig.STORY_SHEET_ID) as any[]
      this.writeFile(tabName, 'raw', raw)
      const headers = raw.shift()
      const blob = await this.formatRawData(headers, raw)
      this.writeFile(tabName, 'blob', blob)
      clog.log('wrote:', tabName)
    }
    await this.buildReplacers()
  }

  /**
   * format multi array into key:
   * @param headers
   * @param data
   * @returns
   */
  async formatRawData(headers: string[], data: any[]) {
    const lines = []
    for (let row of data) {
      const line: any = {}
      for (let i = 0; i < headers.length; i++) {
        const header = headers[i]
        const value = row[i]
        line[header] = value
      }
      lines.push(line)
    }
    return lines
  }

  writeFile(ftype: string, ext: string, blob: any) {
    const fpath = this.storyDataPath(ftype, ext)
    fs.writeFileSync(fpath, JSON.stringify(blob, null, 2))
  }

  readFile(ftype: string, ext: string) {
    const fpath = this.storyDataPath(ftype, ext)
    const raw = fs.readFileSync(fpath, 'utf8')
    const blob = JSON.parse(raw)
    return blob
  }

  storyDataPath(tabName: string, partial: string) {
    const ext = partial === 'md' ? 'md' : 'json'
    return `${this.dataPath}/${tabName}.${partial}.${ext}`
  }

  doReplace(text: string): string {
    if (!text) return ''
    let out = text
    for (let rep of this.replacers) {
      const key = `[${rep.key}]`
      const val = rep.val
      out = out.replaceAll(key, val)
    }
    return out
  }

  async parseScenes() {
    await this.loadAll()
    // clog.log('loaded scenes', this.scenes)
    // clog.log('loaded replacers', this.replacers)
    const scenes = this.scenes
    let sceneName = ''
    for (let line of scenes) {

      if (!line.drawing) continue
      if (line.name) {
        sceneName = line.name
      }
      line.name = line.name || sceneName
      const expanded = this.doReplace(line.drawing)
      clog.log('\n\n--- scene.name:', sceneName)
      clog.log('before:', line.drawing)
      clog.log('after:', expanded)
      line.expanded = expanded
      clog.log(line)
    }

    clog.log('this.scenes', scenes)
    this.scenes = this.scenes.filter(line => {
      if (line.name || line.location || line.description || line.drawing || line.dialog || line.lyrics) return true
    })
  }

  newStory() {
    this.addLine('# Story\n')
    this.addLine(styleTags)
    return this.storyFile
  }

  async renderImage(prompt: string, scene: string) {
    const style = this.replacers.find(x => x.key === localConfig.style)
    prompt = `${prompt} ${style?.val}`
    const outDir = path.join(this.renderPath, scene)
    ensureDir(outDir)
    const images = await genImage(prompt, outDir)
    const fullPath = images[0]
    const localPath = this.convertPath(fullPath)
    clog.log('render:', prompt, localPath)
    return localPath
  }

  convertPath(fullPath: string) {
    // ConvertPath ../data/story/16841162670091684116267020/img-0.png
    const parts = fullPath.split('/')
    let localPath = parts.slice(-2).join('/')
    localPath = `./${localPath}`
    clog.log('convertPath', { fullPath, localPath, storyPath: this.renderPath })
    return localPath
    // const file = parts.
    // clog.log('convertPath', fullPath, localPath)
    // return localPath
  }

  addLine(line: string, type: string = '') {
    if (!line) return
    fs.appendFileSync(this.storyFile, `${line}\n\n`)
  }

  /**
   * collapsible github block
   * @param details
   * @param summary
   */
  addDetails(summary: string, details: string,) {
    const text = `
<details details >
  <summary>${summary || ''}</summary>
  ${details}
</details>
`
    this.addLine(text)
  }

  addBlock(text: string, style: string) {
    const block = `<div class='${style}'>${text}</div>`
    this.addLine(block)
  }

  async renderScenes() {
    const storyFile = this.newStory()
    this.storyFile = storyFile
    let currentScene = ''
    let sceneCount = 0

    for (let line of this.scenes) {

      if (line.name) {
        currentScene = line.name
        this.addLine(`\n\n# ${line.name} \n`)
      }

      const prompt = line.expanded
      if (line.drawing) {
        const imgPath = await this.renderImage(prompt, currentScene)
        this.addLine(`<img src='${imgPath}' alt='${prompt}' />`)
        const caption = line.caption || line.drawing || prompt.slice(0, 20)
        this.addDetails(caption, prompt)
        this.addLine(line.description)
        if (sceneCount++ > 2) break // testing
      } else {
        this.addLine(line.caption, '> ')
        this.addLine(line.description)
      }

      line.dialog && this.addBlock(`${line.actor || 'actor'}: _${line.dialog}_`, 'dialog')
      this.addLine(line.lyrics, '> ')
    }

    clog.log('wrote', storyFile)
  }

}

const storyManager = new StoryManager();

export { storyManager }

