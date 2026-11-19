import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import assert from 'node:assert/strict'

const output = 'output/playwright/route-audit-20261112'
await mkdir(output, { recursive: true })
const results = []
for (const engine of ['chrome', 'edge']) {
  const browser = await chromium.launch({ executablePath: engine === 'chrome'
    ? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
    : 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true })
  try {
    for (const [width, height] of [[1920, 1080], [1366, 768], [682, 668]]) {
      const page = await browser.newPage({ viewport: { width, height } })
      const errors = []
      page.on('pageerror', e => errors.push(e.message))
      page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
      await page.goto(process.env.MAP_REVIEW_URL ?? 'http://127.0.0.1:4183/#map')
      const map = page.locator('.history-map-canvas')
      await page.locator('.history-map-canvas[data-map-state=local]').waitFor()
      await page.evaluate(() => document.fonts.ready)
      await page.waitForTimeout(800)
      const initial = await map.evaluate(e => ({ ...e.dataset }))
      assert.equal(initial.labelLevel, 'overview')
      assert.equal(initial.visibleLabels, '0')
      await page.screenshot({ path: `${output}/${engine}-${width}-overview.png` })
      if (width < 1000) await page.getByRole('button', { name: '部队与图例', exact: true }).click()
      const reception = page.getByRole('checkbox', { name: '显示1936年红一方面军接应会师线', exact: true })
      await reception.uncheck()
      const withoutReception = await map.getAttribute('data-visible-routes')
      await reception.check()
      assert.equal(Number(await map.getAttribute('data-visible-routes')), Number(withoutReception) + 2)
      const armyViews = []
      if (width >= 1000) {
        for (const [army, label] of [['fourth', '显示红四方面军'], ['second', '显示红二、红六军团及红二方面军']]) {
          await page.getByRole('button', { name: '全部隐藏', exact: true }).click()
          await page.getByRole('checkbox', { name: label, exact: true }).check()
          await page.waitForTimeout(250)
          armyViews.push({ army, ...(await map.evaluate(e => ({ ...e.dataset }))) })
          await page.screenshot({ path: `${output}/${engine}-${width}-${army}.png` })
        }
        await page.getByRole('button', { name: '全部显示', exact: true }).click()
      }
      if (width < 1000) await page.getByRole('button', { name: '部队与图例', exact: true }).click()
      await page.getByRole('button', { name: '四渡赤水专题', exact: true }).click()
      await page.waitForTimeout(900)
      if (width < 1000) await page.getByRole('group', { name: '地图资料面板' }).getByRole('button', { name: '历史资料', exact: true }).click()
      const detail = await map.evaluate(e => ({ ...e.dataset }))
      await page.screenshot({ path: `${output}/${engine}-${width}-chishui.png` })
      results.push({ engine, version: browser.version(), width, height, initial, withoutReception, armyViews, detail, errors,
        overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth) })
      await page.close()
    }
  } finally { await browser.close() }
}
await writeFile(output + '/review.json', JSON.stringify(results, null, 2))
console.log(JSON.stringify(results.map(r => ({ browser: r.engine, width: r.width, initial: r.initial, errors: r.errors })), null, 2))
