import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'

await mkdir('output/playwright', { recursive: true })
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })
const errors = []
page.on('pageerror', error => errors.push(error.message))
try {
  await page.goto('http://127.0.0.1:4174/', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(700)
  await page.screenshot({ path: 'output/playwright/stage3-intro-mid.png' })
  await page.waitForTimeout(1800)
  const sample = page.evaluate(() => new Promise(resolve => {
    const intervals = []; let last = performance.now(); const start = last
    const frame = now => {
      intervals.push(now - last); last = now
      if (now - start < 2000) requestAnimationFrame(frame)
      else {
        intervals.sort((a, b) => a - b)
        resolve({ frames: intervals.length, meanFrameMs: intervals.reduce((a, b) => a + b, 0) / intervals.length, p95FrameMs: intervals[Math.floor(intervals.length * 0.95)] })
      }
    }; requestAnimationFrame(frame)
  }))
  for (let index = 0; index < 12; index++) { await page.mouse.wheel(0, index < 6 ? 48 : -48); await page.waitForTimeout(180) }
  const frameSample = await sample
  await page.getByRole('link', { name: '开启征程', exact: true }).click()
  await page.waitForTimeout(1000)
  await page.screenshot({ path: 'output/playwright/final-entrance.png' })
  for (const name of ['历史时间轴', '时空长征', '历史瞬间', '英雄人物', '精神传承']) {
    await page.getByRole('button', { name: `${name} 待开放` }).click(); await page.waitForTimeout(450)
  }
  await page.getByRole('link', { name: '返回序章' }).click()
  await page.waitForTimeout(1000)
  for (let index = 0; index < 3; index++) {
    await page.getByRole('button', { name: '影像说明' }).click()
    if (!index) await page.screenshot({ path: 'output/playwright/final-source-dialog.png' })
    await page.waitForTimeout(450); await page.keyboard.press('Escape'); await page.waitForTimeout(300)
  }
  await page.setViewportSize({ width: 800, height: 600 })
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'output/playwright/final-window-800.png' })
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
  await page.setViewportSize({ width: 1366, height: 768 })
  await page.waitForTimeout(500)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.getByRole('link', { name: '向下探索' }).click()
  await page.waitForTimeout(500)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.getByRole('link', { name: '返回序章' }).click()
  await page.waitForTimeout(2500)
  const report = { browser: browser.version(), frameSample, overflow, errors, notes: 'Local headless Chrome exploratory input and media-query changes; not a hardware or field performance benchmark.' }
  if (overflow || errors.length) throw new Error(JSON.stringify(report))
  await writeFile('output/playwright/exploration.json', JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
} finally { await browser.close() }
