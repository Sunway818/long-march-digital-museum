import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'

const output = 'output/playwright/china-sheet'
await mkdir(output, { recursive: true })
const results = []
for (const engine of ['chrome', 'edge']) {
  const browser = await chromium.launch({ executablePath: engine === 'chrome'
    ? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
    : 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true })
  try {
    for (const [width, height] of [[1920, 1080], [1366, 768], [682, 668]]) {
      const page = await browser.newPage({ viewport: { width, height } })
      const errors = [], externalRequests = []
      page.on('pageerror', e => errors.push(e.message))
      page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
      page.on('request', request => { if (/^https?:/.test(request.url()) && !request.url().includes('127.0.0.1')) externalRequests.push(request.url()) })
      await page.goto('http://127.0.0.1:4182/#map')
      await page.locator('.history-map-canvas[data-map-state=local]').waitFor()
      await page.evaluate(() => document.fonts.ready)
      await page.waitForTimeout(700)
      const map = page.locator('.history-map-canvas')
      const initial = await map.evaluate(e => ({ ...e.dataset }))
      const initialLabels = await page.locator('.history-marker:not([hidden]) .history-marker-label:not([hidden])').allTextContents()
      await page.screenshot({ path: `${output}/${engine}-${width}-china.png` })
      await page.getByRole('button', { name: '聚焦长征路线', exact: true }).click()
      await page.waitForTimeout(1000)
      const focused = await map.evaluate(e => ({ ...e.dataset }))
      await page.screenshot({ path: `${output}/${engine}-${width}-routes.png` })
      await page.getByRole('button', { name: '四渡赤水专题', exact: true }).click()
      await page.waitForTimeout(1000)
      if (width < 1000) await page.getByRole('group', { name: '地图资料面板' }).getByRole('button', { name: '历史资料', exact: true }).click()
      const detail = await map.evaluate(e => ({ ...e.dataset }))
      const crossingLabels = await page.locator('.history-marker:not([hidden])[data-crossings]:not([data-crossings=""]) .history-marker-label').allTextContents()
      await page.screenshot({ path: `${output}/${engine}-${width}-chishui.png` })
      results.push({ engine, width, height, initial, initialLabels, focused, detail, crossingLabels, errors, externalRequests,
        overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth) })
      await page.close()
    }
  } finally { await browser.close() }
}
await writeFile(output + '/review.json', JSON.stringify(results, null, 2))
console.log(JSON.stringify(results.map(r => ({ engine: r.engine, width: r.width, initial: r.initialLabels, detail: r.crossingLabels.length, errors: r.errors, external: r.externalRequests.length })), null, 2))
