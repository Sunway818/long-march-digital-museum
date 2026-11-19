import { test, expect, type Page } from '@playwright/test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { readdirSync } from 'node:fs'
import { AdaptiveExhibition } from '../src/features/history-map/AdaptiveExhibition'
import { adaptiveExhibitions } from '../src/features/history-map/adaptiveExhibitions'
import { exhibitionTypes, visibleModules, type AdaptiveExhibition as Definition, type NarrativeModule } from '../src/features/history-map/adaptiveExhibitionModel'
import { eventById, documents, sourceById } from '../src/features/history-map/data'
import { exhibitionImages } from '../src/features/history-map/archiveContent'
import { displayDirections } from '../src/features/history-map/routeDisplay'

const definition = adaptiveExhibitions['EVT-058']!, event = eventById.get('EVT-058')!
const media = exhibitionImages(event, true)
const render = (d: Definition, images = media, previewMode = true) => renderToStaticMarkup(createElement(AdaptiveExhibition, { definition: d, event, media: images, previewMode, reviewMode: false, onOpen: () => {} }))
async function open(page: Page, query = '') {
  await page.goto(`/${query}#map`)
  await expect(page.locator('.history-map-canvas')).toHaveAttribute('data-map-state', 'local')
  await page.getByRole('searchbox').fill('EVT-058')
  await page.locator('.history-event-list button').click()
  await page.waitForTimeout(900)
  await page.getByRole('button', { name: '深入了解' }).click()
  await expect(page.locator('.adaptive-exhibition')).toBeVisible()
}

test('仅授权的三个节点接入，六类可人工配置，来源和几何可追溯', () => {
  expect(Object.keys(adaptiveExhibitions)).toEqual(['EVT-056', 'EVT-057', 'EVT-058'])
  expect(exhibitionTypes).toEqual(['archival','battle','route','immersive','portrait','composite'])
  expect(definition.combines).toEqual(['archival','route'])
  expect(event.verification_status).toBe('pending')
  expect(event.publication_status).toBe('draft')
  expect(definition.modules.every(m => m.evidence.verification === 'pending' && m.evidence.publication === 'draft')).toBe(true)
  for (const m of definition.modules) {
    expect(m.evidence.locator).toBeTruthy()
    expect(m.evidence.sourceIds.every(id => sourceById.has(id))).toBe(true)
    if (m.type === 'route') expect(m.routeIds.every(id => displayDirections.some(r => r.id === id))).toBe(true)
    if (m.type === 'archive') expect(documents.some(d => d.id === m.documentId)).toBe(true)
  }
  expect(media.map(i => i.id)).toEqual(['AST-0047'])
  expect(exhibitionImages(event, false)).toHaveLength(0)
})

test('真实渲染零图、单图、短文、长文及六类配置，缺资源不留空框', () => {
  const evidence = definition.opening.evidence
  // 合成文字只用于此测试，禁止进入正式历史数据。
  const short: NarrativeModule = { id: 'fixture-short', type: 'narrative', title: '测试短文', paragraphs: ['测试用简短文字。'], evidence }
  const empty: NarrativeModule[] = [
    { id: 'empty-image', type: 'image', title: '空图测试', imageIds: ['MISSING'], evidence },
    { id: 'empty-route', type: 'route', title: '空路线测试', routeIds: ['MISSING'], description: '', evidence },
    { id: 'empty-text', type: 'narrative', title: '空正文测试', paragraphs: [' '], evidence },
    { id: 'empty-document', type: 'archive', title: '空文献测试', documentId: 'MISSING', description: '测试', evidence },
    { id: 'empty-timeline', type: 'timeline', title: '空时间线测试', entries: [], evidence },
  ]
  expect(visibleModules({ ...definition, modules: empty }, true, [], new Set(), new Set())).toEqual([])
  for (const type of exhibitionTypes) {
    const markup = render({ ...definition, type, modules: [short, ...empty] }, [])
    expect(markup).toContain(`data-exhibition-type="${type}"`)
    expect(markup).toContain('测试用简短文字。')
    expect(markup).not.toContain('adaptive-images')
    expect(markup).not.toContain('empty-image')
    expect(markup).not.toContain('archive-reading-grid')
  }
  const single = render(definition)
  expect(single.match(/class="exhibit-image"/g)).toHaveLength(1)
  const paragraphs = Array.from({ length: 20 }, (_, i) => `仅测试排版长文第${i + 1}段。`.repeat(12))
  const long = render({ ...definition, modules: [{ ...short, paragraphs }] }, [])
  for (const p of paragraphs) expect(long).toContain(p)
  expect(render(definition, [], false)).not.toContain('data-module=')
  const mixed: Definition = { ...definition, modules: [short, { ...short, id: 'ready', title: '已审核测试段', evidence: { ...evidence, verification: 'verified', publication: 'ready' } }] }
  expect(render(mixed, [], false)).toContain('已审核测试段')
  expect(render(mixed, [], false)).not.toContain('fixture-short')
})

test('浏览器零图短文和长文夹具使用实际CSS，无固定图片栏与横向溢出', async ({ page }, info) => {
  const styles = readdirSync('dist/assets').filter(name => /^(index|HistoryMapPage)-.*\.css$/.test(name)).map(name => `<link rel="stylesheet" href="http://127.0.0.1:4173/assets/${name}">`).join('')
  const heights: number[] = []
  for (const count of [1, 20]) {
    // 测试夹具单独渲染，不写入任何正式策展记录。
    const fixture: Definition = { ...definition, modules: [{ id: 'fixture-reading', type: 'narrative', title: '测试夹具 · 阅读排版', paragraphs: Array.from({ length: count }, (_, i) => `测试用第${i + 1}段。文字长度变化应自然排版，不需要补图片或留空栏目。`.repeat(count === 1 ? 1 : 8)), evidence: definition.opening.evidence }] }
    await page.setContent(`<html lang="zh-CN"><head>${styles}</head><body><dialog open class="history-archive-dialog history-exhibition-dialog"><div class="archive-scroll">${render(fixture, [])}</div></dialog></body></html>`)
    await page.evaluate(() => document.fonts.ready)
    await expect(page.locator('.adaptive-narrative p').first()).toBeAttached()
    await expect(page.locator('.exhibit-image, .archive-reading-grid')).toHaveCount(0)
    heights.push((await page.locator('.adaptive-narrative').boundingBox())!.height)
    expect(await page.locator('.archive-scroll').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true)
    await page.locator('.adaptive-narrative').evaluate(el => el.scrollIntoView({ block: 'start' }))
    await page.screenshot({ path: `output/playwright/adaptive/${info.project.name}-fixture-${count === 1 ? 'short' : 'long'}.png` })
  }
  expect(heights[0]).toBeLessThan(500)
  expect(heights[1]).toBeGreaterThan(heights[0]! * 4)
})

test('组合展陈、图像与地域图操作，关闭保持原地图实例和全部状态', async ({ page }, info) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message))
  await open(page)
  const archive = page.locator('.history-archive-dialog'), article = page.locator('.adaptive-exhibition'), map = page.locator('.history-map-canvas'), timeline = page.locator('.unified-timeline')
  const canvas = await page.locator('.maplibregl-canvas').elementHandle()
  const before = { center: await map.getAttribute('data-center'), zoom: await map.getAttribute('data-zoom'), day: await timeline.getAttribute('data-current-day'), armies: await page.locator('.army-control input').evaluateAll(els => els.map(el => (el as HTMLInputElement).checked)) }
  await expect(article).toHaveAttribute('data-exhibition-type', 'composite')
  await expect(article.getByRole('heading', { name: definition.opening.title, exact: true })).toBeVisible()
  expect(await article.locator('h2').evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThan(45)
  await expect(article.locator('h2')).toHaveCSS('color', 'rgb(238, 233, 223)')
  await expect(article.locator('.adaptive-opening')).toContainText('1935年8月20日')
  await expect(article.locator('.adaptive-opening .exhibit-image')).toHaveCount(0)
  await expect(article.locator('.exhibit-review,.exhibit-review-label')).toHaveCount(0)
  expect(await article.innerText()).not.toMatch(/资料选读|具体决策与战斗需|草稿待审核/)
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: `output/playwright/adaptive/${info.project.name}-opening.png` })
  await article.getByRole('link', { name: '看方向' }).click()
  await expect(article.locator('.adaptive-route')).toBeFocused()
  await expect(article.locator('.adaptive-route-figure path[data-route-id]')).toHaveCount(2)
  const red = article.locator('path[data-route-id="VIEW-central-58-62"]')
  const geometry = await red.getAttribute('d')
  await article.getByRole('button', { name: '红一方面军（中央红军）', exact: true }).click()
  await expect(red).toHaveAttribute('stroke-width', '5')
  expect(await red.getAttribute('d')).toBe(geometry)
  await page.screenshot({ path: `output/playwright/adaptive/${info.project.name}-route.png` })
  await article.locator('.adaptive-timeline').evaluate(el => el.scrollIntoView({ block: 'start' }))
  await expect(article.locator('.adaptive-chronology li')).toHaveCount(5)
  await expect(article.locator('.adaptive-chronology li').nth(1)).toContainText('早于8月20日会议')
  await page.screenshot({ path: `output/playwright/adaptive/${info.project.name}-chronology.png` })
  const image = article.getByRole('button', { name: '放大查看：毛儿盖地域' })
  await image.scrollIntoViewIfNeeded()
  await expect.poll(() => image.locator('img').evaluate(el => (el as HTMLImageElement).naturalWidth)).toBe(529)
  await page.screenshot({ path: `output/playwright/adaptive/${info.project.name}-image.png` })
  await image.click()
  await expect(page.locator('.history-image-dialog')).toBeVisible()
  await expect(page.locator('.exhibit-viewer-caption')).toContainText('拍摄年代未注明')
  await page.keyboard.press('Escape'); await expect(image).toBeFocused()
  expect(await archive.locator('.archive-scroll').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true)
  await page.getByRole('button', { name: '关闭历史档案' }).click()
  await expect(page.getByRole('button', { name: '深入了解' })).toBeFocused()
  expect(await map.getAttribute('data-center')).toBe(before.center)
  expect(await map.getAttribute('data-zoom')).toBe(before.zoom)
  expect(await timeline.getAttribute('data-current-day')).toBe(before.day)
  expect(await page.locator('.army-control input').evaluateAll(els => els.map(el => (el as HTMLInputElement).checked))).toEqual(before.armies)
  expect(await page.locator('.maplibregl-canvas').evaluate((el, previous) => el === previous, canvas)).toBe(true)
  expect(errors).toEqual([])
})

test('统一展示正文与照片，来源保留；审核模式仅增加记录', async ({ page }, info) => {
  const requests: string[] = []; page.on('request', req => { if (req.url().includes('AST-0047')) requests.push(req.url()) })
  await open(page, '?review=0')
  const article = page.locator('.adaptive-exhibition')
  await expect(article.locator('[data-module]')).toHaveCount(definition.modules.length)
  await expect(article.locator('img')).toHaveCount(1)
  await expect(article.locator('.exhibit-review')).toHaveCount(0)
  await expect(article).not.toContainText('待审核')
  await expect(article).toContainText('1935年8月20日')
  await article.locator('.archive-sources summary').first().click()
  for (const id of [...event.source_ids, 'SRC-0107', 'SRC-0108', 'SRC-0109']) await expect(article.locator(`[data-source="${id}"] a`)).toBeVisible()
  expect(requests.length).toBeGreaterThan(0)
  await page.screenshot({ path: `output/playwright/adaptive/${info.project.name}-public.png` })
  await open(page, '?review=1')
  await expect(page.locator('.exhibit-review-label')).toBeVisible()
  await expect(page.locator('.adaptive-evidence').first()).toContainText('pending / draft')
  await page.locator('.exhibit-review summary').click()
  await expect(page.locator('.exhibit-review')).toContainText('公开许可')
})

test('前后事件阅读与返回地图对照保留全局日期，1440桌面可阅读', async ({ page }, info) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await open(page)
  const timeline = page.locator('.unified-timeline'), day = await timeline.getAttribute('data-current-day')
  await page.screenshot({ path: `output/playwright/adaptive/${info.project.name}-1440-opening.png` })
  await page.getByRole('button', { name: '下一个事件', exact: true }).click()
  await expect(page.locator('.adaptive-exhibition')).toHaveCount(0)
  await expect(page.locator('.history-archive-dialog')).toBeVisible()
  await expect(timeline).toHaveAttribute('data-current-day', day!)
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: '深入了解' }).click()
  await page.getByRole('button', { name: '返回原地图对照地域' }).click()
  await expect(page.locator('.history-archive-dialog')).toHaveCount(0)
  await expect(timeline).toHaveAttribute('data-current-day', day!)
  await expect(page.locator('.history-marker[data-selected="true"]:not([hidden])')).toBeFocused()
  await expect(page.locator('.maplibregl-canvas')).toHaveCount(1)
})
