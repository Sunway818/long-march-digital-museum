import { expect, test } from '@playwright/test'
import { toDay } from '../src/features/history-map/model'

test.use({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 })

test('连续双指缩放锚定中点，松手不续缩，单指平移与播放筛选互不阻塞', async ({ page, context }) => {
  test.setTimeout(60_000)
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/#map')
  const map = page.locator('.history-map-canvas'), timeline = page.locator('.unified-timeline')
  await expect(map).toHaveAttribute('data-map-state', 'local')
  await expect(map).toHaveAttribute('data-label-level', 'overview')
  const box = (await map.boundingBox())!
  const cdp = await context.newCDPSession(page)
  const marker = page.locator('.history-marker[data-event-ids="EVT-072"]')
  await expect(marker).toBeVisible()
  const point = async () => {
    const bounds = (await marker.boundingBox())!
    return { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 }
  }
  const anchor = await point()
  const x = Math.min(box.x + box.width - 103, Math.max(box.x + 103, anchor.x + 12))
  const y = Math.min(box.y + box.height - 27, Math.max(box.y + 55, anchor.y))
  const zoom = async () => Number(await map.getAttribute('data-zoom'))
  const touch = (type: 'touchStart' | 'touchMove' | 'touchEnd', points: [number, number][]) =>
    cdp.send('Input.dispatchTouchEvent', { type, touchPoints: points.map(([px, py], index) => ({ x: px, y: py, id: index + 1 })) })
  const pinch = async (from: number, to: number, during?: () => Promise<void>) => {
    const fingers = (spread: number): [number, number][] => [[x - spread, y], [x + spread, y]]
    await touch('touchStart', fingers(from))
    const samples = [await zoom()]
    for (let frame = 1; frame <= 12; frame++) {
      await touch('touchMove', fingers(from + (to - from) * frame / 12))
      samples.push(await zoom())
      if (frame === 6) await during?.()
    }
    const target = samples[0]! + Math.log2(to / from)
    await expect.poll(async () => Math.abs(await zoom() - target)).toBeLessThan(.09)
    for (let index = 1; index < samples.length; index++) {
      expect((samples[index]! - samples[index - 1]!) * Math.sign(to - from)).toBeGreaterThanOrEqual(-.005)
    }
    const released = await zoom()
    await touch('touchEnd', [])
    await page.waitForTimeout(350)
    expect(Math.abs(await zoom() - released)).toBeLessThan(.02)
  }

  const initialZoom = await zoom()
  const originalRoutes = await map.getAttribute('data-visible-segment-ids')
  const initialDay = await timeline.getAttribute('data-current-day')
  await pinch(32, 85)
  const actual = await point(), scale = 2 ** (await zoom() - initialZoom)
  expect(Math.hypot(actual.x - (x + (anchor.x - x) * scale), actual.y - (y + (anchor.y - y) * scale))).toBeLessThan(4)
  await expect(map).toHaveAttribute('data-visible-segment-ids', originalRoutes!)
  await pinch(85, 32)
  await pinch(35, 88)
  await pinch(88, 40)
  expect(Math.abs(await zoom() - initialZoom - Math.log2(40 / 35))).toBeLessThan(.16)
  await expect(timeline).toHaveAttribute('data-current-day', initialDay!)

  const beforePan = await map.getAttribute('data-center')
  await touch('touchStart', [[x, y]])
  for (let frame = 1; frame <= 12; frame++) await touch('touchMove', [[x - frame * 4, y + frame * 2]])
  await expect.poll(() => map.getAttribute('data-center')).not.toBe(beforePan)
  await touch('touchEnd', [])

  const candidate = await page.locator('.history-marker').evaluateAll(elements => elements.findIndex(element => {
    const rect = element.getBoundingClientRect()
    const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)
    return hit?.closest('.history-marker') === element && element.getAttribute('data-event-ids')?.split(',').length === 1
  }))
  expect(candidate).toBeGreaterThanOrEqual(0)
  await page.locator('.history-marker').nth(candidate).tap()
  await expect(page.getByRole('button', { name: '深入了解' })).toBeVisible()
  await page.getByRole('button', { name: '收起资料面板' }).tap()
  await page.getByRole('slider', { name: '全局历史日期' }).fill(String(toDay('1935-05-03')))
  await page.getByRole('button', { name: '开始历史播放' }).tap()
  const playDay = Number(await timeline.getAttribute('data-current-day'))
  const beforeFilter = await map.getAttribute('data-visible-segment-ids')
  expect(beforeFilter).toContain('VIEW-central-')
  await pinch(34, 62, async () => {
    // Exercise a UI change with the two fingers still down.
    await page.locator('.army-control input').first().evaluate(input => (input as HTMLInputElement).click())
    await expect(map).not.toHaveAttribute('data-visible-segment-ids', /VIEW-central-/)
  })
  await expect(timeline).toHaveAttribute('data-playing', 'true')
  expect(Number(await timeline.getAttribute('data-current-day'))).toBeGreaterThan(playDay)
  expect((await map.getAttribute('data-visible-segment-ids'))?.includes('VIEW-central-')).toBe(false)
  await page.getByRole('button', { name: '暂停历史播放' }).tap()
  await expect(timeline).toHaveAttribute('data-playing', 'false')
  await page.getByRole('button', { name: '重置视野' }).tap()
  await expect(map).toHaveAttribute('data-label-level', 'overview')
  expect(await page.evaluate(() => scrollY)).toBe(0)
  expect(errors).toEqual([])
})
