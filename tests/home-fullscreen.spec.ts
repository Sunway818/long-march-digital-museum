import { expect, test } from '@playwright/test'

test('首页原生全屏、外部退出与地图往返保持整站可见', async ({ page }, info) => {
  await page.goto('/#home')
  const button = page.getByRole('button', { name: '全屏', exact: true })
  await expect(button).toBeInViewport({ ratio: 1 })
  await button.press('Enter')
  await expect.poll(() => page.evaluate(() => document.fullscreenElement === document.documentElement)).toBe(true)
  await expect(page.getByRole('button', { name: '退出全屏', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name: '时空长征', exact: true }).click()
  await expect(page.locator('.history-map-canvas')).toHaveAttribute('data-map-state', 'local')
  await expect(page.getByRole('group', { name: '地图显示与工具' }).getByRole('button', { name: '退出全屏', exact: true })).toBeVisible()
  await page.getByRole('navigation', { name: '地图导航' }).getByRole('link', { name: '首页', exact: true }).click()
  await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(true)
  // Browser-driven exit must update the label, without relying on another button click.
  await page.evaluate(() => document.exitFullscreen())
  await expect(button).toHaveAttribute('aria-pressed', 'false')
  await button.click()
  await page.getByRole('button', { name: '退出全屏', exact: true }).click()
  await expect.poll(() => page.evaluate(() => document.fullscreenElement)).toBe(null)
  await page.screenshot({ path: `output/playwright/home-fullscreen/${info.project.name}-desktop.png` })
})

test('四档手机横屏及竖屏均有44px全屏入口，可进入退出且不横向溢出', async ({ browser }, info) => {
  test.setTimeout(90_000)
  for (const [width, height] of [[932, 430], [844, 390], [740, 320], [667, 375], [390, 844]]) {
    const context = await browser.newContext({ viewport: { width, height }, hasTouch: true, isMobile: true, baseURL: 'http://127.0.0.1:4173', reducedMotion: 'reduce' })
    const page = await context.newPage()
    await page.goto('/#home')
    if (height > width) await page.getByRole('button', { name: '继续竖屏浏览' }).click()
    const button = page.getByRole('button', { name: '全屏', exact: true })
    await expect(button).toBeInViewport({ ratio: 1 })
    expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({ path: `output/playwright/home-fullscreen/${info.project.name}-${width}.png` })
    await button.tap()
    await expect(page.getByRole('button', { name: '退出全屏', exact: true })).toHaveAttribute('aria-pressed', 'true')
    await page.getByRole('button', { name: '退出全屏', exact: true }).tap()
    await expect.poll(() => page.evaluate(() => document.fullscreenElement)).toBe(null)
    await context.close()
  }
})

test('无全屏API的浏览器明确提示，不伪装成功且提示可关闭', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(HTMLElement.prototype, 'requestFullscreen', { value: undefined, configurable: true })
    Object.defineProperty(HTMLElement.prototype, 'webkitRequestFullscreen', { value: undefined, configurable: true })
  })
  await page.goto('/#home')
  await page.getByRole('button', { name: '全屏', exact: true }).click()
  await expect(page.locator('.home-fullscreen-message [role=status]')).toContainText('当前浏览器不支持网页全屏')
  await expect(page.getByRole('button', { name: '全屏', exact: true })).toHaveAttribute('aria-pressed', 'false')
  await page.getByRole('button', { name: '关闭全屏提示' }).click()
  await expect(page.locator('.home-fullscreen-message')).toHaveCount(0)
})

test('全屏请求被拒绝后能提示并重试，不影响首页阅读', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.addInitScript(() => {
    HTMLElement.prototype.requestFullscreen = () => Promise.reject(new Error('test: permission denied'))
  })
  await page.goto('/#home')
  const button = page.getByRole('button', { name: '全屏', exact: true })
  await button.click()
  await expect(page.locator('.home-fullscreen-message [role=status]')).toContainText('浏览器未能切换全屏')
  await expect(button).toBeEnabled()
  await button.click()
  await expect(page.getByRole('link', { name: '开启征程', exact: true })).toBeVisible()
  expect(errors).toEqual([])
})
