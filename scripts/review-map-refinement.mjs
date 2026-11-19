import { chromium } from '@playwright/test'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'

const phase = process.env.MAP_REVIEW_PHASE ?? 'before'
const output = `output/playwright/map-refinement-20261115/${phase}`
await mkdir(output, { recursive: true })
const original = JSON.parse(await readFile('output/playwright/route-audit-20261112/source-reread-integrity.json', 'utf8'))
const hashes = {}
for (const [name, hash] of Object.entries(original.originalSevenHashes)) {
  hashes[name] = createHash('sha256').update(await readFile(`src/data/history/map/${name}`)).digest('hex')
  assert.equal(hashes[name], hash, `Original data changed: ${name}`)
}
await writeFile(`${output}/integrity.json`, JSON.stringify({ originalSevenUnchanged: true, hashes }, null, 2))
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
const results = []
try {
  for (const [width, height] of [[1440, 900], [1920, 1080]]) {
    const page = await browser.newPage({ viewport: { width, height } })
    const errors = []
    page.on('pageerror', e => errors.push(e.message))
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
    await page.goto(process.env.MAP_REVIEW_URL ?? 'http://127.0.0.1:4173/#map')
    const map = page.locator('.history-map-canvas')
    await page.locator('.history-map-canvas[data-map-state=local]').waitFor()
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(900)
    const shots = []
    async function capture(name) {
      await page.waitForTimeout(250)
      const data = await map.evaluate(e => ({ ...e.dataset }))
      assert.equal(data.mapError, undefined, 'MapLibre rendering error')
      if (phase === 'after') assert(Number(data.renderedRouteFeatures) > 0, 'No painted route features')
      await page.screenshot({ path: `${output}/${width}-${name}.png` })
      shots.push({ name, ...data })
    }
    await capture('overview')
    if (phase === 'after') {
      await page.getByRole('button', { name: '查看1936 接应会宁路线说明', exact: true }).click()
      await capture('reception-detail')
      await page.getByRole('button', { name: '关闭路线说明', exact: true }).click()
    }
    for (const [name, armies] of [['central', ['红一方面军（中央红军）']], ['fourth', ['红四方面军']], ['central-fourth', ['红一方面军（中央红军）', '红四方面军']]]) {
      await page.getByRole('button', { name: '全部隐藏', exact: true }).click()
      for (const army of armies) await page.getByRole('checkbox', { name: '显示' + army, exact: true }).check()
      await capture(name)
    }
    const slider = page.getByRole('slider', { name: '全局历史日期' })
    await slider.fill(String(Math.floor(Date.parse('1935-02-18T00:00:00Z') / 86400000)))
    await capture('1935-02-18-time')
    await page.locator('.map-mode-switch').getByRole('button', { name: '全程总览', exact: true }).click()
    await page.waitForTimeout(850)
    await capture('1935-02-18-overview')
    await page.getByRole('button', { name: '全部显示', exact: true }).click()
    await page.getByRole('button', { name: '四渡赤水专题', exact: true }).click()
    await page.waitForTimeout(900)
    await capture('chishui')
    await page.getByRole('button', { name: '查看二渡赤水', exact: true }).click()
    await page.waitForTimeout(900)
    await capture('second-crossing')
    results.push({ width, height, version: browser.version(), shots, errors,
      overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth) })
    await page.close()
  }
} finally { await browser.close() }
await writeFile(`${output}/review.json`, JSON.stringify(results, null, 2))
console.log(JSON.stringify(results.map(r => ({ width: r.width, errors: r.errors, overflow: r.overflow }))))
