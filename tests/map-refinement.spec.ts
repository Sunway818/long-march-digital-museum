import { expect, test } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { armies, endDay, events, placeById, routeWaypoints, sourceById, stages, startDay } from '../src/features/history-map/data'
import { createHistoryModel, eventDay, toDay } from '../src/features/history-map/model'
import { buildRouteChains, displayDirections } from '../src/features/history-map/routeDisplay'
import { focusedRouteIds, presentRoutes } from '../src/features/history-map/routePresentation'
import type { HistoryState } from '../src/features/history-map/types'

const initial = (): HistoryState => ({ currentDay: startDay, visibleArmies: armies.map(a => a.id), selectedArmy: null, selectedEventId: null, playing: false, speed: 1, mode: 'overview', followCamera: false, stageId: null })
const receptionIds = ['VIEW-central-161-77', 'VIEW-central-162-76']
const ids = (state: HistoryState) => buildRouteChains(displayDirections, state).flatMap(c => c.segmentIds)

test('红蓝交会区域审计：两段红色1936接应独立，1935演进不提前显示', () => {
  const state = { ...initial(), currentDay: toDay('1935-02-18') }
  expect(ids({ ...state, visibleArmies: ['central'] })).toEqual(expect.arrayContaining(receptionIds))
  expect(ids({ ...state, visibleArmies: ['fourth'] }).some(id => receptionIds.includes(id))).toBe(false)
  expect(ids({ ...state, visibleArmies: ['central', 'fourth'] })).toEqual(expect.arrayContaining(receptionIds))
  expect(ids({ ...state, mode: 'time' }).some(id => displayDirections.find(s => s.id === id)!.start_date! >= '1936')).toBe(false)
  expect(ids({ ...state, showReception: false }).some(id => receptionIds.includes(id))).toBe(false)
  expect(ids({ ...state, mode: 'time', currentDay: toDay('1936-09-13') })).not.toContain(receptionIds[0])
  expect(ids({ ...state, mode: 'time', currentDay: toDay('1936-09-14') })).toContain(receptionIds[0])
  expect(ids({ ...state, mode: 'time', currentDay: toDay('1936-09-30') })).not.toContain(receptionIds[1])
  expect(ids({ ...state, mode: 'time', currentDay: toDay('1936-10-02') })).toContain(receptionIds[1])
  for (const id of receptionIds) {
    const segment = displayDirections.find(s => s.id === id)!
    expect(segment.army_id).toBe('central'); expect(segment.phase).toBe('reception')
    expect(segment.geometry.coordinates).toHaveLength(2)
    expect(buildRouteChains(displayDirections, state).find(c => c.segmentIds.includes(id))?.segmentIds).toEqual([id])
    expect(segment.verification_status).toBe('pending')
  }
  const describe = (id: string) => placeById.get(id)?.name ?? routeWaypoints.get(id)?.referenceName
  mkdirSync('output/playwright/map-refinement-20261115', { recursive: true })
  writeFileSync('output/playwright/map-refinement-20261115/geometry-audit.json', JSON.stringify(displayDirections.map(s => ({ ...s, fromName: describe(s.from_place_id), toName: describe(s.to_place_id), sources: s.source_ids.map(id => sourceById.get(id)) })), null, 2))
})

test('路线层级保留所有已展开坐标，总览复位、过期选中与播放不残留高亮', () => {
  const reduce = createHistoryModel(events, stages, startDay, endDay)
  const selected = reduce(initial(), { type: 'select', id: 'EVT-028' })
  const presented = presentRoutes(buildRouteChains(displayDirections, selected), selected)
  expect(new Set(presented.map(p => p.emphasis))).toEqual(new Set(['focus', 'related', 'context']))
  expect(presented.filter(p => p.emphasis === 'focus').flatMap(p => p.segmentIds)).toEqual(['VIEW-central-25-28','VIEW-central-28-20'])
  expect(presented.filter(p => p.emphasis === 'focus').every(p => p.width > 1 && p.opacity === 1)).toBe(true)
  expect(presented.filter(p => p.emphasis === 'context').every(p => p.opacity >= .4)).toBe(true)
  const overview = reduce(selected, { type: 'mode', mode: 'overview' })
  expect(presentRoutes(buildRouteChains(displayDirections, overview), overview).every(p => p.emphasis === 'comparison')).toBe(true)
  expect(overview.selectedArmy).toBeNull()
  const hidden = reduce(selected, { type: 'army', id: 'central' })
  expect(hidden.selectedEventId).toBeNull(); expect(hidden.selectedArmy).toBeNull()
  expect(focusedRouteIds(hidden).size).toBe(0)
  expect(reduce(selected, { type: 'close' }).selectedArmy).toBeNull()
  expect(focusedRouteIds({ ...selected, mode: 'time', currentDay: toDay('1935-03-10') }).size).toBe(0)
  expect(focusedRouteIds({ ...selected, mode: 'time', playing: true, currentDay: toDay('1935-03-10') })).toContain('VIEW-central-20-33')
  // Compare each visible segment's exact vertex slice before/after presentation,
  // including Mercator-clipped partial segments at all event anchor dates.
  for (const day of new Set([startDay, endDay, ...events.flatMap(e => eventDay(e) ? [toDay(eventDay(e)!)] : [])])) {
    const state: HistoryState = { ...selected, mode: 'time', currentDay: day }
    const before = buildRouteChains(displayDirections, state), after = presentRoutes(before, state)
    const slices = (chains: typeof before) => new Map(chains.flatMap(c => {
      let offset = 0
      return c.segmentIds.map(id => {
        const coordinates = c.coordinates.slice(offset, offset + displayDirections.find(s => s.id === id)!.geometry.coordinates.length)
        offset += coordinates.length - 1
        return [id, coordinates] as const
      })
    }))
    expect(slices(after)).toEqual(slices(before))
  }
})

test('分段说明与日期模式一致，路线真实渲染，筛选不改变日期', async ({ page }) => {
  await page.goto('/#map')
  const map = page.locator('.history-map-canvas'), timeline = page.locator('.unified-timeline')
  await expect(map).toHaveAttribute('data-map-state', 'local')
  await expect.poll(async () => Number(await map.getAttribute('data-rendered-route-features'))).toBeGreaterThan(0)
  await expect(map).not.toHaveAttribute('data-map-error')
  await page.getByRole('button', { name: '查看1936 接应会宁路线说明', exact: true }).click()
  const inspector = page.getByRole('region', { name: '路线分段说明' })
  await expect(inspector).toHaveAttribute('data-segment-id', 'VIEW-central-162-76')
  await expect(inspector).toContainText('1936-09-30 — 1936-10-02')
  await expect(inspector.getByRole('link')).toHaveCount(1)
  await inspector.getByRole('button', { name: '关闭路线说明', exact: true }).focus()
  await page.keyboard.press('Escape')
  await expect(inspector).toHaveCount(0)
  await expect(page.locator('.maplibregl-canvas')).toBeFocused()
  await page.getByRole('button', { name: '查看1936 接应会宁路线说明', exact: true }).click()
  const slider = page.getByRole('slider', { name: '全局历史日期' })
  await slider.fill(String(toDay('1935-02-18')))
  await expect(inspector).toHaveCount(0)
  await expect(page.locator('.route-period-label:visible')).toHaveCount(0)
  expect((await map.getAttribute('data-visible-segment-ids'))!.split(',').some(id => receptionIds.includes(id))).toBe(false)
  await page.locator('.map-mode-switch').getByRole('button', { name: '全程总览', exact: true }).click()
  await expect(timeline).toHaveAttribute('data-current-day', String(toDay('1935-02-18')))
  await expect(page.locator('.map-observation-mode')).toContainText('包含1936年路线')
  await expect(page.locator('.route-period-label:visible')).toHaveCount(2)
  await page.getByRole('checkbox', { name: '显示1936年红一方面军接应会师线', exact: true }).uncheck()
  await expect(page.locator('.route-period-label:visible')).toHaveCount(0)
  await expect(map).toHaveAttribute('data-visible-routes', '79')
})

test('1440及1920首屏专题卡可见，键盘进入和返回保持同一地图与筛选', async ({ page }, info) => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 1920, height: 1080 }]) {
    await page.setViewportSize(viewport)
    await page.goto('/#map')
    const map = page.locator('.history-map-canvas'), timeline = page.locator('.unified-timeline')
    await expect(map).toHaveAttribute('data-map-state', 'local')
    await page.getByRole('button', { name: '四渡赤水专题', exact: true }).click()
    await page.getByRole('button', { name: '查看二渡赤水', exact: true }).click()
    await expect(map).toHaveAttribute('data-label-level', 'detail')
    await page.waitForTimeout(950)
    const card = page.getByRole('button', { name: '走进四渡赤水，阅读四渡赤水完整专题', exact: true })
    const bounds = await card.boundingBox(), panel = await page.locator('.history-panel').boundingBox()
    expect(bounds!.y).toBeGreaterThan(panel!.y)
    expect(bounds!.y + bounds!.height).toBeLessThan(panel!.y + panel!.height)
    const before = { center: await map.getAttribute('data-center'), zoom: await map.getAttribute('data-zoom'), day: await timeline.getAttribute('data-current-day'), armies: await page.locator('.army-control input').evaluateAll(nodes => nodes.map(n => (n as HTMLInputElement).checked)) }
    const canvas = await page.locator('.maplibregl-canvas').elementHandle()
    await card.focus(); await expect(card).toBeFocused()
    await page.screenshot({ path: `output/playwright/map-refinement-20261115/${info.project.name}-${viewport.width}-card.png` })
    await card.press('Enter')
    await expect(page.getByRole('article', { name: '四渡赤水完整专题' })).toBeVisible()
    await page.getByRole('button', { name: '关闭历史档案', exact: true }).click()
    await expect(card).toBeFocused()
    expect(await map.getAttribute('data-center')).toBe(before.center)
    expect(await map.getAttribute('data-zoom')).toBe(before.zoom)
    expect(await timeline.getAttribute('data-current-day')).toBe(before.day)
    expect(await page.locator('.army-control input').evaluateAll(nodes => nodes.map(n => (n as HTMLInputElement).checked))).toEqual(before.armies)
    expect(await page.locator('.maplibregl-canvas').evaluate((node, old) => node === old, canvas)).toBe(true)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await expect(map).not.toHaveAttribute('data-map-error')
  }
})
