import { expect, test } from '@playwright/test'
import { flagDisplacement, createFlagMesh, deformFlag } from '../src/animations/flagMesh'

test('C 档网格固定连接且循环连续，没有翻转或超过 16px', () => {
  const mesh = createFlagMesh()
  let tailMaximum = 0
  for (let phase = 0; phase < 160; phase++) {
    const time = phase / 20
    deformFlag(mesh, time)
    expect(Math.hypot(...flagDisplacement(255, 167, time))).toBe(0)
    tailMaximum = Math.max(tailMaximum, Math.hypot(...flagDisplacement(815, 475, time)))
    for (let i = 0; i < mesh.indices.length; i += 3) {
      const a = mesh.indices[i]! * 4, b = mesh.indices[i + 1]! * 4, c = mesh.indices[i + 2]! * 4, v = mesh.vertices
      const area = (v[b]! - v[a]!) * (v[c + 1]! - v[a + 1]!) - (v[b + 1]! - v[a + 1]!) * (v[c]! - v[a]!)
      // Fail without millions of assertion allocations in the inner loop.
      if (area <= 0) throw new Error(`Triangle flip at ${time}s`)
    }
  }
  expect(tailMaximum).toBeGreaterThan(15.99)
  expect(tailMaximum).toBeLessThanOrEqual(16)
  const start = flagDisplacement(700, 350, 0), end = flagDisplacement(700, 350, 8)
  expect(Math.hypot(start[0] - end[0], start[1] - end[1])).toBeLessThan(1e-10)
})

test('旗帜自动持续两个周期，三种动效由同一按钮冻结及续播', async ({ page }) => {
  test.setTimeout(40_000)
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  await page.goto('/')
  const hero = page.locator('#home'), canvas = page.locator('.flag-canvas')
  await expect(hero).toHaveAttribute('data-flag-state', 'ready')
  await expect(hero).toHaveAttribute('data-ambient-state', 'running')
  await expect(canvas).toHaveAttribute('data-flag-amplitude', '16')
  expect(await canvas.evaluate(el => [(el as HTMLCanvasElement).width, (el as HTMLCanvasElement).height])).toEqual([672, 536])
  await expect(page.locator('.ambient-toggle')).toHaveCount(1)
  await expect(page.locator('[data-amplitude],input[type="range"],select')).toHaveCount(0)
  // Samples span two full cycles without mouse, click or scroll triggering motion.
  const first = await canvas.evaluate(el => (el as HTMLCanvasElement).toDataURL())
  await expect.poll(async () => Number(await canvas.getAttribute('data-flag-time')), { timeout: 23_000 }).toBeGreaterThan(16.2)
  expect(await canvas.evaluate(el => (el as HTMLCanvasElement).toDataURL())).not.toBe(first)
  await page.getByRole('button', { name: '暂停环境动效' }).click()
  const snapshot = () => page.evaluate(() => ({
    flag: document.querySelector<HTMLCanvasElement>('.flag-canvas')!.toDataURL(),
    flagTime: document.querySelector<HTMLElement>('.flag-canvas')!.dataset.flagTime,
    sun: getComputedStyle(document.querySelector('.ambient-sun')!).opacity,
    mist: getComputedStyle(document.querySelector('.ambient-mist-near')!).transform,
  }))
  const paused = await snapshot()
  await page.waitForTimeout(500)
  expect(await snapshot()).toEqual(paused)
  // A parent React render must not reset the choice or rebuild the scene.
  await page.getByRole('button', { name: '影像说明' }).click()
  await page.keyboard.press('Escape')
  expect(await snapshot()).toEqual(paused)
  await page.getByRole('button', { name: '播放环境动效' }).click()
  await page.waitForTimeout(220)
  const resumed = await snapshot()
  expect(resumed.flag).not.toBe(paused.flag)
  expect(resumed.sun).not.toBe(paused.sun)
  expect(resumed.mist).not.toBe(paused.mist)
  expect(Number(resumed.flagTime) - Number(paused.flagTime)).toBeLessThan(.5)
  expect(errors).toEqual([])
})

test('局部画布缩放对齐，部分滚动不停，离屏及后台恢复不追赶', async ({ page }) => {
  await page.goto('/')
  const hero = page.locator('#home'), canvas = page.locator('.flag-canvas')
  await expect(hero).toHaveAttribute('data-ambient-state', 'running')
  await page.mouse.wheel(0, 180)
  await page.waitForTimeout(500)
  await expect(hero).toHaveAttribute('data-ambient-state', 'running')
  await page.getByRole('navigation').getByRole('link', { name: '首页', exact: true }).click()
  await page.getByRole('button', { name: '暂停环境动效' }).click()
  for (const [width, height] of [[1440, 900], [1366, 768], [1920, 1080]]) {
    await page.setViewportSize({ width: width!, height: height! })
    await page.waitForTimeout(300)
    const alignment = await page.evaluate(() => {
      const layer = document.querySelector<HTMLElement>('.flag-scene')!, canvas = document.querySelector<HTMLElement>('.flag-canvas')!
      const scale = Math.max(layer.clientWidth / 1672, layer.clientHeight / 941)
      return Math.abs(parseFloat(canvas.style.left) - ((layer.clientWidth - 1672 * scale) / 2 + 176 * scale)) + Math.abs(parseFloat(canvas.style.top) - ((layer.clientHeight - 941 * scale) / 2 - 16 * scale))
    })
    expect(alignment).toBeLessThan(.01)
  }
  await page.getByRole('button', { name: '播放环境动效' }).click()
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')) })
  const time = Number(await canvas.getAttribute('data-flag-time'))
  await page.waitForTimeout(500)
  expect(Number(await canvas.getAttribute('data-flag-time'))).toBe(time)
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: false }); document.dispatchEvent(new Event('visibilitychange')) })
  await page.waitForTimeout(150)
  expect(Number(await canvas.getAttribute('data-flag-time')) - time).toBeLessThan(.4)
})

test('WebGL 不支持或丢失时完整原图回退，reduce 初始保持静态', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...args: Parameters<typeof original>) {
      return String(args[0]) === 'webgl2' ? null : original.apply(this, args)
    } as typeof original
  })
  await page.goto('/')
  await expect(page.locator('#home')).toHaveAttribute('data-flag-state', 'fallback')
  await expect(page.locator('.flag-scene')).toBeHidden()
  expect(await page.locator('.hero-image').evaluate(el => (el as HTMLImageElement).naturalWidth)).toBe(1672)
  await expect(page.locator('#home')).toHaveAttribute('data-ambient-state', 'running')
})

test('Context Lost 完整回退；减少动态效果切换保持手动暂停', async ({ page }) => {
  await page.goto('/')
  const hero = page.locator('#home')
  await expect(hero).toHaveAttribute('data-flag-state', 'ready')
  await page.getByRole('button', { name: '暂停环境动效' }).click()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('.flag-scene')).toBeHidden()
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await expect(hero).toHaveAttribute('data-ambient-state', 'paused')
  await page.locator('.flag-canvas').evaluate(el => (el as HTMLCanvasElement).getContext('webgl2')!.getExtension('WEBGL_lose_context')!.loseContext())
  await expect(hero).toHaveAttribute('data-flag-state', 'fallback')
  await expect(page.locator('.flag-scene')).toBeHidden()
  expect(await page.locator('.hero-image').evaluate(el => (el as HTMLImageElement).naturalWidth)).toBe(1672)
})

test('旗面资源失败回退，初始 reduce 不创建 WebGL 持续渲染', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.locator('#home')).toHaveAttribute('data-ambient-state', 'reduced')
  await expect(page.locator('.flag-scene')).toBeHidden()
  await expect(page.locator('.flag-canvas')).not.toHaveAttribute('data-flag-time', /.+/)
  await page.route('**/*flag-cloth-local*', route => route.abort())
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await expect(page.locator('#home')).toHaveAttribute('data-flag-state', 'fallback')
  await expect(page.locator('.flag-scene')).toBeHidden()
  expect(await page.locator('.hero-image').evaluate(el => (el as HTMLImageElement).naturalWidth)).toBe(1672)
})
