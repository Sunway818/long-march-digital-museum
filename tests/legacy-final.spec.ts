import { test, expect } from '@playwright/test'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const evidence=process.env.LEGACY_EVIDENCE_DIR??'output/playwright/legacy-final'
mkdirSync(evidence,{recursive:true})
const sample='认真学好专业基础，让每一次实验留下可以复核的记录。\n和同学一起，解决一个身边的真实问题。'

for(const [width,height] of [[1920,1080],[1440,900],[932,430],[844,390],[740,320],[667,375]]){
 test(`最终精修实时纪念笺与展陈 ${width}×${height}`,async({browser},info)=>{
  test.setTimeout(90_000)
  const context=await browser.newContext({viewport:{width,height},hasTouch:width<1000,isMobile:width<1000,reducedMotion:'reduce',baseURL:'http://127.0.0.1:4173'})
  const page=await context.newPage(),errors:string[]=[],requests:string[]=[]
  page.on('pageerror',error=>errors.push(error.message))
  page.on('request',request=>requests.push(request.url()+' '+(request.postData()??'')))
  const prefix=`${evidence}/${info.project.name}-${width}-final`
  await page.goto('/#legacy')
  await expect(page.locator('#legacy-title')).toBeVisible()
  for(const image of await page.locator('.legacy-prologue-art img').all())await image.evaluate(el=>(el as HTMLImageElement).decode())
  await page.evaluate(()=>document.fonts.ready)
  await page.screenshot({path:`${prefix}-prologue.png`})
  await page.locator('.legacy-introduction').evaluate(el=>el.scrollIntoView({block:'start'}))
  const titleSpans=await page.locator('.legacy-introduction h2>span').evaluateAll(spans=>spans.map(span=>({width:span.getBoundingClientRect().width,scroll:span.scrollWidth,client:span.clientWidth})))
  expect(titleSpans.every(span=>span.scroll<=span.client+1)).toBe(true)
  await page.screenshot({path:`${prefix}-introduction.png`})
  for(const dimension of ['belief','tenacity','truth','unity','people']){
   const entry=page.locator(`.legacy-road-${dimension}`)
   await entry.locator('img').evaluate(img=>(img as HTMLImageElement).decode())
   await entry.evaluate(el=>el.scrollIntoView({block:'start'}))
   await page.screenshot({path:`${prefix}-${dimension}.png`})
  }
  const route=await page.locator('.legacy-road-entries').evaluate(el=>{
   const rail=el.querySelector('.legacy-road-route')!.getBoundingClientRect()
   return [...el.querySelectorAll('.legacy-road-node')].map(node=>{const box=node.getBoundingClientRect();return {onLine:Math.abs((box.left+box.width/2)-(rail.left+rail.width/2))<2,inLine:box.top>=rail.top&&box.bottom<=rail.bottom}})
  })
  expect(route.every(node=>node.onLine&&node.inLine)).toBe(true)
  for(const [hash,selector,name] of [['relay','#legacy-relay','relay'],['entrust','#legacy-entrust','jiang'],['entrust','.legacy-drone-scene','drone']] as const){
   await page.evaluate(hash=>{location.hash=`legacy/${hash}`},hash)
   await page.locator(selector).evaluate(el=>el.scrollIntoView({block:'start'}))
   await page.screenshot({path:`${prefix}-${name}.png`})
  }
  await page.evaluate(()=>{location.hash='legacy/answer'})
  const live=page.locator('.youth-live-canvas')
  await expect(live).toBeVisible()
  await expect(page.getByRole('radio',{checked:true})).toHaveCount(0)
  await expect(page.locator('.youth-live-preview figcaption')).toContainText('示例预览')
  await expect(live).toBeInViewport({ratio:.99})
  await expect(page.locator('.youth-keepsake')).toHaveCount(0)
  await page.screenshot({path:`${prefix}-answer-initial.png`})
  const initial=await live.evaluate(el=>(el as HTMLCanvasElement).toDataURL())
  await page.getByRole('radio',{name:'求新',exact:true}).check()
  const field=page.getByRole('textbox',{name:'在杭电的这几年，我希望……',exact:true})
  await field.fill(sample)
  await expect(live).toHaveAttribute('aria-label',new RegExp('可以复核的记录'))
  expect(await live.evaluate(el=>(el as HTMLCanvasElement).toDataURL())).not.toBe(initial)
  await expect(page.locator('.youth-keepsake')).toHaveCount(0)
  const previewBody=await live.evaluate(el=>{
   const region=document.createElement('canvas');region.width=816;region.height=300
   region.getContext('2d')!.drawImage(el as HTMLCanvasElement,112,420,816,300,0,0,816,300)
   return region.toDataURL()
  })
  const layout=await page.locator('.youth-workbench').evaluate(el=>{
   const writing=el.querySelector('.youth-writing')!.getBoundingClientRect(),preview=el.querySelector('.youth-preview-panel')!.getBoundingClientRect()
   return {writingRight:writing.right,previewLeft:preview.left}
  })
  expect(layout.writingRight).toBeLessThan(layout.previewLeft)
  await page.screenshot({path:`${prefix}-answer-live.png`})
  await page.getByRole('button',{name:'生成我的青春纪念笺',exact:true}).click()
  const result=page.locator('.youth-keepsake')
  await expect(result).toBeVisible()
  const exportedBody=await result.evaluate(el=>{
   const region=document.createElement('canvas');region.width=816;region.height=300
   region.getContext('2d')!.drawImage(el as HTMLImageElement,112,420,816,300,0,0,816,300)
   return region.toDataURL()
  })
  expect(exportedBody).toBe(previewBody)
  const downloadEvent=page.waitForEvent('download')
  await page.getByRole('link',{name:'保存纪念笺图片',exact:true}).click()
  const download=await downloadEvent,artifact=`${prefix}-keepsake.png`
  await download.saveAs(artifact)
  const png=readFileSync(artifact)
  expect(png.readUInt32BE(16)).toBe(1080);expect(png.readUInt32BE(20)).toBeGreaterThanOrEqual(1440)
  await result.scrollIntoViewIfNeeded()
  await page.screenshot({path:`${prefix}-answer-generated.png`})
  // 改词或改字后，旧导出不得继续冒充当前答卷。
  await field.fill(sample+'继续修改。')
  await expect(page.locator('.youth-keepsake')).toHaveCount(0)
  await expect(page.getByRole('link',{name:'保存纪念笺图片',exact:true})).toHaveCount(0)
  await expect(live).toHaveAttribute('aria-label',/继续修改/)
  expect(requests.some(request=>request.includes('可以复核的记录'))).toBe(false)
  await page.getByRole('link',{name:'此刻留白，继续读尾声',exact:true}).click()
  await page.screenshot({path:`${prefix}-epilogue.png`})
  expect(await page.locator('.legacy-scroll').evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true)
  expect(errors).toEqual([])
  writeFileSync(`${prefix}-review.json`,JSON.stringify({viewport:{width,height},layout,route,previewMatchesExport:true,export:{width:png.readUInt32BE(16),height:png.readUInt32BE(20)},errors},null,2))
  await context.close()
 })
}

test('生成进行中修改文字不提交旧结果，切换关键词保留文字',async({page})=>{
 await page.goto('/#legacy/answer')
 await page.getByRole('radio',{name:'笃学',exact:true}).check()
 await page.locator('#youth-answer').fill('第一份尚未确认的文字')
 await page.evaluate(()=>{
  const original=HTMLCanvasElement.prototype.toBlob
  HTMLCanvasElement.prototype.toBlob=function(callback,...args){original.call(this,blob=>setTimeout(()=>callback(blob),400),...args)}
 })
 await page.getByRole('button',{name:'生成我的青春纪念笺',exact:true}).click()
 await page.locator('#youth-answer').fill('第二份修改后的文字')
 await page.getByRole('radio',{name:'担当',exact:true}).check()
 await expect(page.locator('#youth-answer')).toHaveValue('第二份修改后的文字')
 await page.waitForTimeout(550)
 await expect(page.locator('.youth-keepsake')).toHaveCount(0)
 await expect(page.locator('.youth-live-canvas')).toHaveAttribute('aria-label',/担当。第二份修改后的文字/)
 await page.getByRole('button',{name:'生成我的青春纪念笺',exact:true}).click()
 await expect(page.locator('.youth-keepsake')).toHaveAttribute('alt',/担当。你的文字：第二份修改后的文字/)
})

test('Canvas不可用时保留书写和纯文字保存，示例不能导出为个人答卷',async({page})=>{
 await page.addInitScript(()=>{
  Object.defineProperty(HTMLCanvasElement.prototype,'getContext',{value:()=>null})
  Object.defineProperty(navigator,'clipboard',{configurable:true,value:undefined})
  document.execCommand=()=>false
 })
 await page.goto('/#legacy/answer')
 await expect(page.locator('.youth-preview-fallback')).toBeVisible()
 await page.getByRole('button',{name:'生成我的青春纪念笺',exact:true}).click()
 await expect(page.getByRole('status')).toContainText('先选一个')
 await expect(page.getByRole('link',{name:'保存纪念笺图片',exact:true})).toHaveCount(0)
 await page.getByRole('radio',{name:'力行',exact:true}).check()
 await page.locator('#youth-answer').fill('先认真完成一次实践。')
 await expect(page.locator('.youth-preview-fallback')).toContainText('先认真完成一次实践。')
 await page.getByRole('button',{name:'生成我的青春纪念笺',exact:true}).click()
 await expect(page.getByRole('status')).toContainText('请复制文字保存')
 await page.getByRole('button',{name:'先复制文字保存',exact:true}).click()
 await expect(page.getByRole('textbox',{name:'纪念文字（可全选复制）'})).toHaveValue(/先认真完成一次实践/)
})
