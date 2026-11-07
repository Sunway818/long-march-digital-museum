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
  const chapters = ['历史时间轴', '时空长征', '历史瞬间', '英雄人物', '精神传承']
  for (const name of chapters) {
    await page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name, exact: true }).click()
    await expect(page.locator('.chapter-status')).toContainText(`${name}正在筹备`)
    await expect(page.getByRole('button', { name: `${name} 待开放` })).toHaveAttribute('aria-pressed', 'true')
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

test('跳过片头立即呈现可操作的首页', async ({ page }) => {
  await page.goto('/')
  const skip = page.getByRole('button', { name: '跳过片头' })
  await skip.click()
  await expect(skip).toHaveCount(0)
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
