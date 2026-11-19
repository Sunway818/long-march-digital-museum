import { test, expect, type Page } from '@playwright/test'
import { adaptiveExhibitions } from '../src/features/history-map/adaptiveExhibitions'
import { armies, events, eventById, endDay, startDay, stages, sourceById } from '../src/features/history-map/data'
import { exhibitionImages } from '../src/features/history-map/archiveContent'
import { migratedEventIds } from '../src/features/history-map/exhibitionDefinitions'
import { featuredEvents } from '../src/features/history-map/curation'
import { createHistoryModel, toDay } from '../src/features/history-map/model'
import { followArmy, followPosition } from '../src/features/history-map/cameraFollow'
import { buildRouteChains, displayDirections } from '../src/features/history-map/routeDisplay'
import { armyPresentation } from '../src/features/history-map/presentation'
import type { ArmyId, HistoryState } from '../src/features/history-map/types'

const reducer = createHistoryModel(events, stages, startDay, endDay)
const state = (army: ArmyId, date = '1936-03-01'): HistoryState => ({ currentDay: toDay(date), visibleArmies: [army], selectedArmy: null, selectedEventId: null, playing: false, speed: 1, mode: 'time', followCamera: false, stageId: null })
async function open(page: Page) {
  await page.goto('/#map')
  await expect(page.locator('.history-map-canvas')).toHaveAttribute('data-map-state', 'local')
}
async function select(page: Page, id: string) {
  const back = page.getByRole('button', { name: '关闭事件详情' })
  if (await back.isVisible()) await back.click()
  await page.getByRole('searchbox').fill(id)
  await page.locator('.history-event-list button').click()
  await expect(page.locator('.history-detail')).toHaveAttribute('data-event-id', id)
}
async function expectCamera(page: Page) {
  await expect.poll(async () => page.locator('.history-map-canvas').evaluate(el => {
    const center = (el.getAttribute('data-center') ?? '').split(',').map(Number)
    const target = (el.getAttribute('data-follow-coordinate') ?? '').split(',').map(Number)
    return target.length === 2 && center.length === 2 ? Math.max(...target.map((n, i) => Math.abs(n - center[i]!))) : 100
  // data-center沿用地图诊断的三位小数；允许其舍入误差，仍验证镜头抵达自身路线端点。
  })).toBeLessThan(.00051)
}

test('会议授权范围与独立叙事，原资料状态与空素材保持', () => {
  for (const id of ['EVT-056','EVT-057']) {
    const d = adaptiveExhibitions[id]!, event = eventById.get(id)!
    expect(d.type).toBe('archival')
    expect(d.modules.map(m => m.type)).toEqual(['narrative','decision','timeline','analysis'])
    expect(d.modules.every(m => m.evidence.verification === 'pending' && m.evidence.publication === 'draft' && m.evidence.sourceIds.every(s => sourceById.has(s)))).toBe(true)
    expect(exhibitionImages(event, true)).toEqual([])
    expect(event.verification_status).toBe('pending')
    expect(event.publication_status).toBe('draft')
    expect(event.date_precision).toBe('month')
  }
  expect(adaptiveExhibitions['EVT-059']).toBeUndefined()
  expect(adaptiveExhibitions['EVT-060']).toBeUndefined()
  expect(adaptiveExhibitions['EVT-056']!.opening.lead).not.toBe(adaptiveExhibitions['EVT-058']!.opening.lead)
})

test('四军跟随均使用自身已展开几何，黄色身份及空数据、驻留与选择保持', () => {
  expect(armyPresentation.second.color).toBe('#B47C10')
  for (const [army, date] of [['central','1935-02-15'],['second','1936-03-01'],['fourth','1936-03-01'],['twentyfive','1935-05-01']] as const) {
    const s = state(army, date), p = followPosition(displayDirections, s)!
    expect(p).toBeTruthy()
    expect(p.army).toBe(army)
    expect(displayDirections.find(r => r.id === p.segmentId)?.army_id).toBe(army)
    expect(buildRouteChains(displayDirections, s).some(c => c.coordinates.at(-1)?.every((n, i) => n === p.coordinate[i]))).toBe(true)
    const first = Math.min(...displayDirections.filter(r => r.army_id === army && r.start_date).map(r => toDay(r.start_date!)))
    expect(followPosition(displayDirections, { ...s, currentDay: first - 1 })).toBeNull()
  }
  expect(followPosition([], state('second'))).toBeNull()
  const held = followPosition(displayDirections, state('second', '1936-09-08'))!
  expect(held).toBeTruthy()
  expect(held.partial).toBe(false)
  expect(followPosition(displayDirections, state('second', '1936-09-09'))!.coordinate).toEqual(held.coordinate)
  const multiple = { ...state('central'), visibleArmies: armies.map(a => a.id) }
  expect(followArmy(multiple)).toBeNull()
  let s = reducer(multiple, { type: 'followArmy', id: 'second' })
  s = reducer(s, { type: 'follow', enabled: true })
  s = reducer(s, { type: 'seek', day: toDay('1936-02-01') })
  expect(followArmy(s)).toBe('second')
  expect(s.followCamera).toBe(true)
  s = reducer(s, { type: 'select', id: 'EVT-077' })
  expect(followArmy(s)).toBe('second')
  const fourth = reducer(reducer(multiple, { type: 'followArmy', id: 'fourth' }), { type: 'select', id: 'EVT-058' })
  expect(followArmy(fourth)).toBe('fourth')
  s = reducer(s, { type: 'army', id: 'second' })
  expect(s.followCamera).toBe(false)
})

test('芦花和沙窝档案、独立导览与来源，各模式正文一致', async ({ page }, info) => {
  await open(page)
  for (const id of ['EVT-056','EVT-057']) {
    await select(page, id)
    await page.getByRole('button', { name: '深入了解' }).click()
    const article = page.locator('.adaptive-exhibition')
    await expect(article).toHaveAttribute('data-exhibition-type', 'archival')
    await expect(article.locator('.adaptive-module')).toHaveCount(4)
    await expect(article.locator('img,.adaptive-route,.adaptive-document')).toHaveCount(0)
    await page.evaluate(() => document.fonts.ready)
    await page.screenshot({ path: `output/playwright/sprint/${info.project.name}-${id}-opening.png` })
    const link = article.locator('.adaptive-opening nav a').first()
    await link.click()
    await expect(article.locator('.adaptive-decision')).toBeFocused()
    await page.screenshot({ path: `output/playwright/sprint/${info.project.name}-${id}-decision.png` })
    await article.locator('.archive-sources summary').first().click()
    for (const source of eventById.get(id)!.source_ids) await expect(article.locator(`[data-source="${source}"] a`)).toBeVisible()
    await page.keyboard.press('Escape')
  }
  await page.goto('/?review=0#map')
  for (const id of ['EVT-056','EVT-057']) {
    await select(page, id)
    await page.getByRole('button', { name: '深入了解' }).click()
    await expect(page.locator('.adaptive-module')).toHaveCount(4)
    await expect(page.locator('.exhibit-review-label')).toHaveCount(0)
    await expect(page.locator('.adaptive-exhibition')).not.toContainText('草稿待审核')
    await page.keyboard.press('Escape')
  }
})

test('可达事件入口均首屏可见，切换节点归顶且主操作对比清晰', async ({ page }, info) => {
  test.setTimeout(90_000)
  await page.setViewportSize({ width: 1440, height: 900 })
  await open(page)
  const ids = [...new Set([...featuredEvents.map(e => e.id), ...migratedEventIds, 'EVT-056','EVT-057','EVT-058'])]
  for (const id of ids) {
    await select(page, id)
    const button = page.getByRole('button', { name: '深入了解' })
    await expect(button).toBeInViewport({ ratio: 1 })
    expect(await page.locator('.history-panel').evaluate(el => el.scrollTop)).toBe(0)
    expect(await button.evaluate(el => el.compareDocumentPosition(el.parentElement!.querySelector('.archive-lead')!) & Node.DOCUMENT_POSITION_FOLLOWING)).toBeTruthy()
  }
  await select(page, 'EVT-023')
  const button = page.getByRole('button', { name: '深入了解' })
  await expect(button).toHaveCSS('color', 'rgb(255, 243, 223)')
  await expect(button).toHaveCSS('background-color', 'rgb(120, 52, 44)')
  await page.screenshot({ path: `output/playwright/sprint/${info.project.name}-1440-entry.png` })
  await page.locator('.history-panel').evaluate(el => { el.scrollTop = el.scrollHeight })
  await expect(button).toBeInViewport({ ratio: 1 })
  await page.locator('.history-marker[data-event-ids*="EVT-028"]:not([hidden])').click()
  expect(await page.locator('.history-panel').evaluate(el => el.scrollTop)).toBe(0)
  await expect(button).toBeInViewport({ ratio: 1 })
  await button.click()
  await expect(page.locator('#archive-title')).toHaveText('二渡赤水')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: '定位区域参考点' })).toBeEnabled()
})

test('四军单独跟随及多军切换目标，暂停拖动日期同步且缩放不变', async ({ page }, info) => {
  await open(page)
  const map = page.locator('.history-map-canvas'), slider = page.getByRole('slider', { name: '全局历史日期' })
  for (const [army, date] of [['central','1935-02-15'],['second','1936-03-01'],['fourth','1936-03-01'],['twentyfive','1935-05-01']] as const) {
    await page.getByRole('button', { name: '全部隐藏', exact: true }).click()
    await page.locator('.army-control').nth(armies.findIndex(a => a.id === army)).locator('input').check()
    await slider.fill(String(toDay(date)))
    const zoom = await map.getAttribute('data-zoom')
    await page.getByRole('checkbox', { name: '镜头跟随', exact: true }).check()
    await expect(map).toHaveAttribute('data-follow-army', army)
    await expectCamera(page)
    expect(await map.getAttribute('data-zoom')).toBe(zoom)
    await slider.fill(String(toDay(date) + 2))
    await expectCamera(page)
    expect(await map.getAttribute('data-zoom')).toBe(zoom)
    await page.screenshot({ path: `output/playwright/sprint/${info.project.name}-follow-${army}.png` })
  }
  await page.getByRole('button', { name: '全部显示', exact: true }).click()
  await slider.fill(String(toDay('1936-03-01')))
  for (const army of ['second','central','fourth','twentyfive']) {
    await page.getByRole('combobox', { name: '镜头跟随部队' }).selectOption(army)
    await expect(map).toHaveAttribute('data-follow-army', army)
    await expectCamera(page)
  }
  await page.getByRole('combobox', { name: '镜头跟随部队' }).selectOption('second')
  await select(page, 'EVT-077')
  // 新动效任务：明确选择历史节点时让出镜头，防止定位与旧跟随争夺。
  await expect(page.getByRole('checkbox', { name: '镜头跟随', exact: true })).not.toBeChecked()
  await expect(map).toHaveAttribute('data-follow-coordinate', '')
  await expect(page.locator('.history-detail')).toHaveAttribute('data-event-id', 'EVT-077')
  // 用户重新开启后仍保留此前明确选择的黄色目标，不改成数组首支部队。
  await page.getByRole('checkbox', { name: '镜头跟随', exact: true }).check()
  await expect(page.getByRole('combobox', { name: '镜头跟随部队' })).toHaveValue('second')
  await expect(map).toHaveAttribute('data-follow-army', 'second')
  await expectCamera(page)
})

test('黄色播放跟随、空时点保持镜头、关闭与拖拽/重置恢复手动', async ({ page }, info) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await open(page)
  const map = page.locator('.history-map-canvas'), slider = page.getByRole('slider', { name: '全局历史日期' }), follow = page.getByRole('checkbox', { name: '镜头跟随', exact: true })
  const overview = { center: (await map.getAttribute('data-center'))!, zoom: (await map.getAttribute('data-zoom'))! }
  await page.getByRole('button', { name: '全部隐藏', exact: true }).click()
  await page.locator('.army-control').nth(1).locator('input').check()
  await slider.fill(String(toDay('1936-03-01')))
  await follow.check(); await expectCamera(page)
  const center = await map.getAttribute('data-center'), zoom = await map.getAttribute('data-zoom')
  await page.getByRole('button', { name: '开始历史播放' }).click()
  await expect.poll(() => map.getAttribute('data-center')).not.toBe(center)
  await page.getByRole('button', { name: '暂停历史播放' }).click()
  await expectCamera(page)
  expect(await map.getAttribute('data-zoom')).toBe(zoom)
  await page.screenshot({ path: `output/playwright/sprint/${info.project.name}-1440-yellow-playing.png` })
  const held = await map.getAttribute('data-center')
  await slider.fill(String(startDay))
  await expect(map).toHaveAttribute('data-follow-coordinate', '')
  expect(await map.getAttribute('data-center')).toBe(held)
  await follow.uncheck()
  const before = await map.getAttribute('data-center'), box = (await map.boundingBox())!
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down(); await page.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2 + 60, { steps: 12 }); await page.mouse.up()
  await expect.poll(() => map.getAttribute('data-center')).not.toBe(before)
  await slider.fill(String(toDay('1936-03-01')))
  await follow.check(); await expectCamera(page)
  await page.getByRole('button', { name: '重置视野', exact: true }).click()
  await expect(follow).not.toBeChecked()
  await expect(map).toHaveAttribute('data-center', overview.center)
  await expect(map).toHaveAttribute('data-zoom', overview.zoom)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await follow.check(); await expectCamera(page)
  await expect(map).toHaveAttribute('data-zoom', overview.zoom)
})
