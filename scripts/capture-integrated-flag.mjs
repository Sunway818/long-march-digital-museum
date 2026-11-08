import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import { cpus, platform, release } from 'node:os'

const output = 'output/playwright/flag-integrated'
await mkdir(output, { recursive: true })
const reports = []
for (const [name, executablePath] of [
  ['chrome', 'C:/Program Files/Google/Chrome/Application/chrome.exe'],
  ['edge', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'],
]) {
  const browser = await chromium.launch({ executablePath, headless: true })
  try {
    for (const [width, height] of [[1920, 1080], [1366, 768]]) {
      const page = await browser.newPage({ viewport: { width, height } }), errors = []
      page.on('pageerror', error => errors.push(error.message))
      page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
      await page.goto(process.env.PREVIEW_URL ?? 'http://127.0.0.1:4173/')
      await page.waitForFunction(() => document.querySelector('#home')?.dataset.ambientState === 'running' && document.querySelector('#home')?.dataset.flagState === 'ready')
      const frames = []
      for (const target of [0, 4, 8]) {
        await page.waitForFunction(t => Number(document.querySelector('.flag-canvas').dataset.flagTime) >= t, target)
        await page.screenshot({ path: `${output}/${name}-${width}-${target}s.png` })
        frames.push(await page.evaluate(() => ({ time: document.querySelector('.flag-canvas').dataset.flagTime, sun: getComputedStyle(document.querySelector('.ambient-sun')).opacity, mist: getComputedStyle(document.querySelector('.ambient-mist-near')).transform })))
      }
      const performanceSample = await page.evaluate(() => new Promise(resolve => {
        const intervals = []; let previous; const start = performance.now()
        function frame(now) {
          if (previous !== undefined) intervals.push(now - previous)
          previous = now
          if (now - start < 4000) requestAnimationFrame(frame)
          else {
            intervals.sort((a,b) => a-b)
            const canvas = document.querySelector('.flag-canvas'), gl = canvas.getContext('webgl2'), debug = gl.getExtension('WEBGL_debug_renderer_info')
            resolve({ frames: intervals.length, meanMs: intervals.reduce((s,n) => s+n,0)/intervals.length, p95Ms: intervals[Math.floor(intervals.length*.95)], maxMs: intervals.at(-1), gpu: debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER), glError: gl.getError(), buffer: [canvas.width,canvas.height], attributes: gl.getContextAttributes(), dpr:devicePixelRatio })
          }
        }
        requestAnimationFrame(frame)
      }))
      await page.getByRole('button', { name: '暂停环境动效' }).click()
      await page.screenshot({ path: `${output}/${name}-${width}-paused.png` })
      const canvas = page.locator('.flag-canvas')
      const pausedTime = await canvas.getAttribute('data-flag-time')
      await page.waitForTimeout(300)
      if (pausedTime !== await canvas.getAttribute('data-flag-time')) throw Error('Pause failed')
      reports.push({ browser:name,version:browser.version(),width,height,headless:true,system:`${platform()} ${release()}`,cpu:cpus()[0].model,frames,performanceSample,errors })
      await writeFile(`${output}/report.json`, JSON.stringify(reports,null,2))
      if (errors.length || performanceSample.glError) throw Error('Browser error')
      await page.close()
    }
  } finally { await browser.close() }
}
console.log(JSON.stringify(reports.map(({browser,width,performanceSample,errors}) => ({browser,width,performanceSample,errors})),null,2))
