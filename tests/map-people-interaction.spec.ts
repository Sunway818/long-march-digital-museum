import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const evidence = 'output/playwright/map-people'

function collectErrors(page: Page) {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  return errors
}

for (const [width, height] of [[1440, 900], [844, 390]]) {
  test.describe(`${width} × ${height}`, () => {
    test.use({ viewport: { width, height }, isMobile: width < 1000, hasTouch: width < 1000 })

    test('地图章节导航、图层、说明、全屏和返回状态', async ({ page }, info) => {
      const errors = collectErrors(page)
      await page.goto('/#map')
      const header = page.locator('.map-topbar')
      const links = page.getByRole('navigation', { name: '地图导航' }).getByRole('link')
      const map = page.locator('.history-map-canvas')
      const timeline = page.locator('.unified-timeline')
      await expect(map).toHaveAttribute('data-map-state', 'local')
      await expect(links).toHaveText(['首页', '时空长征', '英雄人物', '精神传承'])
      await expect(links.nth(1)).toHaveAttribute('aria-current', 'page')
      await page.evaluate(() => document.fonts.ready)
      expect(await header.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true)
      for (const control of await header.locator('nav a, .map-tools-trigger, .map-fullscreen').all()) {
        await expect(control).toBeInViewport({ ratio: .98 })
        expect((await control.boundingBox())!.height).toBeGreaterThanOrEqual(44)
      }

      const day = await timeline.getAttribute('data-current-day')
      if (info.project.name.startsWith('chrome')) await page.screenshot({ path: `${evidence}/after-map-${width}.png` })
      const tools = page.getByRole('button', { name: '地图工具' })
      if (width < 1000) await tools.tap()
      else await tools.press('Space')
      const directions = page.getByRole('checkbox', { name: '区域方向示意', exact: true })
      const labels = page.getByRole('checkbox', { name: '历史地点标签', exact: true })
      await expect(directions).toBeChecked()
      await expect(labels).toBeChecked()
      if (info.project.name.startsWith('chrome')) await page.screenshot({ path: `${evidence}/after-tools-${width}.png` })
      await directions.uncheck()
      await expect(map).toHaveAttribute('data-visible-routes', '0')
      await labels.uncheck()
      await page.keyboard.press('Escape')
      await expect(tools).toBeFocused()
      await expect(tools).toHaveAttribute('aria-expanded', 'false')
      await tools.click()
      await expect(labels).not.toBeChecked()
      await page.getByRole('button', { name: '使用说明' }).click()
      const dialog = page.getByRole('dialog', { name: '如何阅读这幅地图' })
      await expect(dialog).toBeVisible()
      await page.keyboard.press('Escape')
      await expect(dialog).toBeHidden()
      await expect(tools).toBeFocused()
      await tools.click()
      await header.getByRole('heading').click()
      await expect(tools).toHaveAttribute('aria-expanded', 'false')

      await page.getByRole('button', { name: '全屏', exact: true }).click()
      await expect(page.getByRole('button', { name: '退出全屏', exact: true })).toHaveAttribute('aria-pressed', 'true')
      await page.getByRole('button', { name: '退出全屏', exact: true }).click()
      await expect(page.getByRole('button', { name: '全屏', exact: true })).toHaveAttribute('aria-pressed', 'false')
      await links.nth(2).click()
      await expect(page.locator('.people-memorial')).toBeVisible()
      await page.getByRole('link', { name: '时空长征', exact: true }).click()
      await expect(timeline).toHaveAttribute('data-current-day', day!)
      await expect(map).toHaveAttribute('data-visible-routes', '0')
      await links.nth(3).click()
      await expect(page.locator('.legacy-page')).toBeVisible()
      await page.goBack()
      await links.nth(0).click()
      await expect(page.locator('#home')).toBeVisible()
      await page.goBack()
      await expect(map).toHaveAttribute('data-map-state', 'local')
      await expect(map.locator('canvas')).toHaveCount(1)
      expect(errors).toEqual([])
    })

    test('人物馆入场重播与肖像双向滚动', async ({ page }, info) => {
      test.setTimeout(45_000)
      const errors = collectErrors(page)
      await page.goto('/#people')
      const people = page.locator('.people-memorial')
      const heading = people.locator('.people-gallery-heading')
      const scroller = people.locator('.people-scroll')
      const cards = people.locator('.people-portrait')
      await expect(people).toHaveAttribute('data-intro', 'playing')
      await expect(heading).toHaveCSS('opacity', '0')
      await expect(people).toHaveAttribute('data-intro', 'done')
      await expect(cards).toHaveCount(16)
      await page.evaluate(() => document.fonts.ready)
      if (info.project.name.startsWith('chrome')) await page.screenshot({ path: `${evidence}/after-people-${width}.png` })

      const revealInfo = (index: number) => cards.nth(index).locator('.people-portrait-motion').evaluate(element =>
        element.getAnimations().flatMap(animation => animation.effect instanceof KeyframeEffect
          ? animation.effect.getKeyframes().slice(0, 1).map(frame => ({ transform: frame.transform, opacity: frame.opacity, delay: animation.effect!.getTiming().delay }))
          : []))
      const scrollTo = (bottom: boolean) => scroller.evaluate((element, end) => element.scrollTo({ top: end ? element.scrollHeight : 0, behavior: 'instant' }), bottom)
      const photoOpacity = (index: number) => cards.nth(index).locator('.people-portrait-motion').evaluate(element => Number(getComputedStyle(element).opacity))
      const wallGeometry = () => scroller.evaluate(element => [...element.querySelectorAll('.people-portrait')].map(card => Math.round(card.getBoundingClientRect().top + element.scrollTop)))
      const startingGeometry = await wallGeometry()
      for (let round = 0; round < 2; round++) {
        await scrollTo(true)
        await expect.poll(() => revealInfo(12)).toEqual([{ transform: 'translateY(22px)', opacity: '0', delay: 0 }])
        await expect.poll(() => revealInfo(13)).toEqual([{ transform: 'translateY(22px)', opacity: '0', delay: 90 }])
        await expect(cards.nth(13).locator('.people-portrait-light')).toHaveCSS('overflow', 'clip')
        if (!round) {
          await expect.poll(() => photoOpacity(12)).toBeGreaterThan(.44)
          await page.screenshot({ path: `${evidence}/${info.project.name}-scroll-down-${width}.png` })
        }
        await expect.poll(() => revealInfo(15)).toEqual([])
        await scrollTo(false)
        await expect.poll(() => revealInfo(0)).toEqual([{ transform: 'translateY(-22px)', opacity: '0', delay: 0 }])
        if (!round) {
          await expect.poll(() => photoOpacity(0)).toBeGreaterThan(.44)
          await page.screenshot({ path: `${evidence}/${info.project.name}-scroll-up-${width}.png` })
        }
        await expect.poll(() => revealInfo(3)).toEqual([])
        expect(await wallGeometry()).toEqual(startingGeometry)
      }

      await cards.first().click()
      await expect(page.locator('.person-archive h1')).toHaveText('毛泽东')
      await page.getByRole('button', { name: '关闭档案 ×' }).click()
      await expect(people).toHaveAttribute('data-transition', 'idle')
      await expect(people).toHaveAttribute('data-intro', 'done')
      await people.getByRole('link', { name: '精神传承', exact: true }).click()
      const legacy = page.getByRole('navigation', { name: '精神传承导航' })
      await legacy.getByRole('link', { name: '英雄人物', exact: true }).click()
      await expect(people).toHaveAttribute('data-intro', 'playing')
      await page.screenshot({ path: `${evidence}/${info.project.name}-reentry-${width}.png` })
      await page.goBack()
      await expect(people).toBeHidden()
      await page.goForward()
      await expect(people).toHaveAttribute('data-intro', 'playing')
      await expect(cards.first()).toHaveCSS('opacity', '1')
      await page.screenshot({ path: `${evidence}/${info.project.name}-reentry-wall-${width}.png` })
      await expect(people).toHaveAttribute('data-intro', 'done')
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await scrollTo(true)
      await expect(cards.nth(12).locator('.people-portrait-motion')).toHaveCSS('opacity', '1')
      expect(await revealInfo(12)).toEqual([])
      await page.goBack()
      await expect(people).toBeHidden()
      await page.goForward()
      await expect(people).toHaveAttribute('data-intro', 'done')
      expect(errors).toEqual([])
    })
  })
}
