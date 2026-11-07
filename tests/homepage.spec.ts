import { expect, test } from '@playwright/test'

test('首页画面、真实字体、桌面构图与滚动转场', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  await expect(page.getByRole('link', { name: '开启征程', exact: true })).toBeVisible()
  await expect.poll(() => page.locator('h1').evaluate(el => getComputedStyle(el).opacity)).toBe('1')
  const metrics = await page.evaluate(() => ({
    image: document.querySelector<HTMLImageElement>('.hero-image')?.naturalWidth,
    fonts: ['ZhiMang', 'Source Han Serif SC', 'Source Han Sans SC'].map(name => document.fonts.check(`16px "${name}"`)),
    titleLeft: document.querySelector('h1')!.getBoundingClientRect().left / innerWidth,
    overflow: document.documentElement.scrollWidth > innerWidth,
  }))
  expect(metrics.image).toBe(1672)
  expect(metrics.fonts).toEqual([true, true, true])
  expect(metrics.titleLeft).toBeGreaterThan(0.55)
  expect(metrics.overflow).toBe(false)
  await page.mouse.wheel(0, 300)
  await expect.poll(() => page.locator('.hero-content').evaluate(el => Number(getComputedStyle(el).opacity))).toBeLessThan(0.95)
  await page.getByRole('link', { name: '开启征程', exact: true }).click()
  await expect(page.locator('#entrance')).toBeFocused()
  await expect(page.getByText('此处为展馆入口占位区域。', { exact: false })).toBeVisible()
  expect(errors).toEqual([])
})

test('全部导航、章节占位选择与返回', async ({ page }) => {
  await page.goto('/')
  const chapters = ['时空长征', '英雄人物', '精神传承']
  await expect(page.getByRole('navigation').getByRole('link')).toHaveText(['首页', ...chapters])
  await expect(page.locator('.chapter-links button')).toHaveCount(3)
  for (const name of chapters) {
    await page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name, exact: true }).click()
    await expect(page.locator('.chapter-status')).toContainText(`${name}正在筹备`)
    await expect(page.getByRole('button', { name: `${name} 待开放` })).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByRole('navigation').getByRole('link', { name, exact: true })).toHaveAttribute('aria-current', 'location')
  }
  for (const name of chapters) {
    await page.getByRole('button', { name: `${name} 待开放` }).click()
    await expect(page.locator('.chapter-status')).toContainText(`${name}正在筹备`)
  }
  await page.getByRole('link', { name: '返回序章' }).click()
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(5)
  await page.getByRole('link', { name: '向下探索' }).click()
  await expect(page.locator('#entrance')).toBeFocused()
  await page.getByRole('navigation').getByRole('link', { name: '首页', exact: true }).click()
  await expect(page.locator('#home')).toBeFocused()
})

test('影像说明支持键盘关闭、焦点恢复与关闭按钮', async ({ page }) => {
  await page.goto('/')
  const source = page.getByRole('button', { name: '影像说明' })
  await source.click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('dialog')).toContainText('不是真实历史档案照片')
  await expect(page.getByRole('button', { name: '关闭说明' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await expect(source).toBeFocused()
  await source.press('Enter')
  await page.getByRole('button', { name: '关闭说明' }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
})

test('减少动态效果、图片失败与缩窗仍可操作', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.route('**/*.png', route => route.abort())
  await page.goto('/')
  await expect(page.getByText('首页影像暂未加载，仍可进入展馆入口。')).toBeVisible()
  await expect(page.getByRole('button', { name: '跳过片头' })).toHaveCount(0)
  await page.getByRole('link', { name: '开启征程', exact: true }).click()
  await expect(page.locator('#entrance')).toBeFocused()
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(500)
  await page.setViewportSize({ width: 800, height: 600 })
  await page.getByRole('link', { name: '返回序章' }).click()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await expect(page.getByRole('link', { name: '开启征程', exact: true })).toBeVisible()
})

test('片头保持短入场且完全没有跳过按钮', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: '跳过片头' })).toHaveCount(0)
  await expect(page.locator('.skip-intro')).toHaveCount(0)
  await expect(page.getByRole('navigation')).toBeVisible()
  await page.getByRole('link', { name: '开启征程', exact: true }).click()
  await expect(page.locator('#entrance')).toBeFocused()
})

test('待开放章节深链接刷新保持真实入口状态', async ({ page }) => {
  await page.goto('/#entrance-journey')
  await expect(page.locator('.chapter-status')).toContainText('时空长征正在筹备')
  await expect(page.locator('#entrance')).toBeFocused()
  await page.reload()
  await expect(page.getByRole('button', { name: '时空长征 待开放' })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('#entrance')).toBeFocused()
  await page.getByRole('button', { name: '英雄人物 待开放' }).click()
  await page.reload()
  await expect(page.locator('.chapter-status')).toContainText('英雄人物正在筹备')
  await page.getByRole('link', { name: '返回序章' }).click()
  await expect(page).toHaveURL(/#home$/)
  await page.reload()
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(5)
})

test('两个旧独立入口归并到时空长征，且无旧导航残留', async ({ page }) => {
  for (const retired of ['timeline', 'moments']) {
    await page.goto(`/#entrance-${retired}`)
    await expect(page).toHaveURL(/#entrance-journey$/)
    await expect(page.locator('.chapter-status')).toContainText('时空长征正在筹备')
    await expect(page.locator('a[href="#entrance-timeline"],a[href="#entrance-moments"]')).toHaveCount(0)
  }
})

test('环境动效可暂停、离屏暂停、返回恢复并支持动态降级', async ({ page }) => {
  await page.goto('/')
  const hero = page.locator('#home')
  await expect(hero).toHaveAttribute('data-ambient-state', 'running')
  const pause = page.getByRole('button', { name: '暂停环境动效' })
  await pause.click()
  await expect(hero).toHaveAttribute('data-ambient-state', 'paused')
  const still = await page.locator('.ambient-sun').evaluate(el => getComputedStyle(el).opacity)
  await page.waitForTimeout(400)
  expect(await page.locator('.ambient-sun').evaluate(el => getComputedStyle(el).opacity)).toBe(still)
  await page.getByRole('button', { name: '播放环境动效' }).click()
  await expect(hero).toHaveAttribute('data-ambient-state', 'running')
  await page.getByRole('link', { name: '开启征程', exact: true }).click()
  await expect(hero).toHaveAttribute('data-ambient-state', 'offscreen')
  await page.getByRole('link', { name: '返回序章' }).click()
  await expect(hero).toHaveAttribute('data-ambient-state', 'running')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(hero).toHaveAttribute('data-ambient-state', 'reduced')
  await expect(page.locator('.ambient-scene')).toBeHidden()
  await expect(page.locator('.ambient-atmosphere')).toBeHidden()
  await expect(pause).toBeHidden()
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await expect(hero).toHaveAttribute('data-ambient-state', 'running')
})

test('后台可见性分支暂停且返回时尊重手动暂停选择', async ({ page }) => {
  await page.goto('/')
  const hero = page.locator('#home')
  await expect(hero).toHaveAttribute('data-ambient-state', 'running')
  // Explicit branch simulation; actual browser-tab switching is recorded separately.
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')) })
  await expect(hero).toHaveAttribute('data-ambient-state', 'background')
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: false }); document.dispatchEvent(new Event('visibilitychange')) })
  await expect(hero).toHaveAttribute('data-ambient-state', 'running')
  await page.getByRole('button', { name: '暂停环境动效' }).click()
  await page.getByRole('link', { name: '开启征程', exact: true }).click()
  await expect(hero).toHaveAttribute('data-ambient-state', 'offscreen')
  await page.getByRole('link', { name: '返回序章' }).click()
  await expect(hero).toHaveAttribute('data-ambient-state', 'paused')
})

test('朝阳存在明确亮暗周期，云雾纹理实际漂移且标题稳定', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#home')).toHaveAttribute('data-ambient-state', 'running')
  await expect.poll(() => page.locator('.ambient-atmosphere').evaluate(el => Number(getComputedStyle(el).opacity))).toBe(1)
  const title = await page.locator('h1').evaluate(el => ({ color: getComputedStyle(el).color, opacity: getComputedStyle(el).opacity }))
  const initialX = await page.locator('.ambient-mist-near').evaluate(el => new DOMMatrix(getComputedStyle(el).transform).m41)
  await page.waitForTimeout(5000)
  const nextX = await page.locator('.ambient-mist-near').evaluate(el => new DOMMatrix(getComputedStyle(el).transform).m41)
  expect(Math.abs(nextX - initialX)).toBeGreaterThan(10)
  expect(await page.locator('.ambient-mist-mask img').evaluateAll(images => images.every(image => (image as HTMLImageElement).naturalWidth === 1672))).toBe(true)
  await expect.poll(() => page.locator('.ambient-sun').evaluate(el => Number(getComputedStyle(el).opacity))).toBeGreaterThan(0.34)
  await expect.poll(() => page.locator('.ambient-sun').evaluate(el => Number(getComputedStyle(el).opacity))).toBeLessThan(0.12)
  expect(await page.locator('h1').evaluate(el => ({ color: getComputedStyle(el).color, opacity: getComputedStyle(el).opacity }))).toEqual(title)
})
