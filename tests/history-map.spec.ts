import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { createHistoryModel, eventDay, eventVisible, toDay, visibleSegments, armyName, clusterTimeline } from '../src/features/history-map/model'
import { armies, config, documents, endDay, events, images, places, routeWaypoints, routes, sources, stages, startDay } from '../src/features/history-map/data'
import type { HistoryState } from '../src/features/history-map/types'
import { additionalDirections, buildRouteChains, clipDirection, displayDirections, fromVisit, toVisit } from '../src/features/history-map/routeDisplay'
import { featuredEvents } from '../src/features/history-map/curation'
import { featuredNotes } from '../src/features/history-map/featuredEvents'

const initial = (): HistoryState => ({ currentDay: startDay, visibleArmies: armies.map(a => a.id), selectedArmy: null, selectedEventId: null, playing: false, speed: 1, mode: 'overview', followCamera: false, stageId: null })

test('沿线首屏隐藏地名，放大展开四渡、缩回收拢，窄窗口可开关资料栏', async ({ page }, testInfo) => {
  await openLocalMap(page)
  const map = page.locator('.history-map-canvas')
  const labels = page.locator('.history-marker:not([hidden]) .history-marker-label:not([hidden])')
  await expect(map).toHaveAttribute('data-label-level', 'overview')
  await expect(labels).toHaveCount(0)
  await expect(page.locator('.history-marker[data-major=true]:not([hidden])')).toHaveCount(9)
  await expect(page.locator('.map-china-reference')).toHaveCount(0)
  await page.locator('.history-marker[data-campaign=chishui]:not([hidden])').click()
  await expect(map).toHaveAttribute('data-label-level', 'detail')
  await expect(page.locator('.history-marker:not([hidden])[data-crossings]:not([data-crossings=""])')).toHaveCount(4)
  await page.locator('.map-mode-switch').getByRole('button', { name: '全程总览', exact: true }).click()
  await expect(map).toHaveAttribute('data-label-level', 'overview')
  await expect(labels).toHaveCount(0)
  await page.setViewportSize({ width: 682, height: 668 })
  await expect(page.locator('.map-controls')).toBeHidden()
  const toggles = page.getByRole('group', { name: '地图资料面板' })
  await toggles.getByRole('button', { name: '部队与图例', exact: true }).click()
  await expect(page.locator('.map-controls')).toBeVisible()
  await toggles.getByRole('button', { name: '历史资料', exact: true }).click()
  await expect(page.locator('.map-controls')).toBeHidden()
  await expect(page.locator('.history-panel')).toBeVisible()
  await toggles.getByRole('button', { name: '历史资料', exact: true }).click()
  await expect(page.locator('.history-panel')).toBeHidden()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: `output/playwright/china-sheet/${testInfo.project.name}-compact.png` })
})

test('展示路线按部队、分路及南下再北上阶段串接，不跨年补线', () => {
  expect(routes.segments).toHaveLength(17)
  expect(displayDirections).toHaveLength(81)
  expect(additionalDirections).toHaveLength(75)
  const sourceIds = new Set(sources.map(s => s.id))
  for (const segment of displayDirections) {
    expect(segment.geometry_confidence).toBe('regional-direction-only')
    expect(segment.display_style).toBe('dashed')
    expect(segment.source_ids.every(id => sourceIds.has(id))).toBe(true)
    const lookup = (id: string) => places.find(p => p.id === id) ?? routeWaypoints.get(id)!
    const from = lookup(segment.from_place_id), to = lookup(segment.to_place_id)
    expect(segment.geometry.coordinates[0]).toEqual([from.longitude, from.latitude])
    expect(segment.geometry.coordinates.at(-1)).toEqual([to.longitude, to.latitude])
    expect(segment.start_date && segment.reveal_date && segment.start_date <= segment.reveal_date).toBeTruthy()
  }
  const chains = buildRouteChains(displayDirections, initial())
  expect(chains).toHaveLength(17)
  expect(chains.filter(c => c.armyId === 'fourth')).toHaveLength(9)
  expect(chains.flatMap(c => c.segmentIds).sort()).toEqual(displayDirections.map(s => s.id).sort())
  for (const chain of chains) {
    const segments = chain.segmentIds.map(id => displayDirections.find(s => s.id === id)!)
    expect(segments.every(s => s.army_id === chain.armyId)).toBe(true)
    for (let i = 1; i < segments.length; i++) expect(fromVisit(segments[i]!)).toBe(toVisit(segments[i - 1]!))
    expect(chain.coordinates).toEqual(segments.flatMap((s, i) => i ? s.geometry.coordinates.slice(1) : s.geometry.coordinates))
  }
  expect(buildRouteChains(displayDirections, { ...initial(), visibleArmies: [] })).toHaveLength(0)
  expect(buildRouteChains(displayDirections, { ...initial(), mode: 'time', currentDay: startDay }).flatMap(chain => chain.segmentIds)).toEqual(['VIEW-central-1-4'])
})

test('精选索引具地域坐标、日期、独立说明及可追溯来源，原始事件完整保留', () => {
  expect(featuredEvents).toHaveLength(38)
  expect(events).toHaveLength(157)
  expect(featuredEvents.some(e => e.id === 'EVT-004')).toBe(false)
  for (const event of featuredEvents) {
    expect(event.start_date).toBeTruthy()
    expect(event.place_ids.some(id => places.some(p => p.id === id && p.longitude !== null))).toBe(true)
    const note = featuredNotes[event.id]!
    expect((note.summary || event.summary).length).toBeGreaterThanOrEqual(40)
    expect(note.locator).toBeTruthy()
    expect(note.sourceIds.every(id => sources.some(s => s.id === id))).toBe(true)
    expect(event.verification_status).not.toBe('verified')
  }
})

test('四渡赤水保留四事件、二次遵义访问、原始日期及地域坐标出处', () => {
  for (const id of ['EVT-023', 'EVT-028', 'EVT-033', 'EVT-034']) expect(featuredEvents.some(e => e.id === id)).toBe(true)
  const chain = buildRouteChains(displayDirections, initial()).find(c => c.armyId === 'central')!
  const visited = chain.segmentIds.map(id => displayDirections.find(s => s.id === id)!.to_place_id)
  const crossingVisits = visited.filter(id => ['PLC-0022', 'PLC-0028', 'PLC-0033', 'PLC-0034'].includes(id))
  expect(crossingVisits).toEqual(['PLC-0022', 'PLC-0028', 'PLC-0033', 'PLC-0034'])
  expect(visited.filter(id => id === 'PLC-0020')).toHaveLength(2)
  expect(displayDirections.find(s => s.from_visit_id === 'VISIT-central-zunyi-return')?.start_date).toBe('1935-02-28')
  expect(events.find(e => e.id === 'EVT-029')?.start_date).toBe('1935-02-01')
  expect(events.find(e => e.id === 'EVT-029')?.display_date).toBe('1935-02-28')
  expect(places.find(p => p.id === 'PLC-0028')?.coordinate_record_url).toContain('1793591')
  expect(places.find(p => p.id === 'PLC-0034')?.coordinate_record_url).toContain('6912719')
})

test('线长裁剪可逆、分段连续；驻留期不插值，不把未来节点提前接入', () => {
  const segment = displayDirections.find(s => s.id === 'VIEW-central-25-28')!
  const halfway = toDay('1935-02-09') + (toDay('1935-02-18') - toDay('1935-02-09')) / 2
  const state = { ...initial(), mode: 'time' as const, currentDay: halfway }
  const half = buildRouteChains(displayDirections, state).find(c => c.armyId === 'central')!
  expect(half.partialSegmentId).toBe(segment.id)
  const endpoint = half.coordinates.at(-1)!
  const expected = clipDirection(segment.geometry.coordinates, .5).at(-1)!
  expect(endpoint[0]).toBeCloseTo(expected[0], 7); expect(endpoint[1]).toBeCloseTo(expected[1], 7)
  expect(half.segmentIds.some(id => id === 'VIEW-central-33-34')).toBe(false)
  const before = buildRouteChains(displayDirections, { ...state, currentDay: toDay('1935-02-09') }).find(c => c.armyId === 'central')!
  expect(before.coordinates.at(-1)).toEqual(segment.geometry.coordinates[0])
  const full = buildRouteChains(displayDirections, { ...state, currentDay: toDay('1935-02-18') }).find(c => c.armyId === 'central')!
  expect(full.coordinates.at(-1)).toEqual(segment.geometry.coordinates.at(-1))
  expect(buildRouteChains(displayDirections, state)).toEqual(buildRouteChains(displayDirections, state))
  expect(clipDirection(segment.geometry.coordinates, 0)).toEqual([])
  const hold = displayDirections.find(s => s.id === 'VIEW-twentyfive-137-141')!
  const during = buildRouteChains(displayDirections, { ...state, currentDay: toDay('1935-05-01') }).find(c => c.armyId === 'twentyfive')!
  expect(during.segmentIds).not.toContain(hold.id)
})

test('四渡专题四步定位与调时，拖动默认总览即进入演进，播放与暂停冻结线端', async ({ page }) => {
  await openLocalMap(page)
  await page.getByRole('button', { name: '四渡赤水专题', exact: true }).click()
  const map = page.locator('.history-map-canvas'), timeline = page.locator('.unified-timeline')
  await expect.poll(async () => Number(await map.getAttribute('data-zoom'))).toBeGreaterThan(6.5)
  await expect(page.getByRole('region', { name: '四渡赤水行动次序' }).getByRole('button')).toHaveCount(4)
  await expect(page.locator('.army-control input:checked')).toHaveCount(1)
  await expect(page.locator('.history-marker:not([hidden])[data-crossings]:not([data-crossings=""])')).toHaveCount(4)
  const dates = ['1935-01-29', '1935-02-18', '1935-03-16', '1935-03-21']
  const ids = ['EVT-023', 'EVT-028', 'EVT-033', 'EVT-034']
  for (let i = 0; i < dates.length; i++) {
    await page.getByRole('button', { name: ['查看一渡赤水', '查看二渡赤水', '查看三渡赤水', '查看四渡赤水'][i], exact: true }).click()
    await expect(page.locator('.history-map-page')).toHaveAttribute('data-mode', 'time')
    await expect(timeline).toHaveAttribute('data-current-day', String(toDay(dates[i]!)))
    await expect(page.locator('.history-detail')).toHaveAttribute('data-event-id', ids[i]!)
    await expect(page.locator('.history-marker:not([hidden])[data-crossings]:not([data-crossings=""])')).toHaveCount(4)
    await expect(page.locator('.history-marker:not([hidden])[data-crossings]:not([data-crossings=""])[data-future="true"]')).toHaveCount(3 - i)
  }
  // Future topic waypoints stay clickable; selecting them still updates the unique date.
  await page.getByRole('button', { name: '查看一渡赤水', exact: true }).click()
  await page.locator('.history-marker:not([hidden])[data-crossings="EVT-028"]').click()
  await expect(timeline).toHaveAttribute('data-current-day', String(toDay('1935-02-18')))
  await expect(page.locator('.history-detail')).toHaveAttribute('data-event-id', 'EVT-028')
  await page.getByRole('button', { name: '时间演进', exact: true }).click()
  await expect(page.locator('.history-marker:not([hidden])[data-crossings]:not([data-crossings=""])')).toHaveCount(2)
  await expect(page.locator('.map-china-reference')).toHaveCount(0)
  expect(await page.locator('.map-paper-folds').evaluate(el => getComputedStyle(el).pointerEvents)).toBe('none')
  await expect(page.locator('.map-paper-wear,.map-paper-grain,.map-paper-creases')).toHaveCount(0)
  await page.locator('.map-mode-switch').getByRole('button', { name: '全程总览', exact: true }).click()
  const slider = await page.getByRole('slider').boundingBox()
  const fraction = (toDay('1935-02-13') - startDay) / (endDay - startDay)
  const currentFraction = (Number(await timeline.getAttribute('data-current-day')) - startDay) / (endDay - startDay)
  // Drag the thumb: a nearby track click can hit the thumb without changing its value.
  await page.mouse.move(slider!.x + 7 + (slider!.width - 14) * currentFraction, slider!.y + slider!.height / 2)
  await page.mouse.down()
  await page.mouse.move(slider!.x + 7 + (slider!.width - 14) * fraction, slider!.y + slider!.height / 2, { steps: 5 })
  await page.mouse.up()
  await expect(page.locator('.history-map-page')).toHaveAttribute('data-mode', 'time')
  await expect(map).toHaveAttribute('data-partial-routes', '1')
  const end = await map.getAttribute('data-route-endpoint')
  await page.getByRole('button', { name: '开始历史播放' }).click()
  await expect.poll(() => map.getAttribute('data-route-endpoint')).not.toBe(end)
  await page.getByRole('button', { name: '暂停历史播放' }).click()
  const frozen = await map.getAttribute('data-route-endpoint')
  await page.waitForTimeout(200)
  await expect(map).toHaveAttribute('data-route-endpoint', frozen!)
})

test('分兵与会师按行动归属，1935年北上、1936年接应及两军团分路独立', () => {
  const byArmy = (army: string) => displayDirections.filter(s => s.army_id === army)
  const endpoints = (army: string) => byArmy(army).flatMap(s => [s.from_place_id, s.to_place_id])
  for (const army of ['second', 'fourth']) {
    for (const forbidden of ['PLC-0022','PLC-0028','PLC-0033','PLC-0034','PLC-0049','PLC-0063','PLC-0064','PLC-0072']) {
      expect(endpoints(army)).not.toContain(forbidden)
    }
  }
  expect(endpoints('second')).not.toContain('PLC-0053')
  expect(endpoints('twentyfive')).toContain('PLC-0150')
  expect(endpoints('twentyfive')).not.toContain('PLC-0066')
  const solo = (army: HistoryState['visibleArmies'][number], date: string) => buildRouteChains(displayDirections, {
    ...initial(), visibleArmies: [army], currentDay: toDay(date), mode: 'time',
  }).flatMap(c => c.segmentIds)
  expect(solo('fourth', '1935-11-30')).toContain('VIEW-fourth-114-115')
  expect(solo('fourth', '1935-11-30')).not.toContain('VIEW-fourth-118-121')
  expect(solo('fourth', '1936-07-17')).toContain('VIEW-fourth-100-119')
  expect(solo('second', '1936-07-17')).not.toContain('VIEW-second-119-102')
  expect(solo('central', '1935-11-30')).not.toContain('VIEW-central-162-76')
  expect(solo('central', '1936-10-02')).toContain('VIEW-central-162-76')
  expect(solo('second', '1936-07-02')).toEqual(expect.arrayContaining(['VIEW-second-97-100','VIEW-second-97-100-sixth']))
  expect(solo('second', '1936-07-02')).not.toContain('VIEW-second-100-119')
})

test('北段补线保留梯队和年份边界，红四往返分期，红二十五军西征不倒序', () => {
  const solo = (army: HistoryState['visibleArmies'][number], date: string) => buildRouteChains(displayDirections, {
    ...initial(), visibleArmies: [army], currentDay: toDay(date), mode: 'time',
  })
  const second = displayDirections.filter(s => s.army_id === 'second')
  expect(second.some(s => s.from_place_id === 'PLC-0122' || s.to_place_id === 'PLC-0122')).toBe(false)
  const north = second.find(s => s.id === 'VIEW-second-165-102')!
  expect(north.geometry.coordinates.slice(1, -1)).toEqual(['PLC-0171', 'PLC-0172'].map(id => {
    const p = routeWaypoints.get(id)!; return [p.longitude, p.latitude]
  }))
  expect(north.reveal_date).toBe('1936-09-06')
  expect(solo('second', '1936-10-22').flatMap(c => c.segmentIds)).toContain('VIEW-second-168-77')
  const fourth1935 = solo('fourth', '1935-11-19')
  expect(fourth1935.some(c => c.phase === 'south')).toBe(true)
  expect(fourth1935.some(c => c.phase === 'west' || c.phase === 'north')).toBe(false)
  expect(solo('fourth', '1936-04-01').some(c => c.phase === 'west')).toBe(true)
  expect(solo('fourth', '1936-08-05').flatMap(c => c.segmentIds)).toContain('VIEW-fourth-114-121-right-1936')
  for (const c of buildRouteChains(displayDirections, initial())) {
    expect(new Set(c.segmentIds.map(id => displayDirections.find(s => s.id === id)?.phase ?? 'march')).size).toBe(1)
  }
  const central1935 = solo('central', '1935-12-31')
  expect(central1935.every(c => c.phase !== 'reception')).toBe(true)
  expect(buildRouteChains(displayDirections, { ...initial(), showReception: false }).every(c => c.phase !== 'reception')).toBe(true)
  const twentyfive = solo('twentyfive', '1935-08-21').find(c => c.phase === 'march')!
  expect(twentyfive.coordinates.at(-1)).toEqual(displayDirections.find(s => s.id === 'VIEW-twentyfive-144-146')!.geometry.coordinates.at(-1))
  expect(twentyfive.segmentIds).not.toContain('VIEW-twentyfive-146-150')
  expect(events.find(e => e.id === 'EVT-115')?.army_ids).toEqual(['fourth'])
  expect(events.find(e => e.id === 'EVT-053')?.army_ids).toEqual(expect.arrayContaining(['central', 'fourth']))
  expect(places.find(p => p.id === 'PLC-0053')?.coordinate_record_url).toContain('1800792')
})

test('史料复核：红四春季已到甘孜，红二四县阶段不套用成县单点日期', () => {
  const state = (army: HistoryState['visibleArmies'][number], date: string): HistoryState => ({
    ...initial(), visibleArmies: [army], mode: 'time', currentDay: toDay(date),
  })
  const westId = 'VIEW-fourth-117-100'
  const before = buildRouteChains(displayDirections, state('fourth', '1936-04-09'))
  expect(before.flatMap(c => c.segmentIds)).not.toContain(westId)
  const spring = buildRouteChains(displayDirections, state('fourth', '1936-04-10'))
  const west = spring.find(c => c.phase === 'west')!
  expect(west.segmentIds).toContain(westId)
  expect(west.coordinates.at(-1)).toEqual([places.find(p => p.id === 'PLC-0100')!.longitude, places.find(p => p.id === 'PLC-0100')!.latitude])
  expect(spring.some(c => c.phase === 'north')).toBe(false)
  const june = buildRouteChains(displayDirections, state('fourth', '1936-06-01')).find(c => c.phase === 'west')!
  expect(june.coordinates).toEqual(west.coordinates)
  expect(events.find(e => e.id === 'EVT-100')?.display_date).toBe('1936-07-02')
  const regional = 'VIEW-second-102-103'
  const sept17 = buildRouteChains(displayDirections, state('second', '1936-09-17')).find(c => c.segmentIds.includes(regional))!
  expect(sept17.partialSegmentId).toBe(regional)
  const sept19 = buildRouteChains(displayDirections, state('second', '1936-09-19')).find(c => c.segmentIds.includes(regional))!
  expect(sept19.partialSegmentId).toBeUndefined()
  expect(events.find(e => e.id === 'EVT-103')?.display_date).toBe('1936-09-19')
  expect(events.find(e => e.id === 'EVT-103')?.date_precision).toBe('month')
})

test('接应会师线可独立隐藏且日期不变，节点使用独立墨色，缩放出现地名', async ({ page }) => {
  await openLocalMap(page)
  const map = page.locator('.history-map-canvas'), timeline = page.locator('.unified-timeline')
  const day = await timeline.getAttribute('data-current-day')
  const reception = page.getByRole('checkbox', { name: '显示1936年红一方面军接应会师线', exact: true })
  await reception.uncheck()
  await expect(map).toHaveAttribute('data-visible-routes', String(displayDirections.length - 2))
  await expect(timeline).toHaveAttribute('data-current-day', day!)
  await reception.check()
  await expect(map).toHaveAttribute('data-visible-routes', String(displayDirections.length))
  const node = page.locator('.history-marker[data-major=true]:not([hidden])').first()
  const ink = await node.evaluate(el => getComputedStyle(el, '::before').color)
  expect(ink).toBe('rgb(71, 52, 38)')
  expect(Number(await map.getAttribute('data-direction-arrows'))).toBeGreaterThan(0)
  await page.getByRole('button', { name: '放大地图', exact: true }).click()
  await expect(map).not.toHaveAttribute('data-label-level', 'overview')
  await expect.poll(async () => Number(await map.getAttribute('data-visible-labels'))).toBeGreaterThan(0)
})

test('榜罗与会师分别落点，甘孜编成前后的番号同步出现在筛选和卡片', async ({ page }, testInfo) => {
  await openLocalMap(page)
  await page.getByRole('button', { name: '四渡赤水专题', exact: true }).click()
  await page.getByRole('button', { name: '全部显示', exact: true }).click()
  for (const [id, kind] of [['066','meeting'], ['072','march'], ['073','reunion'], ['150','reunion'], ['076','reunion'], ['077','reunion']]) {
    await expect(page.locator(`.history-marker[data-event-ids="EVT-${id}"]`)).toHaveAttribute('data-kind', kind!)
  }
  await expect(page.locator('.history-marker[data-event-ids="EVT-063"] .history-marker-label')).toContainText('甘肃迭部 · 俄界（高吉）｜确址待核')

  for (const ids of ['EVT-061,EVT-121', 'EVT-065,EVT-102']) {
    const caption = page.locator(`.history-marker[data-event-ids="${ids}"] .history-marker-label`)
    await expect(caption).toContainText('1935年')
    await expect(caption).toContainText('1936年')
  }
  await page.screenshot({ path: `output/playwright/campaign-regression/${testInfo.project.name}-overview.png` })
  await page.getByRole('button', { name: '时间演进', exact: true }).click()
  await selectEvent(page, 'EVT-096')
  await expect(page.locator('.event-army-tags')).toHaveText('红二、红六军团')
  await expect(page.getByRole('checkbox', { name: '显示红二、红六军团', exact: true })).toBeChecked()
  await selectEvent(page, 'EVT-157')
  await expect(page.locator('.event-army-tags')).toHaveText('红二方面军')
  await expect(page.getByRole('checkbox', { name: '显示红二方面军', exact: true })).toBeChecked()
})

test('历史模型：唯一日期、回退撤销、隐藏、终点、重播与动态军名', () => {
  const reduce = createHistoryModel(events, stages, startDay, endDay)
  let state = reduce(initial(), { type: 'mode', mode: 'time' })
  state = reduce(state, { type: 'select', id: 'EVT-001' })
  expect(state.currentDay).toBe(toDay('1935-01-15'))
  expect(state.selectedEventId).toBe('EVT-001')
  state = reduce(state, { type: 'seek', day: startDay })
  expect(state.selectedEventId).toBeNull()
  expect(events.filter(e => eventVisible(e, state)).every(e => toDay(e.start_date!) <= startDay)).toBe(true)
  expect(visibleSegments(routes.segments, state)).toHaveLength(0)
  state = reduce(state, { type: 'play' })
  state = reduce(state, { type: 'seek', day: endDay + 300, tick: true })
  expect(state.currentDay).toBe(endDay); expect(state.playing).toBe(false)
  state = reduce(state, { type: 'play' })
  expect(state.currentDay).toBe(startDay)
  state = reduce(state, { type: 'armies', ids: [] })
  expect(state.playing).toBe(false)
  expect(reduce(state, { type: 'select', id: 'EVT-001' })).toBe(state)
  state = reduce(state, { type: 'select', id: 'EVT-001', revealArmy: true })
  expect(state.visibleArmies).toContain('central')
  expect(armyName('second', toDay('1935-11-19'))).toBe('红二、红六军团')
  expect(armyName('second', toDay('1936-07-05'))).toBe('红二方面军')
  expect(armyName('second', toDay('1934-08-07'))).toBe('红六军团（先遣）')
  const shared = events.find(e => e.army_ids.includes('central') && e.army_ids.includes('fourth'))!
  state = reduce({ ...initial(), visibleArmies: ['fourth'] }, { type: 'select', id: shared.id, revealArmy: true })
  expect(state.visibleArmies).toEqual(['fourth'])
  expect(state.selectedArmy).toBe('fourth')
})

test('本地研究归档：原始工作簿未改动', () => {
  const path = resolve('research/overnight_20261110', config.workbook)
  test.skip(!existsSync(path), '原始工作簿保留在本地研究归档')
  const workbook = readFileSync(path)
  expect(createHash('sha256').update(workbook).digest('hex')).toBe(config.workbook_sha256)
})

test('数据审计：引用有效、无伪造坐标/精确线、图片按登记复制', () => {
  expect(places).toHaveLength(156); expect(events).toHaveLength(157)
  expect(places.filter(p => p.longitude !== null)).toHaveLength(81)
  expect(places.filter(p => p.coordinate_precision === 'precise')).toHaveLength(0)
  const ids = new Set([...places, ...events, ...images, ...documents, ...sources].map(x => x.id))
  for (const entity of [...places, ...events]) {
    const refs = [...entity.source_ids, ...entity.image_ids, ...entity.document_ids]
    expect(refs.every(id => ids.has(id)), entity.id).toBe(true)
  }
  for (const segment of routes.segments) {
    expect(segment.display_style).toBe('dashed')
    expect(segment.geometry_confidence).toBe('regional-direction-only')
    expect(segment.source_ids.length).toBeGreaterThan(0)
    expect(segment.source_ids.every(id => ids.has(id))).toBe(true)
  }
  expect(events.find(e => e.id === 'EVT-106')?.start_date).toBe('1935-03-28')
  expect(events.find(e => e.id === 'EVT-087')?.end_date).toBe('1936-01-07')
  expect(events.find(e => e.id === 'EVT-135')?.start_date).toBe('1934-12-01')
  expect(events.find(e => e.id === 'EVT-113')?.start_date).toBeNull()
  expect(images.filter(i => i.rejected).every(i => i.local_preview_url === null)).toBe(true)
  expect(existsSync('public/assets/history/photos/AST-0024_于都红色渡口.jpg')).toBe(false)
  for (const army of armies) {
    const groups = clusterTimeline(events.filter(e => e.army_ids.includes(army.id)), startDay, endDay, 1000)
    expect(groups.every((g, i) => i === 0 || (g.position - groups[i - 1]!.position) * 1000 >= 28)).toBe(true)
  }
})

async function openLocalMap(page: Page) {
  // The complete China base is served locally and survives external-network loss.
  await page.route('https://tiles.openfreemap.org/**', route => route.fulfill({ status: 503, body: 'QA: online service unavailable' }))
  await page.goto('/#map')
  await expect(page.locator('.history-map-canvas')).toHaveAttribute('data-map-state', 'local')
  await expect(page.locator('.history-map-canvas')).toHaveAttribute('data-visible-nodes', '81')
}
async function selectEvent(page: Page, id: string) {
  const close = page.getByRole('button', { name: '关闭事件详情' })
  if (await close.isVisible()) await close.click()
  await page.getByRole('searchbox').fill(id)
  await page.locator('.history-event-list button').click()
  await expect(page.locator('.history-detail')).toHaveAttribute('data-event-id', id)
}

test('地图筛选、共享日期、未来节点回退和空集合', async ({ page }) => {
  await openLocalMap(page)
  await expect(page.locator('.unified-timeline')).toHaveCount(1)
  await expect(page.locator('.timeline-lane')).toHaveCount(0)
  await selectEvent(page, 'EVT-001')
  await expect(page.locator('.unified-timeline')).toHaveAttribute('data-current-day', String(toDay('1935-01-15')))
  await page.getByRole('button', { name: '时间演进', exact: true }).click()
  await page.getByRole('slider', { name: '全局历史日期' }).focus()
  await page.keyboard.press('Home')
  await expect(page.locator('.history-detail')).toHaveCount(0)
  await expect(page.locator('.history-map-canvas')).toHaveAttribute('data-visible-segment-ids', 'VIEW-central-1-4')
  await page.getByRole('button', { name: '全部隐藏', exact: true }).click()
  await expect(page.getByText('当前未显示部队')).toBeVisible()
  await expect(page.getByRole('button', { name: '开始历史播放' })).toBeDisabled()
  await expect(page.locator('.history-map-canvas')).toHaveAttribute('data-visible-nodes', '0')
  await page.getByRole('button', { name: '恢复全部部队' }).click()
  await page.locator('.map-mode-switch').getByRole('button', { name: '全程总览', exact: true }).click()
  await selectEvent(page, 'EVT-001')
  const day = await page.locator('.unified-timeline').getAttribute('data-current-day')
  await page.getByRole('checkbox', { name: '显示红一方面军（中央红军）', exact: true }).uncheck()
  await expect(page.locator('.history-detail')).toHaveCount(0)
  await expect(page.locator('.unified-timeline')).toHaveAttribute('data-current-day', day!)
  await page.getByRole('button', { name: '全部隐藏', exact: true }).click()
  await page.getByRole('checkbox', { name: '显示红四方面军', exact: true }).check()
  const shared = featuredEvents.find(e => e.army_ids.includes('central') && e.army_ids.includes('fourth'))!
  await selectEvent(page, shared.id)
  await expect(page.getByRole('checkbox', { name: '显示红一方面军（中央红军）', exact: true })).not.toBeChecked()
  await expect(page.getByRole('checkbox', { name: '显示红四方面军', exact: true })).toBeChecked()
  expect(await page.locator('.history-marker[data-selected="true"]').evaluate(el => (el as HTMLElement).style.getPropertyValue('--army-color'))).toBe(armies.find(a => a.id === 'fourth')!.color)
})

test('地图节点与前后事件均能打开资料，同地域多事件先提供选择', async ({ page }) => {
  await openLocalMap(page)
  await selectEvent(page, 'EVT-002')
  await page.getByRole('button', { name: '关闭事件详情' }).click()
  const cluster = page.locator('.history-marker[data-place-ids="PLC-0025,PLC-0026,PLC-0027"]')
  await cluster.click()
  await expect(page.getByRole('heading', { name: '选择这一地域的事件' })).toBeVisible()
  expect(await page.locator('.history-event-list button').count()).toBeGreaterThanOrEqual(3)
  // Position via the real index, then zoomed regional marker. No forced click through
  // another marker: at overview scale nearby references intentionally share a chooser.
  await selectEvent(page, 'EVT-002')
  await expect.poll(async () => Number(await page.locator('.history-map-canvas').getAttribute('data-zoom'))).toBeGreaterThan(7.3)
  await page.getByRole('button', { name: '关闭事件详情' }).click()
  await page.locator('.history-marker[data-place-ids="PLC-0025,PLC-0026,PLC-0027"]').click()
  await expect(page.getByRole('heading', { name: '选择这一地域的事件' })).toBeVisible()
  await expect(page.locator('.history-event-list button')).toHaveCount(3)
  await page.locator('.history-event-list button').first().click()
  await expect(page.locator('.history-detail')).toBeVisible()
  await page.getByRole('button', { name: '下一个重要事件', exact: true }).click()
  await expect(page.locator('.history-detail')).toBeVisible()
  await expect(page.locator('.unified-timeline')).toHaveAttribute('data-playing', 'false')
})

test('键盘资料入口不离开地图，reduce和Context Lost保持可查阅', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openLocalMap(page)
  const skip = page.getByRole('link', { name: '跳到历史资料索引' })
  await skip.focus(); await skip.press('Enter')
  await expect(page).toHaveURL(/#map$/)
  await expect(page.getByRole('complementary', { name: '历史事件资料' })).toBeFocused()
  await selectEvent(page, 'EVT-125')
  const selected = page.locator('.history-marker[data-selected="true"]')
  expect(await selected.evaluate(el => getComputedStyle(el, '::after').animationName)).toBe('none')
  await page.locator('.history-map-canvas .maplibregl-canvas').evaluate(el => (el as HTMLCanvasElement).getContext('webgl2')!.getExtension('WEBGL_lose_context')!.loseContext())
  await expect(page.locator('.history-map-canvas')).toHaveAttribute('data-map-state', 'unavailable')
  await expect(page.locator('.history-detail')).toBeVisible()
  await page.getByRole('button', { name: '重试地图', exact: true }).click()
  await expect(page.locator('.history-map-canvas')).toHaveAttribute('data-map-state', 'local')
  await expect(page.locator('.history-map-canvas .maplibregl-canvas')).toHaveCount(1)
})

test('本地图片真实解码、放大关闭焦点恢复、来源和未定位资料退出精选索引', async ({ page }) => {
  await openLocalMap(page)
  await selectEvent(page, 'EVT-125')
  await page.getByRole('button', { name: '深入了解' }).click()
  const imageButton = page.locator('.history-archive-dialog .image-enlarge').first()
  await imageButton.scrollIntoViewIfNeeded()
  await expect.poll(() => imageButton.locator('img').evaluate(el => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(100)
  await imageButton.click()
  await expect(page.locator('.history-image-dialog')).toBeVisible()
  await expect(page.getByRole('button', { name: '关闭图片' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.locator('.history-image-dialog')).toHaveCount(0)
  await expect(imageButton).toBeFocused()
  expect(await page.locator('.source-list a').first().getAttribute('href')).toMatch(/^https?:\/\//)
  await page.getByRole('button', { name: '关闭历史档案' }).click()
  await selectEvent(page, 'EVT-001')
  await page.getByRole('button', { name: '深入了解' }).click()
  expect(await page.locator('.document-entry a').count()).toBeGreaterThan(0)
  await page.getByRole('button', { name: '关闭历史档案' }).click()
  await page.getByRole('button', { name: '关闭事件详情' }).click()
  await page.getByRole('searchbox').fill('EVT-004')
  await expect(page.locator('.history-event-list button')).toHaveCount(0)
  expect(events.find(e => e.id === 'EVT-004')).toBeDefined()
})

test('播放倍速、键盘拖动、终点与后台暂停不追赶', async ({ page }) => {
  await openLocalMap(page)
  const timeline = page.locator('.unified-timeline')
  await page.getByRole('button', { name: '开始历史播放' }).click()
  await expect.poll(async () => Number(await timeline.getAttribute('data-current-day'))).toBeGreaterThan(startDay)
  await page.getByRole('combobox', { name: '播放速度' }).selectOption('4')
  await page.getByRole('slider').focus(); await page.keyboard.press('PageUp')
  await expect(timeline).toHaveAttribute('data-playing', 'false')
  await page.keyboard.press('End')
  await expect(timeline).toHaveAttribute('data-current-day', String(endDay))
  await expect(page.getByRole('button', { name: '从起点重播历史' })).toBeVisible()
  await page.getByRole('button', { name: '从起点重播历史' }).click()
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')) })
  await expect(timeline).toHaveAttribute('data-playing', 'false')
  const day = await timeline.getAttribute('data-current-day')
  await page.waitForTimeout(350)
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: false }); document.dispatchEvent(new Event('visibilitychange')) })
  await expect(timeline).toHaveAttribute('data-current-day', day!)
  await expect(timeline).toHaveAttribute('data-playing', 'false')
})

test('鼠标拖动总时间轴、前后事件日期、返回起点与总览完整联动', async ({ page }) => {
  await openLocalMap(page)
  const timeline = page.locator('.unified-timeline')
  const slider = await page.getByRole('slider', { name: '全局历史日期' }).boundingBox()
  await page.getByRole('button', { name: '开始历史播放' }).click()
  await page.mouse.move(slider!.x + slider!.width * .8, slider!.y + slider!.height / 2)
  await page.mouse.down()
  await page.mouse.move(slider!.x + slider!.width * .6, slider!.y + slider!.height / 2, { steps: 8 })
  await page.mouse.up()
  await expect(timeline).toHaveAttribute('data-playing', 'false')
  const dragged = Number(await timeline.getAttribute('data-current-day'))
  expect(dragged).toBeGreaterThan(startDay + (endDay - startDay) * .55)
  expect(dragged).toBeLessThan(startDay + (endDay - startDay) * .65)
  await page.getByRole('button', { name: '返回起点', exact: true }).click()
  await expect(timeline).toHaveAttribute('data-current-day', String(startDay))
  await selectEvent(page, 'EVT-001')
  const important = events.filter(e => e.important && eventDay(e)).sort((a, b) => toDay(eventDay(a)!) - toDay(eventDay(b)!))
  const next = important.find(e => toDay(eventDay(e)!) > toDay('1935-01-15'))!
  await page.getByRole('button', { name: '下一个重要事件', exact: true }).click()
  await expect(timeline).toHaveAttribute('data-current-day', String(toDay(eventDay(next)!)))
  const previous = important.filter(e => toDay(eventDay(e)!) < toDay(eventDay(next)!)).at(-1)!
  await page.getByRole('button', { name: '上一个重要事件', exact: true }).click()
  await expect(timeline).toHaveAttribute('data-current-day', String(toDay(eventDay(previous)!)))
  await timeline.getByRole('button', { name: '全程总览', exact: true }).click()
  await expect(page.locator('.history-map-page')).toHaveAttribute('data-mode', 'overview')
  await expect(page.locator('.history-map-canvas')).toHaveAttribute('data-visible-routes', '81')
})

test('真实地图缩放拖拽、阶段定位和图层切换', async ({ page }) => {
  await openLocalMap(page)
  const map = page.locator('.history-map-canvas')
  const zoom = Number(await map.getAttribute('data-zoom'))
  await page.getByRole('button', { name: '放大地图', exact: true }).click()
  await expect.poll(async () => Number(await map.getAttribute('data-zoom'))).toBeGreaterThan(zoom + .5)
  await page.getByRole('checkbox', { name: '镜头跟随' }).check()
  const center = await map.getAttribute('data-center')
  await page.mouse.move(800, 350); await page.mouse.down(); await page.mouse.move(900, 410, { steps: 12 }); await page.mouse.up()
  await expect(page.getByRole('checkbox', { name: '镜头跟随' })).not.toBeChecked()
  await expect.poll(() => map.getAttribute('data-center')).not.toBe(center)
  await page.getByText('按历史阶段查阅', { exact: true }).click()
  await page.getByRole('button', { name: '金沙江与大渡河', exact: true }).click()
  await expect(page.locator('.history-map-page')).toHaveAttribute('data-mode', 'time')
  await page.getByRole('button', { name: '地图工具', exact: true }).click()
  await page.getByRole('checkbox', { name: '区域方向示意', exact: true }).uncheck()
  await expect(map).toHaveAttribute('data-visible-routes', '0')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: '地图工具', exact: true })).toHaveAttribute('aria-expanded', 'false')
})

test('1440桌面布局、帮助、返回首页保留环境暂停与地图状态', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await expect(page.locator('#home')).toHaveAttribute('data-ambient-state', 'running')
  await page.getByRole('button', { name: '暂停环境动效' }).click()
  await page.getByRole('link', { name: '开启征程', exact: true }).click()
  await expect(page.locator('.unified-timeline')).toHaveCount(1)
  await expect(page.locator('.timeline-lane')).toHaveCount(0)
  await selectEvent(page, 'EVT-125')
  const day = await page.locator('.unified-timeline').getAttribute('data-current-day')
  await page.getByRole('button', { name: '地图工具', exact: true }).click()
  await page.getByRole('button', { name: '使用说明' }).click()
  await expect(page.getByRole('dialog')).toBeVisible(); await page.keyboard.press('Escape')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: `output/playwright/map/${testInfo.project.name}-1440-detail.png` })
  await page.getByRole('navigation', { name: '地图导航' }).getByRole('link', { name: '首页', exact: true }).click()
  await expect(page.locator('#home')).toHaveAttribute('data-ambient-state', 'paused')
  await expect(page.locator('#home')).toBeFocused()
  await page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name: '时空长征' }).click()
  await expect(page.locator('.unified-timeline')).toHaveAttribute('data-current-day', day!)
  await expect(page.locator('.history-map-canvas .maplibregl-canvas')).toHaveCount(1)
  await expect(page.locator('.unified-timeline')).toHaveAttribute('data-playing', 'false')
})

test('没有WebGL时明确报错，历史资料仍可查阅', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...args: Parameters<typeof original>) {
      return String(args[0]).startsWith('webgl') ? null : original.apply(this, args)
    } as typeof original
  })
  await page.goto('/#map')
  await expect(page.locator('.history-map-canvas')).toHaveAttribute('data-map-state', 'unavailable')
  await selectEvent(page, 'EVT-125')
  await expect(page.locator('.history-detail')).toBeVisible()
})

test('档案地图视野、紧凑布局、单一时间轴、配色、独立勾选、滚轮与全屏', async ({ page }) => {
  await openLocalMap(page)
  await expect(page.locator('.unified-timeline')).toHaveCount(1)
  await expect(page.locator('.timeline-lane, .timeline-lanes')).toHaveCount(0)
  await expect(page.getByRole('slider', { name: '全局历史日期' })).toHaveCount(1)
  await expect(page.locator('.timeline-event')).toHaveCount(0)
  await expect(page.locator('.history-event-list button')).toHaveCount(38)
  await expect(page.getByRole('button', { name: /突出|单独查看/ })).toHaveCount(0)
  const map = page.locator('.history-map-canvas')
  const box = await map.boundingBox(), left = await page.locator('.map-controls').boundingBox(), right = await page.locator('.history-panel').boundingBox()
  expect(box!.x).toBeGreaterThan(left!.x + left!.width)
  expect(box!.x + box!.width).toBeLessThan(right!.x)
  expect(left!.width).toBeLessThanOrEqual(180)
  expect(right!.width).toBeLessThanOrEqual(250)
  expect((await page.locator('.unified-timeline').boundingBox())!.height).toBeLessThanOrEqual(100)
  const viewport = page.viewportSize()!
  expect(box!.width * box!.height / (viewport.width * viewport.height)).toBeGreaterThan(.5)
  await expect(map).toHaveAttribute('data-terrain-state', 'disabled')
  await expect(map).toHaveAttribute('data-route-chains', '17')
  const bounds = (await map.getAttribute('data-bounds'))!.split(',').map(Number)
  expect(bounds[0]!).toBeGreaterThan(80)
  expect(bounds[2]!).toBeLessThan(130)
  for (const segment of displayDirections) for (const [lng, lat] of segment.geometry.coordinates) {
    expect(lng).toBeGreaterThanOrEqual(bounds[0]!); expect(lng).toBeLessThanOrEqual(bounds[2]!)
    expect(lat).toBeGreaterThanOrEqual(bounds[1]!); expect(lat).toBeLessThanOrEqual(bounds[3]!)
  }
  for (const army of armies) {
    const row = page.locator('.army-control').filter({ has: page.getByRole('checkbox', { name: '显示' + army.name, exact: true }) })
    expect(await row.evaluate(el => (el as HTMLElement).style.getPropertyValue('--army-color'))).toBe(army.color)
  }
  const originalZoom = Number(await map.getAttribute('data-zoom'))
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2)
  await page.mouse.wheel(0, -500)
  await expect.poll(async () => Number(await map.getAttribute('data-zoom'))).toBeGreaterThan(originalZoom + .3)
  for (const army of armies.filter(a => a.id !== 'fourth')) await page.getByRole('checkbox', { name: '显示' + army.name, exact: true }).uncheck()
  await expect(page.getByRole('checkbox', { name: '显示红四方面军', exact: true })).toBeChecked()
  expect(await page.locator('.army-control input:checked').count()).toBe(1)
  await expect(map).toHaveAttribute('data-visible-routes', '20')
  await expect(map).toHaveAttribute('data-route-chains', '9')
  await page.getByRole('button', { name: '全屏', exact: true }).click()
  await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(true)
  await page.getByRole('button', { name: '退出全屏', exact: true }).click()
  await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(false)
})
