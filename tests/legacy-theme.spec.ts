import { test, expect } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'

// 专项修订的真实视口证据；旧版交付截图保持原样。
const evidence=process.env.LEGACY_EVIDENCE_DIR??'output/playwright/legacy-theme'
mkdirSync(evidence,{recursive:true})

for(const [width,height] of [[1440,1000],[844,390],[740,320]]) {
 test(`主题修订图文阅读 ${width}×${height}`,async({browser},info)=>{
  const context=await browser.newContext({viewport:{width,height},hasTouch:width<1000,isMobile:width<1000,reducedMotion:'reduce',baseURL:'http://127.0.0.1:4173'})
  const page=await context.newPage(),errors:string[]=[]
  page.on('pageerror',error=>errors.push(error.message))
  await page.goto('/#legacy/relay')
  await page.evaluate(()=>document.fonts.ready)
  const prefix=`${evidence}/${info.project.name}-${width}`
  await expect(page.locator('.legacy-circuit')).toBeVisible()
  await page.screenshot({path:`${prefix}-relay.png`})
  await page.locator('.legacy-circuit').evaluate(el=>el.scrollIntoView({block:'center'}))
  await expect(page.locator('.legacy-circuit')).toBeInViewport({ratio:1})
  await page.screenshot({path:`${prefix}-circuit.png`})
  // 主路必须真正进入芯片封装，不再止于封装之前。
  const geometry=await page.locator('.legacy-circuit').evaluate(el=>{
   const path=el.querySelector<SVGPathElement>('.legacy-route-path')!
   const chip=el.querySelector<SVGRectElement>('.legacy-chip')!
   const end=path.getPointAtLength(path.getTotalLength())
   const box=chip.getBBox()
   return {end:{x:end.x,y:end.y},chip:{x:box.x,y:box.y,width:box.width,height:box.height}}
  })
  expect(geometry.end.x).toBeGreaterThanOrEqual(geometry.chip.x)
  expect(geometry.end.x).toBeLessThanOrEqual(geometry.chip.x+geometry.chip.width)
  expect(geometry.end.y).toBeGreaterThanOrEqual(geometry.chip.y)
  expect(geometry.end.y).toBeLessThanOrEqual(geometry.chip.y+geometry.chip.height)
  await page.goto('/#legacy/entrust')
  await page.locator('.legacy-jiang img').evaluate(img=>(img as HTMLImageElement).decode())
  await page.screenshot({path:`${prefix}-jiang.png`})
  await page.locator('.legacy-jiang-reading').evaluate(el=>el.scrollIntoView({block:'start'}))
  await page.screenshot({path:`${prefix}-jiang-reading.png`})
  for(const paragraph of await page.locator('.legacy-jiang-reading>div>p').all()){
   await paragraph.scrollIntoViewIfNeeded()
   await expect(paragraph).toBeInViewport()
  }
  await page.locator('.legacy-drone-scene img').evaluate(img=>(img as HTMLImageElement).decode())
  await page.locator('.legacy-drone-scene').evaluate(el=>el.scrollIntoView({block:'start'}))
  await page.screenshot({path:`${prefix}-drone.png`})
  const droneParagraphs=page.locator('.legacy-drone-scene>div>p')
  await droneParagraphs.last().scrollIntoViewIfNeeded()
  await page.screenshot({path:`${prefix}-drone-reading.png`})
  const reading=await droneParagraphs.last().evaluate(el=>({fontSize:getComputedStyle(el).fontSize,lineHeight:getComputedStyle(el).lineHeight}))
  expect(parseFloat(reading.fontSize)).toBeGreaterThanOrEqual(16)
  expect(await page.locator('.legacy-scroll').evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true)
  if(width<1000){
   const layout=await page.locator('.legacy-drone-scene').evaluate(el=>{
    const photo=el.querySelector('figure')!.getBoundingClientRect(),text=el.querySelector(':scope>div')!.getBoundingClientRect()
    return {photoRight:photo.right,textLeft:text.left}
   })
   expect(layout.photoRight).toBeLessThanOrEqual(layout.textLeft)
  }
  writeFileSync(`${prefix}-review.json`,JSON.stringify({viewport:{width,height},geometry,reading,errors},null,2))
  expect(errors).toEqual([])
  await context.close()
 })
}
