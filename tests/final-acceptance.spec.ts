import { expect, test } from '@playwright/test'
import { toDay } from '../src/features/history-map/model'

test('十月开播立即有行进，与前期史料分开；档案地址在新会话复现', async ({ page, browser }, info) => {
  await page.goto('/#map')
  const map = page.locator('.history-map-canvas')
  const timeline = page.locator('.unified-timeline')
  await expect(map).toHaveAttribute('data-map-state', 'local')
  await expect(timeline).toHaveAttribute('data-current-day', String(toDay('1934-10-10')))
  await page.getByRole('button', { name: '开始历史播放' }).click()
  await expect(page.locator('.history-map-page')).toHaveAttribute('data-mode', 'time')
  await expect(page.getByText('中央红军开始战略转移 · 集结方向先于主力渡河路线展开')).toBeVisible()
  await expect.poll(async () => Number(await map.getAttribute('data-visible-routes'))).toBeGreaterThan(0)
  await page.getByRole('button', { name: '暂停历史播放' }).click()
  await page.screenshot({ path: `output/playwright/final-acceptance/${info.project.name}-october.png` })
  const search = page.getByRole('searchbox', { name: '精选节点检索' })
  await search.fill('  遵义  ')
  await expect(page.locator('.history-panel')).not.toContainText('（v6）')
  await page.getByRole('button', { name: /^遵义会议/ }).click()
  await page.getByRole('button', { name: /深入了解/ }).click()
  await expect(page).toHaveURL(/#map\?archive=EVT-001$/)
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.getByRole('button', { name: '复制展品链接' }).click()
  await expect(page.getByRole('button', { name: '复制展品链接' })).toHaveText('链接已复制')
  const link = await page.evaluate(() => navigator.clipboard.readText())
  const fresh = await browser.newPage()
  try {
    await fresh.goto(link)
    await expect(fresh.getByRole('dialog').getByRole('heading', { name: '遵义会议', exact: true })).toBeVisible()
    await expect(fresh.getByRole('dialog').locator('figcaption').getByRole('link', { name: /来源/ }).first()).toBeVisible()
    await fresh.screenshot({ path: `output/playwright/final-acceptance/${info.project.name}-zunyi.png` })
    await fresh.getByRole('button', { name: '关闭历史档案' }).click()
    await expect(fresh.getByRole('dialog')).toBeHidden()
    await expect(fresh).toHaveURL(/#map\?event=EVT-001$/)
    await fresh.goto(new URL('/#map?archive=EVT-023&topic=chishui', page.url()).href)
    await expect(fresh.locator('.history-archive-dialog[open] #archive-title')).toContainText('四渡赤水')
  } finally {
    await fresh.close()
  }
})

test('短横屏先读导读，答卷选词后直接看见输入区', async ({ browser }, info) => {
  const page = await browser.newPage({ viewport: { width: 740, height: 320 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' })
  try {
    await page.goto('http://127.0.0.1:4173/#legacy')
    await page.getByRole('link', { name: '沿着精神之路，继续阅读' }).tap()
    await expect(page.locator('#legacy-intro h2')).toBeFocused()
    await expect(page.locator('#legacy-intro h2')).toBeInViewport()
    await page.goto('http://127.0.0.1:4173/#legacy/answer')
    await expect(page.locator('#legacy-answer-title')).toBeInViewport()
    await page.getByRole('radio', { name: '笃学' }).tap()
    const field = page.getByRole('textbox', { name: '在杭电的这几年，我希望……' })
    await expect(field).toBeInViewport({ ratio: .8 })
    await expect(field).not.toBeFocused()
    await page.screenshot({ path: `output/playwright/final-acceptance/${info.project.name}-landscape-answer.png` })
  } finally {
    await page.close()
  }
})
