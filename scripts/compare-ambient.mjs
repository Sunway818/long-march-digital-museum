import { chromium } from '@playwright/test'
import { readFile, writeFile } from 'node:fs/promises'

// Read actual browser screenshots; compare pixels without editing or synthesizing images.
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
const reports = []
try {
  const page = await browser.newPage()
  for (const width of [1920, 1366]) {
    for (const stage of ['enhance-before', 'enhance-after']) {
      const files = await Promise.all(['bright', 'dark'].map(async label => `data:image/png;base64,${(await readFile(`output/playwright/${stage}-chrome-${width}-${label}.png`)).toString('base64')}`))
      const regions = await page.evaluate(async ({ files, width }) => {
        const images = await Promise.all(files.map(url => new Promise(resolve => { const image = new Image(); image.onload = () => resolve(image); image.src = url })))
        const pixels = images.map(image => { const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height; const context = canvas.getContext('2d'); context.drawImage(image, 0, 0); return context.getImageData(0, 0, canvas.width, canvas.height).data })
        const scale = width / 1920
        const regions = { sun: [1510, 280, 1900, 535], mist: [1050, 610, 1880, 840], flag: [150, 120, 730, 490] }
        return Object.fromEntries(Object.entries(regions).map(([name, box]) => {
          const [x0, y0, x1, y1] = box.map(value => Math.round(value * scale))
          let total = 0; let changed = 0; let count = 0
          for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
            const index = (y * width + x) * 4
            const delta = [0, 1, 2].reduce((sum, channel) => sum + Math.abs(pixels[0][index + channel] - pixels[1][index + channel]), 0) / 3
            total += delta; changed += delta > 3 ? 1 : 0; count++
          }
          return [name, { meanAbsoluteRGB: Number((total / count).toFixed(3)), changedPercentAbove3: Number((changed / count * 100).toFixed(2)), pixelBounds: [x0, y0, x1, y1] }]
        }))
      }, { files, width })
      reports.push({ stage, width, regions })
    }
  }
  await writeFile('output/playwright/enhance-pixel-comparison.json', JSON.stringify(reports, null, 2))
  console.log(JSON.stringify(reports, null, 2))
} finally { await browser.close() }
