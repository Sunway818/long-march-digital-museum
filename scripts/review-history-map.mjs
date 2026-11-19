import { chromium } from '@playwright/test'
import fs from 'node:fs/promises'

const output = process.env.MAP_REVIEW_DIR || 'output/playwright/map'
await fs.mkdir(output, { recursive: true })
const results = []
const baseUrl = process.env.MAP_PREVIEW_URL || 'http://127.0.0.1:4173'
for (const engine of ['chrome', 'edge']) {
  if (process.env.MAP_REVIEW_BROWSER && process.env.MAP_REVIEW_BROWSER !== engine) continue
  const browser = await chromium.launch({ executablePath: engine === 'chrome' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true })
  try {
    for (const [width, height] of [[1920, 1080], [1440, 900], [1366, 768]]) {
      if (process.env.MAP_REVIEW_WIDTH && Number(process.env.MAP_REVIEW_WIDTH) !== width) continue
      const page = await browser.newPage({ viewport: { width, height } })
      const errors = [], responses = [], failedRequests = []
      page.on('pageerror', e => errors.push(e.message))
      page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
      page.on('response', r => { if (/openfreemap|elevation-tiles/.test(r.url())) responses.push({ url: r.url(), status: r.status() }) })
      page.on('requestfailed', r => { if (/openfreemap|elevation-tiles/.test(r.url())) failedRequests.push({ url: r.url(), reason: r.failure()?.errorText }) })
      const result = { engine, version: browser.version(), width, height, baseUrl, errors, responses, failedRequests }
      try {
        await page.goto(baseUrl + '/#map')
        await page.waitForFunction(() => {
          const map = document.querySelector('.history-map-canvas')
          return ['offline', 'unavailable'].includes(map?.getAttribute('data-map-state') || '') || (map?.getAttribute('data-map-state') === 'online' && map?.getAttribute('data-terrain-state') === 'disabled')
        }, undefined, { timeout: 30_000 })
        await page.waitForTimeout(4000)
        result.map = await page.locator('.history-map-canvas').evaluate(e => ({ ...e.dataset }))
        result.overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
        result.lanes = await page.locator('.timeline-lane').count()
        result.unifiedTimelines = await page.locator('.unified-timeline').count()
        result.layout = await page.evaluate(() => Object.fromEntries(['.history-map-canvas', '.map-controls', '.history-panel', '.unified-timeline'].map(selector => {
          const box = document.querySelector(selector).getBoundingClientRect()
          return [selector, { x: box.x, y: box.y, width: box.width, height: box.height, viewportFraction: box.width * box.height / (innerWidth * innerHeight) }]
        })))
        result.featuredEvents = await page.locator('.history-event-list button').count()
        result.redundantArmyButtons = await page.getByRole('button', { name: /突出|单独查看/ }).count()
        result.eventRows = await page.locator('.timeline-event, .timeline-lane').count()
        result.visibleLabels = await page.locator('.history-marker:not([hidden]) .history-marker-label:not([hidden])').count()
        await page.screenshot({ path: `${output}/${engine}-${width}-overview.png` })
        if (process.env.MAP_REVIEW_ARMIES) {
          result.armyViews = []
          for (const [id, title] of [['fourth', '显示红四方面军'], ['second', '显示红二、红六军团及红二方面军']]) {
            await page.getByRole('button', { name: '全部隐藏', exact: true }).click()
            await page.getByRole('checkbox', { name: title, exact: true }).check()
            await page.waitForFunction(() => Number(document.querySelector('.history-map-canvas')?.getAttribute('data-visible-routes')) > 0)
            await page.waitForTimeout(450)
            result.armyViews.push({ id, routes: await page.locator('.history-map-canvas').getAttribute('data-visible-routes') })
            await page.screenshot({ path: `${output}/${engine}-${width}-${id}.png` })
          }
          await page.getByRole('button', { name: '全部显示', exact: true }).click()
        }
        if (await page.getByRole('button', { name: '四渡赤水专题', exact: true }).count()) {
          await page.getByRole('button', { name: '四渡赤水专题', exact: true }).click()
          await page.waitForFunction(() => Number(document.querySelector('.history-map-canvas')?.getAttribute('data-zoom')) > 6.5)
          await page.waitForTimeout(900)
          await page.screenshot({ path: `${output}/${engine}-${width}-chishui-overview.png` })
          result.chishui = []
          await page.getByRole('button', { name: '时间演进', exact: true }).click()
          for (const [index, name] of ['查看一渡赤水', '查看二渡赤水', '查看三渡赤水', '查看四渡赤水'].entries()) {
            await page.getByRole('button', { name, exact: true }).click()
            await page.waitForTimeout(150)
            result.chishui.push({ name, date: await page.locator('.timeline-date time').textContent(), map: await page.locator('.history-map-canvas').evaluate(e => ({ ...e.dataset })) })
            if (width === 1920 || width === 1366) await page.screenshot({ path: `${output}/${engine}-${width}-crossing-${index + 1}.png` })
          }
          await page.getByRole('button', { name: '返回起点', exact: true }).click()
          await page.locator('.map-mode-switch').getByRole('button', { name: '全程总览', exact: true }).click()
          const close = page.getByRole('button', { name: '关闭事件详情' })
          if (await close.isVisible()) await close.click()
        }
        await page.getByRole('button', { name: '开始历史播放' }).click()
        result.frameSample = await page.evaluate(() => new Promise(resolve => {
          const start = performance.now(), intervals = []; let previous = start
          const sample = now => {
            intervals.push(now - previous); previous = now
            if (now - start < 2000) requestAnimationFrame(sample)
            else { const sorted = intervals.slice(1).sort((a, b) => a - b); resolve({ frames: intervals.length, milliseconds: now - start, medianIntervalMs: sorted[Math.floor(sorted.length / 2)], p95IntervalMs: sorted[Math.floor(sorted.length * .95)] }) }
          }
          requestAnimationFrame(sample)
        }))
        await page.getByRole('button', { name: '暂停历史播放' }).click()
        if (width === 1440) {
          await page.getByRole('searchbox').fill('EVT-125')
          await page.locator('.history-event-list button').click()
          const image = page.locator('.image-enlarge').first()
          await image.scrollIntoViewIfNeeded()
          await page.waitForFunction(() => (document.querySelector('.image-enlarge img')?.naturalWidth || 0) > 0)
          result.imageDecoded = await image.locator('img').evaluate(el => ({ width: el.naturalWidth, height: el.naturalHeight }))
          await page.screenshot({ path: `${output}/${engine}-${width}-evidence.png` })
          await image.click()
          await page.screenshot({ path: `${output}/${engine}-${width}-image-dialog.png` })
          await page.keyboard.press('Escape')
          result.imageFocusRestored = await image.evaluate(el => el === document.activeElement)
        }
        result.terrainResponses = responses.filter(r => r.url.includes('elevation-tiles') && r.status === 200).length
        result.vectorResponses = responses.filter(r => /\.(pbf|mvt)(\?|$)/.test(r.url) && r.status === 200).length
      } catch (error) { result.failure = String(error) }
      results.push(result)
      await fs.writeFile(`${output}/${process.env.MAP_REVIEW_OUTPUT || 'online-review.json'}`, JSON.stringify({ date: new Date().toISOString(), cases: results }, null, 2))
      console.log(JSON.stringify({ engine, width, map: result.map, failure: result.failure, errors: errors.length, terrain: result.terrainResponses, vectors: result.vectorResponses, frameSample: result.frameSample }))
      await page.close()
    }
  } finally { await browser.close() }
}
if (results.some(r => r.failure || r.errors.length || r.map?.mapState !== 'online' || r.map?.terrainState !== 'disabled' || r.terrainResponses || !r.vectorResponses || r.redundantArmyButtons || r.eventRows)) process.exitCode = 1
