import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { gzipSync } from 'node:zlib'
import { chromium } from '@playwright/test'
import { preview } from 'vite'

const label = process.argv[2]
if (label !== 'before' && label !== 'after') throw new Error('Use before or after')
const dir = 'output/playwright/map-touch'
await mkdir(dir, { recursive: true })
const server = await preview({ preview: { host: '127.0.0.1', port: 4192, strictPort: true } })
let browser
try {
  browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' })
  const page = await browser.newPage({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 })
  await page.addInitScript(() => {
    window.mapReactCommits = 0
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
      supportsFiber: true, inject: () => 1, onCommitFiberUnmount() {},
      onCommitFiberRoot() { window.mapReactCommits++ },
    }
  })
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
  await cdp.send('Network.enable')
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true })
  const trace = []
  cdp.on('Tracing.dataCollected', event => trace.push(...event.value))
  await cdp.send('Tracing.start', { categories: 'toplevel,devtools.timeline,blink.user_timing,disabled-by-default-devtools.timeline.frame', transferMode: 'ReportEvents' })
  await page.goto('http://127.0.0.1:4192/#map')
  const canvas = page.locator('.history-map-canvas')
  await page.locator('.history-map-canvas[data-map-state=local][data-rendered-route-features]').waitFor()
  const loading = await page.evaluate(() => ({
    mapReadyMs: Math.round(performance.now()),
  }))
  await canvas.evaluate(element => {
    const stats = { frames: [], markers: 0, arrows: 0, routes: 0, camera: 0, start: 0, firstMove: null, commits: window.mapReactCommits }
    const observer = new MutationObserver(records => {
      for (const { attributeName } of records) {
        if (attributeName === 'data-event-ids') stats.markers++
        if (attributeName === 'data-direction-arrows') stats.arrows++
        if (attributeName === 'data-visible-routes') stats.routes++
        if (attributeName === 'data-zoom') {
          stats.camera++
          if (stats.start && stats.firstMove === null) stats.firstMove = performance.now() - stats.start
        }
      }
    })
    observer.observe(element, { subtree: true, attributes: true, attributeFilter: ['data-event-ids', 'data-direction-arrows', 'data-visible-routes', 'data-zoom'] })
    element.addEventListener('touchmove', () => { if (!stats.start) stats.start = performance.now() }, { passive: true })
    let frame = 0
    const record = time => { stats.frames.push(time); frame = requestAnimationFrame(record) }
    frame = requestAnimationFrame(record)
    performance.mark('map-touch-start')
    window.mapFinishProfile = () => {
      performance.mark('map-touch-end')
      cancelAnimationFrame(frame)
      observer.disconnect()
      return { ...stats, commits: window.mapReactCommits - stats.commits }
    }
  })
  const box = await canvas.boundingBox()
  const x = Math.round(box.x + box.width * .62), y = Math.round(box.y + box.height * .46)
  const touch = (type, points) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: points.map(([px, py], index) => ({ x: px, y: py, id: index + 1 })) })
  for (const [begin, end] of [[26, 104], [104, 26], [26, 92], [92, 34]]) {
    const fingers = spread => [[x - spread, y], [x + spread, y]]
    await touch('touchStart', fingers(begin))
    for (let step = 1; step <= 14; step++) await touch('touchMove', fingers(begin + (end - begin) * step / 14))
    await touch('touchEnd', [])
    await page.waitForTimeout(220)
  }
  await touch('touchStart', [[x, y]])
  for (let step = 1; step <= 16; step++) await touch('touchMove', [[x - step * 4, y + step * 2]])
  await touch('touchEnd', [])
  await page.waitForTimeout(420)
  const { frames, ...counts } = await page.evaluate(() => window.mapFinishProfile())
  const ended = new Promise(resolve => cdp.once('Tracing.tracingComplete', resolve))
  await cdp.send('Tracing.end')
  await ended
  const gaps = frames.slice(1).map((time, index) => time - frames[index]).sort((a, b) => a - b)
  const start = trace.find(entry => entry.name === 'map-touch-start')
  const end = trace.find(entry => entry.name === 'map-touch-end')
  loading.assets = trace.filter(entry => entry.name === 'ResourceSendRequest' && /\.geojson(?:$|\?)/.test(entry.args?.data?.url ?? '')).map(entry => {
    const finish = trace.find(other => other.name === 'ResourceFinish' && other.pid === entry.pid && other.args?.data?.requestId === entry.args.data.requestId)
    return { name: entry.args.data.url.split('/').at(-1), durationMs: finish && Math.round((finish.ts - entry.ts) / 1000), bytes: finish?.args?.data?.decodedBodyLength }
  })
  const tasks = trace.filter(entry => entry.pid === start?.pid && entry.tid === start?.tid &&
    (entry.name === 'ThreadControllerImpl::RunTask' || entry.name === 'RunTask') && entry.ph === 'X' && entry.ts >= start.ts && entry.ts < end?.ts)
  const stats = { loading, counts, interval: { frames: frames.length, p95Ms: gaps[Math.floor(.95 * gaps.length)], maxMs: gaps.at(-1), over34Ms: gaps.filter(gap => gap > 34).length },
    trace: { longTasks: tasks.filter(task => task.dur >= 50_000).length, mainThreadMs: Math.round(tasks.reduce((sum, task) => sum + task.dur, 0) / 1000) },
    browser: browser.version(),
  }
  await writeFile(`${dir}/${label}.json`, JSON.stringify(stats, null, 2))
  await writeFile(`${dir}/${label}-trace.json.gz`, gzipSync(JSON.stringify({ traceEvents: trace })))
  console.log(JSON.stringify(stats, null, 2))
} finally {
  await browser?.close()
  await server.close()
}
