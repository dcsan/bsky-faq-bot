import * as fs from 'fs'
import * as path from 'path'
import * as fse from 'fs-extra'

import { AppConfig } from "../utils/AppConfig";
import { readValues } from "../utils/sheets";
import { genImage } from '../services/StabAi';
import { ensureDir } from '../utils/localFiles';

const testRun = false

const localConfig = {
  // styleName: 'animenoir',
  styleName: 'retrofuture',
  // styleName: 'futurenoir',
  // styleName: 'surreal',
  // styleName: 'fullanime',
  // styleName: 'anime2',
  // styleName: 'anime3',
  // styleName: 'anime6',
  // styleName: 'animblur',
  // styleName: 'movie1',
  // maxScenes: 10  // limit for testing or 0 for no limit
  maxScenes: testRun ? 10 : 5000  // limit for testing or 0 for no limit
}

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
  song: string
  row: string
}


// const styleTags = `<style type="text/css" rel="stylesheet" href="../story.css" ></style>`

function shortSentence(line: string, wordCount = 5) {
  if (!line) return ''
  return line.split(' ').slice(0, wordCount).join(' ')
}

class StoryManager {

  replacers: repItem[] = []
  scenes: Scene[]
  storyFile: string // path to story
  relPath = `../../storybd`
  renderPath: string
  dataPath: string

  constructor() {
    this.dataPath = path.join(__dirname, this.relPath, 'data')
    this.renderPath = path.join(__dirname, this.relPath, 'renders', `${Date.now()}`)
    ensureDir(this.renderPath)
    ensureDir(this.dataPath)
    this.storyFile = path.join(this.renderPath, `story.html`)
    clog.log('storyFile', this.storyFile)

    clog.log('render story with maxScenes:', localConfig.maxScenes)

  }

  newStory() {
    this.addHtmlHeader()
    this.addHeading('Story', 'h1')
    this.addDiv(`styleName: ${localConfig.styleName}\n`)
    this.addDiv(`styleValue: ${this.getStyle()}\n`)
    // TODO add datestamp
    return this.storyFile
  }

  /**
   * after finished rendering an item
   */
  async endStory() {
    await this.addHtmlFooter()
    clog.log('finished story', this.renderPath)
    await fse.copy(this.renderPath, path.join('./storybd-pub/public/latest'))
    // fs.symlinkSync(this.renderPath, path.join('./storybd-pub/publc/latest'))
  }

  addHtmlHeader() {
    const cssFile = path.join(__dirname, '../../storybd/shared/story.css')
    const styleTags = fs.readFileSync(cssFile)
    const externalCss = `<link rel="stylesheet" href="../shared/story.css">`
    // const inlineCss = `<style>${styleTags}</style>`
    const html = `<html>
  <head>
    <title>Story</title>
    </head>
    ${externalCss}
    <body>
`
    this.addRaw(html)
  }

  addHtmlFooter() {
    const html = `</body></html>`
    this.addRaw(html)
  }

  async loadAll() {
    this.replacers = this.readFile('replacers', 'blob.json')
    this.scenes = this.readFile('scenes', 'blob.json')
    clog.log('loaded scenes:', this.scenes.length)
    clog.log('loaded replacers:', this.replacers.length)
  }

  async parseReplacers() {
    const layers = [
      'actors', 'locations', 'styles', 'items'
    ]
    for (let layer of layers) {
      const data = await fs.readFileSync(this.storyDataPath(layer, 'blob.json'), 'utf8')
      const blob = JSON.parse(data)
      clog.log('blob', layer, blob)
      for (let line of blob) {
        const key = line.key.toLowerCase()
        const item = {
          key,
          val: line.val
        }
        this.replacers.push(item)
      }
    }
    // clog.log('instItems', this.instItems)
    await this.writeFile('replacers', 'blob.json', this.replacers)
    clog.log('wrote replacers')
  }

  async fetchAll() {
    const tabs = [
      'actors',
      'locations',
      'styles',
      'items',
      'scenes',
    ]
    for (let tabName of tabs) {
      clog.log('story.fetchAll', tabName)
      const raw = await readValues(tabName, AppConfig.STORY_SHEET_ID) as any[]
      this.writeFile(tabName, 'raw.json', raw)
      const headers = raw.shift()
      const blob = await this.formatRawData(headers, raw)
      this.writeFile(tabName, 'blob.json', blob)
      clog.log('wrote:', tabName)
    }
    await this.parseReplacers()
  }

  /**
   * format multi array into key:
   * @param headers
   * @param data
   * @returns
   */
  async formatRawData(headers: string[], data: any[]) {
    const lines = []
    let count = 0
    for (let row of data) {
      const line: any = {}
      for (let i = 0; i < headers.length; i++) {
        const header = headers[i]
        const value = row[i] ? row[i].trim() : ''
        line[header] = value
      }
      line['row'] = count++
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

  storyDataPath(fileName: string, ext: string) {
    // const plainTypes = ['md', 'html']
    // these types don't have an extra ext
    // let ext = (plainTypes.includes(partial)) ? '.json' : ''
    return `${this.dataPath}/${fileName}.${ext}`
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

  findVal(key: string) {
    if (!key || !key.trim()) {
      clog.warn('findVal: no/empty key')
      return ''
    }
    key = key.toLowerCase().trim()
    const pair = this.replacers.find(x => x.key === key)
    if (pair) {
      return pair.val
    }
    return key
  }

  async parseScenes() {
    await this.loadAll()
    // clog.log('loaded scenes', this.scenes)
    // clog.log('loaded replacers', this.replacers)
    const scenes = this.scenes
    let sceneName = ''
    for (let line of scenes) {

      if (line.name) {
        sceneName = line.name
      }
      if (line.drawing) {
        line.name = line.name || sceneName
        const expanded = this.doReplace(line.drawing)
        clog.log('\n\n--- scene.name:', sceneName)
        clog.log('-- before:\n ', line.drawing)
        clog.log('-- after: \n', expanded)
        line.expanded = expanded
      }
      // clog.log(line)
    }

    this.scenes = this.scenes.filter(line => {
      if (line.name || line.location || line.description || line.drawing || line.dialog || line.lyrics) return true
    })
    clog.log('parsed scenes', scenes.length)
    await this.writeFile('scenes', 'final.json', this.scenes)
  }

  getStyle() {
    const styleItem = this.replacers.find(x => x.key == localConfig.styleName)
    if (!styleItem) {
      throw new Error(`style not found: ${localConfig.styleName}`)
    }
    const styleVal = styleItem?.val
    return styleVal
  }

  async renderImage(prompt: string, scene: string) {
    const styleVal = this.getStyle()
    prompt = `${prompt} ${styleVal}`
    const outDir = path.join(this.renderPath, scene)
    ensureDir(outDir)
    const images = await genImage(prompt, outDir)
    const fullPath = images[0]
    const localPath = this.convertPath(fullPath)
    clog.log('renderImage:', { prompt, styleVal, fullPath, localPath })
    return localPath
  }

  convertPath(fullPath: string) {
    const parts = fullPath.split('/')
    let localPath = parts.slice(-2).join('/')
    localPath = `./${localPath}`
    // clog.log('convertPath', { fullPath, localPath, storyPath: this.renderPath })
    return localPath
  }

  addSong(name: string) {
    const fpath = `../songs/${name}.mp3`
    const item = `<audio controls>
  <source src="${fpath}" type="audio/mpeg">
Your browser does not support the audio element.
</audio>`
    this.addRaw(item)
    return item
  }

  addHeading(text: string, tag = 'h2') {
    this.addRaw(`<${tag}>${text}</${tag}>\n\n`)
  }

  addDiv(line: string, className: string = '') {
    if (!line) return
    fs.appendFileSync(this.storyFile, `<div class='${className}'>${line}</div>\n\n`)
  }

  // without any tags
  addRaw(line: string, type: string = 'div') {
    if (!line) return
    fs.appendFileSync(this.storyFile, `${line}\n`)
  }

  /**
   * collapsible github block
   * @param details
   * @param summary
   */
  addDetails(summary: string, details: string,) {
    const text = `<details>
    <summary>${summary || ''}</summary>
    ${details}
</details>`
    this.addDiv(text)
  }

  // addBlock(text: string, style: string) {
  //   const block = `< div class='${style}' > ${ text } </>`
  //   this.addDiv(block)
  // }

  openRow(row: string) {
    if (!row) return
    const block =
      `<div class='row'>\n<div class='rowCounter'>${row}</div>\n`
    this.addRaw(block)
  }

  closeRow(row?: string) {
    const block = `</div>`
    this.addRaw(block)
  }

  async renderScenes() {
    await this.loadAll()
    const storyFile = this.newStory()
    this.storyFile = storyFile
    let sceneCount = 0
    const maxScenes = localConfig.maxScenes
    this.scenes = await this.readFile('scenes', 'final.json')
    let currentScene = ''

    for (let line of this.scenes) {
      this.openRow(line.row)

      if (line.name &&
        (line.name.trim() !== currentScene)) {
        // new scene
        const oldScene = currentScene
        currentScene = line.name.trim()
        clog.log('newScene:', { oldScene, currentScene, line })
        this.addHeading(currentScene, 'h2')
      }

      const location = line.location
      const locationDesc = this.findVal(location)
      const prompt = [locationDesc, ' ', line.expanded].join(' ')

      if (line.drawing) {
        this.addDiv(line.description)

        const imgPath = await this.renderImage(prompt, currentScene)
        this.addRaw(`<img src='${imgPath}' alt='${prompt}' />`)
        const caption = line.caption || line.drawing || shortSentence(line.description)
        this.addDetails(caption, prompt)
        if (sceneCount++ > maxScenes) break // testing
      } else {
        this.addDiv(line.description)
        this.addDiv(line.caption)
      }

      line.song && this.addSong(line.song)
      line.dialog && this.addDiv(`${line.actor || 'actor'}: ${line.dialog}`, 'dialog')
      this.addDiv(line.lyrics, 'lyrics')

      this.closeRow(line.row)

    }

    await this.endStory()

    clog.log('wrote', storyFile)
  }

}

const storyManager = new StoryManager();

export { storyManager }
