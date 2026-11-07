import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'

const stage = process.argv[2] ?? 'final'
if (!/^[a-z0-9-]+$/.test(stage)) throw new Error('Invalid stage name')
const baseURL = process.env.PREVIEW_URL ?? 'http://127.0.0.1:5173/'
const results = []
await mkdir('output/playwright', { recursive: true })
for (const [name, executablePath] of [
  ['chrome', 'C:/Program Files/Google/Chrome/Application/chrome.exe'],
  ...(stage === 'final' ? [['edge', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe']] : []),
]) {
  const browser = await chromium.launch({ executablePath, headless: true })
  try {
    for (const [width, height] of [[1920, 1080], [1366, 768]]) {
      const page = await browser.newPage({ viewport: { width, height } })
      const errors = []
      page.on('pageerror', error => errors.push(error.message))
      page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
      await page.goto(baseURL, { waitUntil: 'networkidle' })
      await page.evaluate(() => document.fonts.ready)
      await page.waitForTimeout(stage === 'final' || stage.startsWith('refine-') ? 4000 : 250)
      await page.screenshot({ path: `output/playwright/${stage}-${name}-${width}.png` })
      const metrics = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        font: getComputedStyle(document.querySelector('h1')).fontFamily,
        title: document.querySelector('h1').getBoundingClientRect().toJSON(),
        imageLoaded: document.querySelector('.hero-image')?.naturalWidth ?? 0,
      }))
      results.push({ stage, browser: name, version: browser.version(), width, height, errors, ...metrics })
      if (errors.length || metrics.overflow || !metrics.imageLoaded) throw new Error(JSON.stringify(results.at(-1)))
      await page.close()
    }
  } finally { await browser.close() }
}
await writeFile(`output/playwright/${stage}-metrics.json`, JSON.stringify(results, null, 2))
console.log(JSON.stringify(results, null, 2))
