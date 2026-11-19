import { test, expect } from '@playwright/test'
import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { networkInterfaces } from 'node:os'
import files from '../src/data/history/map/media-files.json' with { type: 'json' }
import { migratedEventIds } from '../src/features/history-map/exhibitionDefinitions'
import { exhibitionImages } from '../src/features/history-map/archiveContent'
import { eventById } from '../src/features/history-map/data'

const address = Object.values(networkInterfaces()).flat().find(n => n?.family === 'IPv4' && !n.internal && n.mac !== '00:00:00:00:00:00')?.address
const lan = process.env.LAN_TEST_URL ?? `http://${address}:4173`
const manifest = JSON.parse(readFileSync('research/overnight_20261110/images/data/download-results.json','utf8')) as {id:string;sha256:string}[]

for (const [label,origin,mobile] of [['localhost','http://localhost:4173',false],['lan-desktop',lan,false],['lan-mobile-simulation',lan,true]] as const) {
  test(`${label}：全部91图片可解码，正文/图片/四渡/切换/滚动一致`,async({browser},info)=>{
    test.setTimeout(180_000)
    const context = await browser.newContext({viewport:mobile?{width:844,height:390}:{width:1440,height:900},hasTouch:mobile,isMobile:mobile})
    const page=await context.newPage()
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message))
    await page.goto(origin+'/?review=0#map')
    await expect(page.locator('.history-map-canvas')).toHaveAttribute('data-map-state','local')
    for(const [id,path] of Object.entries(files)) {
      expect(path.startsWith('/history-media/')).toBe(true)
      const response=await context.request.get(origin+path)
      expect(response.ok(),id).toBe(true)
      expect(response.headers()['content-type']).toMatch(/^image\/(jpeg|png)/)
      const bytes=await response.body()
      expect(createHash('sha256').update(bytes).digest('hex'),id).toBe(manifest.find(x=>x.id===id)!.sha256)
      expect(existsSync('dist'+path),id).toBe(true)
      expect(createHash('sha256').update(readFileSync('dist'+path)).digest('hex'),id).toBe(manifest.find(x=>x.id===id)!.sha256)
    }
    const decoded=await page.evaluate(async paths=>{
      const bad:string[]=[]
      for(const path of paths){const img=new Image();img.src=path;try{await img.decode();if(!img.naturalWidth)bad.push(path)}catch{bad.push(path)}}
      return bad
    },Object.values(files))
    expect(decoded).toEqual([])
    const cdp=await context.newCDPSession(page)
    await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true})
    if(mobile)await page.getByRole('button',{name:'历史资料',exact:true}).click()
    for(const id of [...new Set(['EVT-023','EVT-058',...migratedEventIds,'EVT-056','EVT-057','EVT-006'])]){
      const back=page.getByRole('button',{name:'关闭事件详情'});if(await back.isVisible())await back.click()
      await page.getByRole('searchbox').fill(id);await page.locator('.history-event-list button').click()
      await page.getByRole('button',{name:'深入了解'}).click()
      const scroll=page.locator('.archive-scroll')
      await scroll.evaluate(el=>{el.scrollTop=el.scrollHeight})
      const images=scroll.locator('img')
      await expect(images).toHaveCount(exhibitionImages(eventById.get(id)!,true).length)
      for(let i=0;i<await images.count();i++){
        await images.nth(i).scrollIntoViewIfNeeded()
        await expect(images.nth(i)).toBeVisible()
        await expect.poll(()=>images.nth(i).evaluate(el=>(el as HTMLImageElement).complete&&(el as HTMLImageElement).naturalWidth>0)).toBe(true)
        const src=await images.nth(i).getAttribute('src');expect(src).toMatch(/^\/history-media\//)
      }
      if(id==='EVT-058')await expect(page.locator('.adaptive-module')).toHaveCount(7)
      if(id==='EVT-023')await page.screenshot({path:`output/playwright/content-parity/${info.project.name}-${label}-event.png`})
      await page.getByRole('button',{name:'关闭历史档案'}).click()
    }
    await page.getByRole('button',{name:'关闭事件详情'}).click()
    await page.getByRole('searchbox').fill('EVT-023');await page.locator('.history-event-list button').click()
    await page.getByRole('button',{name:'走进四渡赤水，阅读四渡赤水完整专题'}).click()
    await expect(page.locator('.campaign-reading-layout')).toBeVisible()
    for(const img of await page.locator('.chishui-campaign img').all()){
      await img.scrollIntoViewIfNeeded();await expect.poll(()=>img.evaluate(el=>(el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
    }
    await page.screenshot({path:`output/playwright/content-parity/${info.project.name}-${label}-campaign.png`})
    for(const path of ['/history-media/no.jpg','/__research-media/../../.env','/.git/config','/research/overnight_20261110/images/data/download-results.json']){
      const r=await context.request.get(origin+path)
      expect(r.headers()['content-type']??'').not.toContain('image/')
      expect(await r.text()).not.toContain('localPath')
    }
    expect(errors).toEqual([])
    await context.close()
  })
}
