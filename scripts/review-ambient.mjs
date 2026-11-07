import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'

const stage = process.argv[2] ?? 'enhance-after'
if (!/^[a-z-]+$/.test(stage)) throw new Error('Invalid stage')
const baseURL = process.env.PREVIEW_URL ?? 'http://127.0.0.1:5173/'
const output = 'output/playwright'
await mkdir(output, { recursive: true })
const reports = []
for (const [name, executablePath] of [
  ['chrome', 'C:/Program Files/Google/Chrome/Application/chrome.exe'],
  ...(stage === 'enhance-after' ? [['edge', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe']] : []),
]) {
  const browser = await chromium.launch({ executablePath, headless: true })
  try {
    for (const [width, height] of [[1920, 1080], [1366, 768]]) {
      const page = await browser.newPage({ viewport: { width, height } })
      const errors = []
      page.on('pageerror', error => errors.push(error.message))
      page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
      await page.goto(baseURL)
      await page.evaluate(() => document.fonts.ready)
      await page.waitForFunction(() => document.querySelector('#home')?.dataset.ambientState === 'running')
      const start = Date.now()
      const frames = []
      for (const [label, targetMs] of [['start', 1500], ['bright', 3800], ['dark', 7600]]) {
        const remaining = targetMs - (Date.now() - start)
        if (remaining > 0) await page.waitForTimeout(remaining)
        await page.screenshot({ path: `${output}/${stage}-${name}-${width}-${label}.png` })
        const layers = await page.evaluate(() => Object.fromEntries(['ambient-sun', 'ambient-sun-halo', 'ambient-mist-far', 'ambient-mist-near', 'ambient-mist-local'].map(name => {
          const el = document.querySelector(`.${name}`)
          return [name, el ? { opacity: getComputedStyle(el).opacity, transform: getComputedStyle(el).transform } : null]
        })))
        frames.push({ label, elapsedMs: Date.now() - start, layers })
      }
      const cta = page.getByRole('link', { name: '开启征程', exact: true })
      await cta.screenshot({ path: `${output}/${stage}-${name}-${width}-button.png` })
      await cta.hover()
      await page.waitForTimeout(350)
      await cta.screenshot({ path: `${output}/${stage}-${name}-${width}-button-hover.png` })
      await page.mouse.move(20, 120)
      if (stage === 'enhance-after' && name === 'chrome' && width === 1920) {
        const debug = await page.addStyleTag({ content: '.ambient-sun,.ambient-sun-halo{opacity:.8!important}.ambient-mist-far,.ambient-mist-near,.ambient-mist-local{opacity:.55!important}' })
        await page.screenshot({ path: `${output}/enhance-debug-visibility.png` })
        await debug.evaluate(el => el.remove())
      }
      const performanceSample = await page.evaluate(() => new Promise(resolve => {
        const intervals = []; let previous; const start = performance.now()
        const frame = now => {
          if (previous !== undefined) intervals.push(now - previous)
          previous = now
          if (now - start < 4000) requestAnimationFrame(frame)
          else {
            intervals.sort((a, b) => a - b)
            resolve({ frames: intervals.length, meanMs: intervals.reduce((a, b) => a + b, 0) / intervals.length, p95Ms: intervals[Math.floor(intervals.length * .95)] })
          }
        }; requestAnimationFrame(frame)
      }))
      const layout = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth, state: document.querySelector('#home').dataset.ambientState, image: document.querySelector('.hero-image').naturalWidth }))
      reports.push({ stage, browser: name, version: browser.version(), width, height, frames, performanceSample, ...layout, errors })
      await writeFile(`${output}/${stage}-report.json`, JSON.stringify(reports, null, 2))
      if (errors.length || layout.overflow || layout.image !== 1672) throw new Error(JSON.stringify(reports.at(-1)))
      await page.close()
    }
  } finally { await browser.close() }
}
console.log(JSON.stringify(reports.map(({ browser, width, errors, performanceSample }) => ({ browser, width, errors, performanceSample })), null, 2))
