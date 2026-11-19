import { test, expect } from '@playwright/test'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { networkInterfaces } from 'node:os'
import brand from '../src/data/history/legacy/brand-register.json' with {type:'json'}

const evidence='output/playwright/legacy-emblem'
mkdirSync(evidence,{recursive:true})
const sample='认真学好专业基础，让每一次实验留下可以复核的记录。\n和同学一起，解决一个身边的真实问题。'
const markPath=brand.displayPath.replace(/^public/,'')
const address=Object.values(networkInterfaces()).flat().find(item=>item?.family==='IPv4'&&!item.internal&&item.mac!=='00:00:00:00:00:00')?.address
const lan=process.env.LAN_TEST_URL??`http://${address}:4174`

for(const [label,origin,width,height] of [
 ['desktop','http://localhost:4173',1440,900],
 ['landscape','http://localhost:4173',844,390],
 ['lan-landscape',lan,844,390],
] as const){
 test(`官方校标默认/实时/生成/实际PNG一致 ${label}`,async({browser},info)=>{
  const context=await browser.newContext({viewport:{width,height},hasTouch:width<1000,isMobile:width<1000,reducedMotion:'reduce'})
  const page=await context.newPage(),errors:string[]=[],external:string[]=[]
  page.on('pageerror',error=>errors.push(error.message))
  page.on('request',request=>{if(/^https?:/.test(request.url())&&new URL(request.url()).origin!==new URL(origin).origin)external.push(request.url())})
  const prefix=`${evidence}/${info.project.name}-${label}`
  const raw=readFileSync(brand.displayPath)
  expect(raw.equals(readFileSync(brand.originalPath))).toBe(true)
  expect(createHash('sha256').update(raw).digest('hex')).toBe(brand.sha256)
  expect(raw.equals(readFileSync('dist'+markPath))).toBe(true)
  const response=await context.request.get(origin+markPath)
  expect(response.ok()).toBe(true)
  expect(response.headers()['content-type']).toContain('image/svg+xml')
  expect((await response.body()).equals(raw)).toBe(true)
  await page.goto(origin+'/#legacy')
  await expect(page.locator('#legacy-title')).toBeVisible()
  await page.evaluate(()=>document.fonts.ready)
  await page.evaluate(()=>{location.hash='legacy/answer'})
  const canvas=page.locator('.youth-live-canvas')
  await expect(canvas).toBeVisible()
  await expect(canvas).toHaveAttribute('aria-busy','false')
  // 在字体和懒加载影像就绪后为截图定位，不把上方展陈的滚动锚点当作校标失败。
  await page.locator('#legacy-answer').evaluate(el=>el.scrollIntoView({block:'start'}))
  await expect(canvas).toBeInViewport({ratio:.99})
  const expected=await page.evaluate(async({path,ratio})=>{
   const image=new Image();image.src=path;await image.decode()
   const reference=document.createElement('canvas');reference.width=288;reference.height=66
   const context=reference.getContext('2d')!;context.fillStyle='#19251f';context.fillRect(0,0,288,66)
   context.drawImage(image,0,0,288,288/ratio)
   return reference.toDataURL()
  },{path:markPath,ratio:brand.width/brand.height})
  const logoPixels=()=>canvas.evaluate(el=>{
   const region=document.createElement('canvas');region.width=288;region.height=66
   region.getContext('2d')!.drawImage(el as HTMLCanvasElement,680,49,288,66,0,0,288,66)
   return region.toDataURL()
  })
  expect(await logoPixels()).toBe(expected)
  await page.screenshot({path:`${prefix}-default.png`})
  await page.getByRole('radio',{name:'求新',exact:true}).check()
  await page.locator('#youth-answer').fill(sample)
  expect(await logoPixels()).toBe(expected)
  await page.screenshot({path:`${prefix}-live.png`})
  await page.getByRole('button',{name:'生成我的青春纪念笺',exact:true}).click()
  const result=page.locator('.youth-keepsake')
  await expect(result).toBeVisible()
  expect(await result.evaluate(el=>{
   const region=document.createElement('canvas');region.width=288;region.height=66
   region.getContext('2d')!.drawImage(el as HTMLImageElement,680,49,288,66,0,0,288,66)
   return region.toDataURL()
  })).toBe(expected)
  const downloadEvent=page.waitForEvent('download')
  await page.getByRole('link',{name:'保存纪念笺图片',exact:true}).click()
  const download=await downloadEvent,filename=`${prefix}-export.png`
  await download.saveAs(filename)
  const bytes=readFileSync(filename)
  expect(bytes.readUInt32BE(16)).toBe(1080)
  expect(bytes.readUInt32BE(20)).toBe(1440)
  // 重新解码实际落盘PNG，比较标志区，而非只验证网页中出现一个logo元素。
  const exported=await page.evaluate(async base64=>{
   const image=new Image();image.src=`data:image/png;base64,${base64}`;await image.decode()
   const region=document.createElement('canvas');region.width=288;region.height=66
   region.getContext('2d')!.drawImage(image,680,49,288,66,0,0,288,66)
   return region.toDataURL()
  },bytes.toString('base64'))
  expect(exported).toBe(expected)
  await result.scrollIntoViewIfNeeded()
  await page.screenshot({path:`${prefix}-generated.png`})
  expect(await page.locator('.legacy-scroll').evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true)
  expect(errors).toEqual([]);expect(external).toEqual([])
  writeFileSync(`${prefix}-review.json`,JSON.stringify({origin,viewport:{width,height},sha256:brand.sha256,defaultLiveGeneratedAndDownloadedMarkMatchesOfficial:true,export:{width:1080,height:1440},errors,external},null,2))
  await context.close()
 })
}

test('校标加载失败不导出缺图，重试后恢复完整生成',async({page})=>{
 let fail=true
 await page.route('**/legacy-brand/hdu-official-white.svg',route=>fail?route.abort():route.continue())
 await page.goto('/#legacy/answer')
 await expect(page.locator('.youth-preview-fallback')).toContainText('图片预览暂不可用')
 await page.getByRole('radio',{name:'笃学',exact:true}).check()
 await page.locator('#youth-answer').fill('校标失败时，不保存不完整的纪念笺。')
 await page.getByRole('button',{name:'生成我的青春纪念笺',exact:true}).click()
 await expect(page.getByRole('status')).toContainText('校标暂未加载')
 await expect(page.locator('.youth-keepsake')).toHaveCount(0)
 await expect(page.getByRole('link',{name:'保存纪念笺图片',exact:true})).toHaveCount(0)
 fail=false
 await page.getByRole('button',{name:'生成我的青春纪念笺',exact:true}).click()
 await expect(page.locator('.youth-keepsake')).toBeVisible()
})

test('首次慢速加载校标时生成不抢跑',async({page})=>{
 let release!:()=>void
 const gate=new Promise<void>(resolve=>{release=resolve})
 await page.route('**/legacy-brand/hdu-official-white.svg',async route=>{await gate;await route.continue()})
 await page.goto('/#legacy/answer',{waitUntil:'domcontentloaded'})
 await page.getByRole('radio',{name:'担当',exact:true}).check()
 await page.locator('#youth-answer').fill('等待同源校标加载后，一起保存。')
 await page.getByRole('button',{name:'生成我的青春纪念笺',exact:true}).click()
 await expect(page.getByRole('button',{name:'正在生成纪念笺…',exact:true})).toBeDisabled()
 await expect(page.locator('.youth-keepsake')).toHaveCount(0)
 release()
 await expect(page.locator('.youth-keepsake')).toBeVisible()
})
