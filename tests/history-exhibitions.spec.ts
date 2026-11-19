import { test, expect, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { chishuiDraft, campaignBindings, campaignAftermath } from '../src/features/history-map/campaignContent'
import { campaignRoutes } from '../src/features/history-map/CampaignRouteMap'
import { exhibitionDefinitions, migratedEventIds } from '../src/features/history-map/exhibitionDefinitions'
import { archiveImages, exhibitionImages } from '../src/features/history-map/archiveContent'
import { eventById, sources } from '../src/features/history-map/data'
import { eventDay, toDay } from '../src/features/history-map/model'

async function select(page: Page, id: string) {
  const close = page.getByRole('button', { name: '关闭事件详情' })
  if (await close.isVisible()) await close.click()
  await page.getByRole('searchbox').fill(id)
  await page.locator('.history-event-list button').click()
  await expect(page.locator('.history-detail')).toHaveAttribute('data-event-id', id)
}
async function openCampaign(page: Page) {
  await select(page, 'EVT-023')
  await page.getByRole('button', { name: '阅读四渡赤水完整专题' }).click()
  await expect(page.getByRole('article', { name: '四渡赤水完整专题' })).toBeVisible()
}

test('用户64段原文完整保留，四渡独立事件及方向与后续行动分开', () => {
  const source = readFileSync('docs/history/CHISHUI_USER_NARRATIVE.md', 'utf8')
  const original = source.split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('#') && !l.startsWith('来源：') && l !== '---' && !/^\*\*(1935|时间：|本站解读)/.test(l)).map(l => l.replaceAll('**', ''))
  const parsed = chishuiDraft.scenes.flatMap(s => [...s.paragraphs, ...s.interpretation].map(p => p.text))
  expect(original).toHaveLength(64)
  expect(parsed).toEqual(original)
  expect(chishuiDraft.status).toBe('draft')
  expect(chishuiDraft.reviewStatus).toBe('pending')
  expect(chishuiDraft.scenes.map(s => s.id)).toEqual(['prologue','first','second','third','fourth','epilogue'])
  for (const scene of chishuiDraft.scenes.filter(s => campaignBindings[s.id].eventId)) {
    const id = campaignBindings[scene.id].eventId!
    expect(exhibitionDefinitions[id]!.sections.flatMap(s => s.paragraphs)).toEqual([...scene.paragraphs, ...scene.interpretation].map(p => p.text))
  }
  const direction = (id: string) => { const p = campaignRoutes.find(r => r.id === id)!.geometry.coordinates; return p.at(-1)![0] - p[0]![0] }
  expect(direction('VIEW-central-22-25')).toBeLessThan(0)
  expect(direction('VIEW-central-25-28')).toBeGreaterThan(0)
  expect(direction('VIEW-central-20-33')).toBeLessThan(0)
  expect(direction('VIEW-central-34-36')).toBeGreaterThan(0)
  expect(campaignBindings.fourth.routeIds).not.toContain('VIEW-central-33-34')
  expect(campaignAftermath.map(a => a.eventId)).toEqual(['EVT-035','EVT-042'])
  expect(new Set(Object.values(campaignBindings).map(b => b.eventId).filter(Boolean)).size).toBe(4)
  for (const b of Object.values(campaignBindings)) expect(b.sourceIds.every(id => sources.some(s => s.id === id))).toBe(true)
})

test('12个迁移节点可追溯，争议影像与不同日期通电不误用', () => {
  expect(migratedEventIds).toHaveLength(12)
  expect(new Set(sources.map(s => s.id)).size).toBe(sources.length)
  for (const id of migratedEventIds) {
    expect(eventById.has(id)).toBe(true)
    const definition = exhibitionDefinitions[id]!
    expect(definition.sections.some(s => s.interpretation)).toBe(true)
    for (const section of definition.sections) {
      expect(section.paragraphs.length).toBeGreaterThan(0)
      expect(section.locator).toBeTruthy()
      expect(section.sourceIds.every(sid => sources.some(s => s.id === sid))).toBe(true)
    }
    expect(exhibitionImages(eventById.get(id)!, false)).toHaveLength(0)
  }
  expect(archiveImages(eventById.get('EVT-077')!).some(i => i.id === 'AST-0052')).toBe(true)
  expect(exhibitionImages(eventById.get('EVT-077')!, true)).toHaveLength(0)
  expect(exhibitionImages(eventById.get('EVT-051')!, true).map(i => i.id)).toEqual(['AST-0080'])
  expect(exhibitionImages(eventById.get('EVT-001')!, true).map(i => i.id)).not.toContain('AST-0011')
})

test('四渡专题完整阅读与章节地图联动，普通关闭不改变后台地图', async ({ page }, info) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/#map')
  await expect(page.locator('.history-map-canvas')).toHaveAttribute('data-map-state', 'local')
  await select(page, 'EVT-023')
  await page.waitForTimeout(900)
  const map = page.locator('.history-map-canvas'), timeline = page.locator('.unified-timeline')
  const before = { center: await map.getAttribute('data-center'), zoom: await map.getAttribute('data-zoom'), day: await timeline.getAttribute('data-current-day'), armies: await page.locator('.army-control input').evaluateAll(inputs => inputs.map(i => (i as HTMLInputElement).checked)) }
  const canvas = await page.locator('.maplibregl-canvas').elementHandle()
  await page.getByRole('button', { name: '阅读四渡赤水完整专题' }).click()
  const article = page.getByRole('article', { name: '四渡赤水完整专题' })
  await expect(article.getByRole('heading', { name: '四渡赤水', exact: true })).toBeVisible()
  await expect(article.locator('.campaign-scene .exhibit-prose p')).toHaveCount(64)
  for (const p of chishuiDraft.scenes.flatMap(s => [...s.paragraphs, ...s.interpretation])) await expect(article.getByText(p.text, { exact: true }).first()).toBeAttached()
  await expect(article.locator('.campaign-chapter-nav button')).toHaveCount(6)
  await expect(article.locator('.archive-sources')).not.toHaveAttribute('open', '')
  await page.evaluate(() => document.fonts.ready)
  await expect.poll(() => article.locator('.exhibit-opening-image img').evaluate(el => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(100)
  await page.screenshot({ path: `output/playwright/exhibitions/${info.project.name}-campaign-opening.png` })
  for (const id of ['first','second','third','fourth'] as const) {
    await article.locator('.campaign-chapter-nav').getByRole('button', { name: campaignBindings[id].label, exact: true }).click()
    await expect(article.locator('.campaign-route-map')).toHaveAttribute('data-scene', id)
    await expect(article.locator('.campaign-route-map')).toHaveAttribute('data-direction', campaignBindings[id].direction)
    await expect(article.locator('.campaign-route-map path[data-highlighted=true]')).toHaveCount(campaignBindings[id].routeIds.length)
    await expect(timeline).toHaveAttribute('data-current-day', before.day!)
    if (id === 'second' || id === 'fourth') await page.screenshot({ path: `output/playwright/exhibitions/${info.project.name}-campaign-${id}.png` })
  }
  await expect(article.getByRole('region', { name: '四渡之后的战略行动' })).toContainText('不计入四次赤水渡河')
  await article.locator('.campaign-chapter-nav').getByRole('button', { name: '终章', exact: true }).click()
  await expect(article.locator('.campaign-route-map')).toHaveAttribute('data-scene', 'epilogue')
  await expect(article.locator('path[data-highlighted=true][data-aftermath=true]')).toHaveCount(1)
  await page.screenshot({ path: `output/playwright/exhibitions/${info.project.name}-campaign-epilogue.png` })
  await page.getByRole('button', { name: '关闭历史档案' }).click()
  await expect(page.getByRole('button', { name: '阅读四渡赤水完整专题' })).toBeFocused()
  expect(await map.getAttribute('data-center')).toBe(before.center)
  expect(await map.getAttribute('data-zoom')).toBe(before.zoom)
  expect(await timeline.getAttribute('data-current-day')).toBe(before.day)
  expect(await page.locator('.army-control input').evaluateAll(inputs => inputs.map(i => (i as HTMLInputElement).checked))).toEqual(before.armies)
  expect(await page.locator('.maplibregl-canvas').evaluate((el, previous) => el === previous, canvas)).toBe(true)
  expect(errors).toEqual([])
})

test('专题明确点击才调后台日期，四渡、乌江和金沙江保持独立事件', async ({ page }) => {
  test.setTimeout(45_000)
  await page.goto('/#map')
  await expect(page.locator('.history-map-canvas')).toHaveAttribute('data-map-state', 'local')
  for (const [label,id] of [['在长征地图中查看四渡','EVT-034'], ['在长征地图中查看南渡乌江','EVT-035'], ['在长征地图中查看巧渡金沙江','EVT-042']]) {
    await openCampaign(page)
    await page.getByRole('button', { name: label!, exact: true }).click()
    await expect(page.locator('.history-archive-dialog')).toHaveCount(0)
    await expect(page.locator('.history-detail')).toHaveAttribute('data-event-id', id!)
    await expect(page.locator('.unified-timeline')).toHaveAttribute('data-current-day', String(toDay(eventDay(eventById.get(id!)!)!)))
  }
  await expect(page.locator('.maplibregl-canvas')).toHaveCount(1)
})

test('重点节点按类型迁移且原始文献来源保留', async ({ page }, info) => {
  test.setTimeout(90_000)
  await page.goto('/#map')
  await expect(page.locator('.history-map-canvas')).toHaveAttribute('data-map-state', 'local')
  await page.locator('.exhibition-catalogue summary').click()
  await expect(page.locator('.exhibition-catalogue button')).toHaveCount(12)
  for (const id of migratedEventIds) {
    await select(page, id)
    await page.getByRole('button', { name: '深入了解' }).click()
    const archive = page.locator('.history-archive-dialog')
    await expect(archive.getByRole('heading', { name: exhibitionDefinitions[id]!.title, exact: true })).toBeVisible()
    await expect(archive.locator('.event-exhibition')).toHaveAttribute('data-kind', exhibitionDefinitions[id]!.kind)
    await expect(archive.locator('.exhibit-analysis')).toBeAttached()
    await expect(archive.locator('.archive-sources')).not.toHaveAttribute('open', '')
    const hero = archive.locator('.exhibit-opening-image img')
    if (await hero.count()) await expect.poll(() => hero.evaluate(el => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(100)
    if (['EVT-001','EVT-042','EVT-049','EVT-077'].includes(id)) await page.screenshot({ path: `output/playwright/exhibitions/${info.project.name}-${id}.png` })
    await archive.locator('.archive-sources summary').first().click()
    expect(await archive.locator('.archive-sources a').count()).toBeGreaterThan(0)
    await page.getByRole('button', { name: '关闭历史档案' }).click()
  }
  await expect(page.locator('.maplibregl-canvas')).toHaveCount(1)
})

test('专题缩窗与减少动态效果可阅读，正式门槛不被专题入口绕过', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 650 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/?review=0#map')
  await page.getByRole('group', { name: '地图资料面板' }).getByRole('button', { name: '历史资料', exact: true }).click()
  await openCampaign(page)
  expect(await page.locator('.chishui-campaign .exhibit-image').count()).toBeGreaterThan(0)
  await expect(page.locator('.campaign-reading-layout')).toHaveCount(1)
  await expect(page.locator('.exhibit-review-label')).toHaveCount(0)
  await page.keyboard.press('Escape')
  await page.goto('/?review=1#map')
  await page.getByRole('group', { name: '地图资料面板' }).getByRole('button', { name: '历史资料', exact: true }).click()
  await openCampaign(page)
  await page.locator('.campaign-chapter-nav').getByRole('button', { name: '二渡', exact: true }).click()
  await expect(page.locator('.campaign-route-map')).toHaveAttribute('data-scene', 'second')
  const scroll = page.locator('.archive-scroll')
  expect(await scroll.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true)
  const image = page.locator('.campaign-scene-second .exhibit-image-open').first()
  await image.click()
  await expect(page.locator('.history-image-dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.locator('.history-archive-dialog')).toBeVisible()
  await expect(image).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.locator('.history-archive-dialog')).toHaveCount(0)
})
