import { test, expect } from '@playwright/test'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { networkInterfaces } from 'node:os'
import { legacyChapters, spiritDimensions, youthKeywords } from '../src/data/history/legacy/content'
import events from '../src/data/history/map/events.json' with {type:'json'}

const evidence=process.env.LEGACY_EVIDENCE_DIR??'output/playwright/legacy'
const media=JSON.parse(readFileSync('src/data/history/legacy/media-register.json','utf8')) as {id:string;displayPath:string;displaySha256:string;width:number;height:number}[]

for(const [width,height] of [[1920,1080],[1440,900],[932,430],[844,390],[740,320],[667,375]]) {
 test(`六场景与答卷双端矩阵 ${width}×${height}`,async({browser},info)=>{
  test.setTimeout(90_000)
  const context=await browser.newContext({viewport:{width,height},hasTouch:width<1000,isMobile:width<1000,reducedMotion:'reduce',baseURL:'http://127.0.0.1:4173'})
  const page=await context.newPage(),errors:string[]=[]
  page.on('pageerror',error=>errors.push(error.message))
  await page.goto('/#legacy')
  await expect(page.locator('.legacy-page')).toBeVisible()
  await page.evaluate(()=>document.fonts.ready)
  await expect(page.locator('[data-legacy-scene]')).toHaveCount(6)
  for(const item of legacyChapters){
   await page.evaluate(id=>{location.hash=`legacy/${id}`},item.id)
   const scene=page.locator(`#legacy-${item.id}`)
   await expect(scene).toBeInViewport()
   for(const img of await scene.locator('img').all()){
    await img.scrollIntoViewIfNeeded()
    await expect.poll(()=>img.evaluate(el=>(el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
   }
   await scene.evaluate(el=>el.scrollIntoView({block:'start'}))
   if(item.id==='entrust'&&width===740){
    await expect(scene.locator('h2')).toBeInViewport({ratio:1})
    await expect(scene.locator('.legacy-jiang img')).toBeInViewport({ratio:1})
   }
   await expect.poll(()=>page.locator('.legacy-scroll').evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true)
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true)
   await page.screenshot({path:`${evidence}/${info.project.name}-${width}-${item.id}.png`})
   if(item.id==='road'&&(width===1440||width===844)){
    const entries=scene.locator('.legacy-road-entry')
    for(let index=0;index<await entries.count();index++){
     await entries.nth(index).scrollIntoViewIfNeeded()
     await page.screenshot({path:`${evidence}/${info.project.name}-${width}-spirit-${index+1}.png`})
    }
   }
  }
  // 横屏必须保持图文、肖像/遗训、答卷双栏；不通过缩放桌面实现。
  if(width<1000){
   for(const selector of ['.legacy-road-entry','.legacy-entrust-composition','.youth-workbench']){
    expect(await page.locator(selector).first().evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length)).toBeGreaterThan(1)
   }
   const nav=page.getByRole('navigation',{name:'精神传承导航'})
   for(const link of await nav.locator('a,button').all()){
    await expect(link).toBeInViewport({ratio:.98})
    const box=(await link.boundingBox())!;expect(box.height).toBeGreaterThanOrEqual(44);expect(box.width).toBeGreaterThanOrEqual(44)
   }
  }
  await page.evaluate(()=>{location.hash='legacy/answer'})
  for(const keyword of youthKeywords){const radio=page.getByRole('radio',{name:keyword.word,exact:true});if(width<1000)await radio.tap();else await radio.check();await expect(page.locator('.youth-meaning')).toHaveText(keyword.meaning)}
  const field=page.getByRole('textbox',{name:'在杭电的这几年，我希望……',exact:true})
  await field.fill('把所学做成真正能帮助别人的作品。\n也为自己保留探索未知的勇气。')
  await field.scrollIntoViewIfNeeded()
  await page.screenshot({path:`${evidence}/${info.project.name}-${width}-writing.png`})
  await page.getByRole('button',{name:'生成我的青春纪念笺',exact:true}).click()
  await expect(page.locator('.youth-keepsake')).toBeVisible()
  await expect.poll(()=>page.locator('.youth-keepsake').evaluate(el=>(el as HTMLImageElement).naturalWidth)).toBe(1080)
  await page.locator('.youth-keepsake').scrollIntoViewIfNeeded()
  await page.screenshot({path:`${evidence}/${info.project.name}-${width}-keepsake.png`})
  await page.getByRole('link',{name:'保存纪念笺图片',exact:true}).scrollIntoViewIfNeeded()
  const downloadPromise=page.waitForEvent('download')
  await page.getByRole('link',{name:'保存纪念笺图片',exact:true}).click()
  const download=await downloadPromise
  expect(download.suggestedFilename()).toBe('2026-青春纪念笺-担当.png')
  await download.saveAs(`${evidence}/${info.project.name}-${width}-keepsake.png.export.png`)
  await page.getByRole('button',{name:'重新书写',exact:true}).click()
  await expect(field).toHaveValue('把所学做成真正能帮助别人的作品。\n也为自己保留探索未知的勇气。')
  await page.getByRole('link',{name:'此刻留白，继续读尾声'}).click()
  await expect(page).toHaveURL(/#legacy\/epilogue$/)
  await page.getByRole('link',{name:'重温伟大征程',exact:true}).click()
  await expect(page.locator('#home')).toBeVisible()
  expect(errors).toEqual([])
  await context.close()
 })
}

test('200字、换行、输入法、HTML纯文本和复制备用，无用户文字网络请求',async({page},info)=>{
 await page.emulateMedia({reducedMotion:'reduce'})
 const sent:string[]=[];page.on('request',r=>{sent.push(r.url()+' '+(r.postData()??''))})
 await page.goto('/#legacy/answer')
 await page.getByRole('button',{name:'生成我的青春纪念笺'}).click()
 await expect(page.getByRole('status')).toContainText('先选一个')
 await page.getByRole('radio',{name:'笃学',exact:true}).check()
 await page.getByRole('button',{name:'生成我的青春纪念笺'}).click()
 const field=page.locator('#youth-answer')
 await expect(field).toBeFocused()
 await field.dispatchEvent('compositionstart')
 await field.fill('学'.repeat(201))
 await expect(field).toHaveValue('学'.repeat(201))
 await field.dispatchEvent('compositionend')
 await expect(field).toHaveValue('学'.repeat(200))
 await expect(page.locator('#youth-count')).toContainText('200 / 200')
 const text='<img src=x onerror=alert(1)> 青春私有文字987\n'+ '知行合一'.repeat(60)
 await field.fill(text)
 await expect(page.locator('#youth-count')).toContainText('200 / 200')
 const accepted=await field.inputValue()
 await page.getByRole('button',{name:'生成我的青春纪念笺'}).click()
 await expect(page.locator('.youth-keepsake')).toBeVisible()
 const png=await page.locator('.youth-keepsake').evaluate(async el=>Array.from(new Uint8Array(await (await fetch((el as HTMLImageElement).src)).arrayBuffer())))
 writeFileSync(`${evidence}/${info.project.name}-200-chars.png`,Buffer.from(png))
 expect(Buffer.from(png).subarray(1,4).toString()).toBe('PNG')
 expect(await page.locator('.youth-keepsake').evaluate(el=>(el as HTMLImageElement).naturalHeight)).toBeGreaterThanOrEqual(1440)
 await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:undefined});document.execCommand=()=>false})
 await page.getByRole('button',{name:'复制纪念文字'}).click()
 expect(await page.getByRole('textbox',{name:'纪念文字（可全选复制）'}).inputValue()).toContain(accepted)
 await expect(page.getByRole('status')).toHaveText('请在下方文字中全选并复制。')
 expect(sent.filter(s=>s.includes('青春私有文字987'))).toEqual([])
 expect(await page.locator('.youth-result img').count()).toBe(1)
 await page.getByRole('button',{name:'重新书写'}).click()
 await expect(field).toHaveValue(accepted)
 // 极端换行也完整导出，不让正文压住页脚。
 await field.fill('一\n'.repeat(99)+'终')
 await page.getByRole('button',{name:'生成我的青春纪念笺'}).click()
 await expect(page.locator('.youth-keepsake')).toBeVisible()
 expect(await page.locator('.youth-keepsake').evaluate(el=>(el as HTMLImageElement).naturalHeight)).toBe(6130)
 await page.reload()
 await expect(page.locator('.youth-keepsake')).toHaveCount(0)
 await expect(page.locator('#youth-answer')).toHaveCount(0)
})

test('Canvas失败可重试、复制文字；图片故障保留正文，缺字体仍生成',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'})
 await page.addInitScript(()=>Object.defineProperty(Intl,'Segmenter',{configurable:true,value:undefined}))
 await page.route('**/legacy-media/jiang-baozeng.jpg',route=>route.abort())
 await page.route('**/legacy-*.woff2',route=>route.abort())
 await page.goto('/#legacy/entrust')
 await expect(page.locator('.legacy-jiang')).toContainText('暂未加载')
 await expect(page.locator('.legacy-entrust-words')).toContainText('国家大事')
 await page.evaluate(()=>{location.hash='legacy/answer'})
 await page.getByRole('radio',{name:'力行',exact:true}).check()
 await page.locator('#youth-answer').fill('先从实践开始。')
 await page.evaluate(()=>{const original=HTMLCanvasElement.prototype.toBlob;Object.assign(window,{legacyOriginalToBlob:original});HTMLCanvasElement.prototype.toBlob=function(cb){cb(null)}})
 await page.getByRole('button',{name:'生成我的青春纪念笺'}).click()
 await expect(page.getByRole('status')).toContainText('图片暂未导出')
 await expect(page.getByRole('button',{name:'先复制文字保存'})).toBeVisible()
 await page.evaluate(()=>{HTMLCanvasElement.prototype.toBlob=(window as unknown as {legacyOriginalToBlob:typeof HTMLCanvasElement.prototype.toBlob}).legacyOriginalToBlob})
 await page.getByRole('button',{name:'生成我的青春纪念笺'}).click()
 await expect(page.locator('.youth-keepsake')).toBeVisible()
})

test('键盘关键词选择、缩短可视高度后仍可编辑和导出，原生剪贴板成功',async({browser},info)=>{
 const context=await browser.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true,reducedMotion:'reduce',permissions:['clipboard-read','clipboard-write'],baseURL:'http://127.0.0.1:4173'})
 const page=await context.newPage();await page.goto('/#legacy/answer')
 await page.getByRole('radio',{name:'笃学',exact:true}).focus();await page.keyboard.press('ArrowRight')
 await expect(page.getByRole('radio',{name:'力行',exact:true})).toBeChecked()
 await page.locator('#youth-answer').fill('保持思考，也动手解决问题。')
 await page.setViewportSize({width:844,height:220})
 await page.locator('#youth-answer').focus();await page.keyboard.press('End');await page.keyboard.type('2026')
 await expect(page.locator('#youth-answer')).toHaveValue('保持思考，也动手解决问题。2026')
 await page.getByRole('button',{name:'生成我的青春纪念笺'}).click()
 await expect(page.locator('.youth-keepsake')).toBeVisible()
 await page.getByRole('button',{name:'复制纪念文字'}).click()
 await expect(page.getByRole('status')).toHaveText('纪念文字已复制。')
 expect(await page.evaluate(()=>navigator.clipboard.readText())).toContain('保持思考，也动手解决问题。2026')
 await page.setViewportSize({width:844,height:390})
 await page.locator('.youth-keepsake').scrollIntoViewIfNeeded()
 await page.screenshot({path:`${evidence}/${info.project.name}-dynamic-height.png`})
 await context.close()
})

test('影像键盘关闭恢复焦点、旧入口/章节刷新与前后退',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'})
 await page.goto('/#entrance-legacy')
 await expect(page).toHaveURL(/#legacy$/)
 await page.locator('.legacy-chapter-nav a[href="#legacy/entrust"]').click()
 await expect(page.locator('#legacy-entrust-title')).toBeFocused()
 await page.reload()
 await expect(page.locator('#legacy-entrust-title')).toBeInViewport()
 const photo=page.getByRole('button',{name:'查看完整影像：蒋葆增先生历史肖像',exact:true})
 await photo.click();await expect(page.getByRole('dialog')).toBeVisible()
 await expect(page.getByRole('button',{name:'关闭影像 ×'})).toBeFocused()
 await page.keyboard.press('Escape')
 await expect(page.getByRole('dialog')).toBeHidden();await expect(photo).toBeFocused()
 await page.evaluate(()=>{location.hash='legacy/answer'})
 await page.getByRole('link',{name:'此刻留白，继续读尾声'}).click()
 await page.goBack();await expect(page.locator('#legacy-answer-title')).toBeFocused()
 await page.goForward();await expect(page.locator('#legacy-end-title')).toBeFocused()
})

test('八个精神事件链接命中现有事件及正确日期，返回保留阅读',async({page})=>{
 test.setTimeout(90_000)
 await page.emulateMedia({reducedMotion:'reduce'})
 await page.goto('/#legacy/road')
 for(const dimension of spiritDimensions){
  const ids=[dimension.eventId,...('extraEventId' in dimension?[dimension.extraEventId]:[])]
  for(const id of ids){
   const event=events.find(e=>e.id===id)!
   expect(event).toBeTruthy()
   const link=page.locator(`.legacy-event-links a[href="#map?event=${id}"]`)
   await link.click()
   await expect(page.locator('.history-detail h2')).toHaveText(event.title)
   await expect(page.locator('.unified-timeline')).toHaveAttribute('data-current-day',String(Math.floor(Date.parse(event.start_date+'T00:00:00Z')/86400000)))
   await page.goBack()
   await expect(page.locator('.legacy-page')).toBeVisible()
  }
 }
})

for(const [width,height] of [[1440,900],[667,375]])test(`跨四章导航保留地图实例/日期/相机、答卷与旋转 ${width}`,async({browser})=>{
 test.setTimeout(60_000)
 const context=await browser.newContext({viewport:{width,height},isMobile:width<1000,hasTouch:width<1000,reducedMotion:'reduce',baseURL:'http://127.0.0.1:4173'})
 const page=await context.newPage();await page.goto('/#map')
 const map=page.locator('.history-map-canvas');await expect(map).toHaveAttribute('data-map-state','local')
 if(width<1000)await page.getByRole('button',{name:'部队与图例',exact:true}).tap()
 await page.locator('.army-control input').nth(1).uncheck()
 const filters=await page.locator('.army-control input').evaluateAll(items=>items.map(el=>(el as HTMLInputElement).checked))
 if(width<1000)await page.getByRole('button',{name:'收起资料面板',exact:true}).tap()
 await page.getByRole('slider',{name:'全局历史日期'}).fill(String(Math.floor(Date.parse('1935-05-03T00:00:00Z')/86400000)))
 await page.getByRole('button',{name:'放大地图',exact:true}).click();await page.waitForTimeout(500)
 const state=await map.evaluate(el=>({day:document.querySelector('.unified-timeline')!.getAttribute('data-current-day'),center:el.getAttribute('data-center'),zoom:el.getAttribute('data-zoom')}))
 const canvas=await map.locator('canvas').elementHandle()
 const nav=page.getByRole('navigation',{name:'地图导航'}).getByRole('link',{name:'精神传承',exact:true})
 await expect(nav).toBeInViewport({ratio:.98});await nav.click()
 await page.evaluate(()=>{location.hash='legacy/answer'})
 await page.getByRole('radio',{name:'求新',exact:true}).check();await page.locator('#youth-answer').fill('转向之后，仍记得自己的问题。')
 await page.setViewportSize({width:390,height:844})
 const guide=page.getByRole('button',{name:'继续竖屏浏览'});if(await guide.isVisible())await guide.click()
 await expect(page.locator('#youth-answer')).toHaveValue('转向之后，仍记得自己的问题。')
 await page.setViewportSize({width,height})
 await page.getByRole('navigation',{name:'精神传承导航'}).getByRole('link',{name:'英雄人物',exact:true}).click()
 await expect(page.locator('.people-portrait')).toHaveCount(16)
 await page.locator('.people-topbar').getByRole('link',{name:'精神传承',exact:true}).click()
 await page.evaluate(()=>{location.hash='legacy/answer'})
 await expect(page.locator('#youth-answer')).toHaveValue('转向之后，仍记得自己的问题。')
 await page.getByRole('navigation',{name:'精神传承导航'}).getByRole('link',{name:'时空长征',exact:true}).click()
 await expect(map).toHaveAttribute('data-center',state.center!);await expect(map).toHaveAttribute('data-zoom',state.zoom!)
 await expect(page.locator('.unified-timeline')).toHaveAttribute('data-current-day',state.day!)
 expect(await page.locator('.army-control input').evaluateAll(items=>items.map(el=>(el as HTMLInputElement).checked))).toEqual(filters)
 expect(await canvas!.evaluate(el=>el===document.querySelector('.history-map-canvas canvas'))).toBe(true)
 await context.close()
})

test('localhost和校园网HTTP三种来源六份登记图及当前精神维度图一致，输入不外发',async({browser},info)=>{
 test.setTimeout(90_000)
 const address=Object.values(networkInterfaces()).flat().find(n=>n?.family==='IPv4'&&!n.internal&&n.mac!=='00:00:00:00:00:00')?.address
 const lan=process.env.LAN_TEST_URL??`http://${address}:4173`
 for(const [label,origin,mobile] of [['localhost','http://localhost:4173',false],['lan-desktop',lan,false],['lan-mobile',lan,true]] as const){
  const context=await browser.newContext({viewport:mobile?{width:844,height:390}:{width:1440,height:900},hasTouch:mobile,isMobile:mobile,reducedMotion:'reduce'})
  const page=await context.newPage();await page.goto(origin+'/#legacy/entrust')
  for(const item of media){
   const path=item.displayPath.replace(/^public/,'');const response=await context.request.get(origin+path)
   expect(response.ok(),item.id).toBe(true);expect(response.headers()['content-type']).toMatch(/^image\//)
   expect(createHash('sha256').update(await response.body()).digest('hex')).toBe(item.displaySha256)
   expect(createHash('sha256').update(readFileSync('dist'+path)).digest('hex')).toBe(item.displaySha256)
  }
  const paths=[...media.map(item=>item.displayPath.replace(/^public/,'')),...spiritDimensions.map(item=>item.image)]
  expect(await page.evaluate(async paths=>{const bad:string[]=[];for(const path of paths){const image=new Image();image.src=path;try{await image.decode()}catch{bad.push(path)}}return bad},paths)).toEqual([])
  await page.screenshot({path:`${evidence}/${info.project.name}-${label}-parity.png`})
  for(const path of ['/research/legacy_20261117/originals/jiang-baozeng.jpg','/.git/config','/.env','/src/data/history/legacy/media-register.json']){
   const response=await context.request.get(origin+path);expect(response.headers()['content-type']??'').not.toContain('image/');expect(await response.text()).not.toContain('originalPath')
  }
  await page.evaluate(()=>{location.hash='legacy/answer'})
  await page.getByRole('radio',{name:'担当',exact:true}).check();await page.locator('#youth-answer').fill('局域网中也能把答卷保存在本机。')
  await page.getByRole('button',{name:'生成我的青春纪念笺'}).click();await expect(page.locator('.youth-keepsake')).toBeVisible()
  if(mobile){await page.getByRole('button',{name:'复制纪念文字'}).click();await expect(page.getByRole('textbox',{name:'纪念文字（可全选复制）'})).toBeVisible()}
  await context.close()
 }
})
