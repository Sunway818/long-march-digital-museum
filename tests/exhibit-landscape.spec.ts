import { test, expect, type Page } from '@playwright/test'
import { migratedEventIds } from '../src/features/history-map/exhibitionDefinitions'

async function mapPage(page:Page){await page.goto('/#map');await expect(page.locator('.history-map-canvas')).toHaveAttribute('data-map-state','local')}
async function pick(page:Page,id:string){
  const close=page.getByRole('button',{name:'关闭事件详情'});if(await close.isVisible())await close.click()
  if(!await page.getByRole('searchbox').isVisible())await page.getByRole('button',{name:'历史资料',exact:true}).click()
  await page.getByRole('searchbox').fill(id);await page.locator('.history-event-list button').click()
}
async function campaign(page:Page){await pick(page,'EVT-023');await page.getByRole('button',{name:'走进四渡赤水，阅读四渡赤水完整专题'}).click()}
for(const [width,height] of [[932,430],[844,390],[740,320],[667,375]])test(`横屏${width}：首屏图文同现、交错章节、完整图片和返回`,async({browser},info)=>{
  const context=await browser.newContext({viewport:{width,height},hasTouch:true,isMobile:true,baseURL:'http://127.0.0.1:4173'})
  const page=await context.newPage();await mapPage(page);await campaign(page)
  const opening=page.locator('.chishui-campaign>.exhibit-opening')
  await expect(opening.locator('h2')).toBeInViewport({ratio:1})
  await expect(opening.locator('.exhibit-opening-line')).toBeInViewport({ratio:1})
  await expect(opening.locator('img')).toBeInViewport({ratio:1})
  const copy=(await opening.locator('.exhibit-opening-copy').boundingBox())!,image=(await opening.locator('.exhibit-opening-image').boundingBox())!
  expect(copy.x+copy.width).toBeLessThanOrEqual(image.x+1)
  expect(image.y).toBeLessThan(height/2)
  await expect(opening.locator('img')).toHaveCSS('object-fit','contain')
  await page.evaluate(()=>document.fonts.ready)
  await page.screenshot({path:`output/playwright/exhibit-layout/${info.project.name}-${width}-opening.png`})
  for(const [label,id] of [['一渡','first'],['二渡','second']]){
    await page.locator('.campaign-chapter-nav').getByRole('button',{name:label,exact:true}).click()
    const pair=page.locator(`.campaign-scene-${id} .campaign-scene-pair`)
    const text=(await pair.locator('.campaign-scene-text').boundingBox())!,pictures=(await pair.locator('.campaign-scene-images').boundingBox())!
    if(id==='first')expect(text.x+text.width).toBeLessThanOrEqual(pictures.x+1)
    else expect(pictures.x+pictures.width).toBeLessThanOrEqual(text.x+1)
    await page.screenshot({path:`output/playwright/exhibit-layout/${info.project.name}-${width}-${id}.png`})
  }
  await page.locator('.campaign-scene-second .exhibit-image-open').first().click()
  await expect(page.getByRole('button',{name:'关闭图片',exact:true})).toBeInViewport({ratio:1})
  await page.getByRole('button',{name:'关闭图片',exact:true}).click()
  expect(await page.locator('.archive-scroll').evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true)
  await page.getByRole('button',{name:'关闭历史档案'}).click()
  await expect(page.locator('.history-map-canvas')).toHaveAttribute('data-map-state','local')
  await context.close()
})
test('所有已配置展厅及旧档案横屏结构保留，档案无图不填图',async({browser})=>{
  test.setTimeout(90_000)
  const context=await browser.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true,baseURL:'http://127.0.0.1:4173'})
  const page=await context.newPage();await mapPage(page)
  for(const id of [...new Set([...migratedEventIds,'EVT-023','EVT-056','EVT-057','EVT-058','EVT-006'])]){
    await pick(page,id);await page.getByRole('button',{name:'深入了解'}).click()
    const hero=page.locator('.exhibit-opening-image')
    if(await hero.count()){
      const c=(await page.locator('.exhibit-opening-copy').boundingBox())!,i=(await hero.boundingBox())!
      expect(c.x+c.width,id).toBeLessThanOrEqual(i.x+1)
      await expect(hero.locator('img')).toBeInViewport({ratio:1})
    }
    if(['EVT-056','EVT-057','EVT-058'].includes(id))await expect(page.locator('.adaptive-opening')).toBeVisible()
    expect(await page.locator('.archive-scroll').evaluate(el=>el.scrollWidth<=el.clientWidth+1),id).toBe(true)
    await page.getByRole('button',{name:'关闭历史档案'}).click()
  }
  await context.close()
})
test('竖屏保持图文堆叠，旋转后同一展厅改为并列',async({browser})=>{
  const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,baseURL:'http://127.0.0.1:4173'})
  const page=await context.newPage();await mapPage(page)
  await page.getByRole('button',{name:'继续竖屏浏览'}).click();await campaign(page)
  const article=await page.locator('.chishui-campaign').elementHandle()
  await expect(page.locator('.chishui-campaign>.exhibit-opening')).toHaveCSS('flex-direction','column')
  await page.setViewportSize({width:844,height:390})
  await expect(page.locator('.chishui-campaign>.exhibit-opening')).toHaveCSS('display','grid')
  expect(await article!.evaluate(el=>el.isConnected)).toBe(true)
  await context.close()
})
test('桌面1920及1440保持原影像叠合开篇与章节地图双栏',async({page},info)=>{
  for(const [width,height] of [[1920,1080],[1440,900]]){
    await page.setViewportSize({width,height});await mapPage(page);await campaign(page)
    await expect(page.locator('.chishui-campaign .exhibit-opening-image')).toHaveCSS('position','absolute')
    await expect(page.locator('.campaign-scene-pair').first()).toHaveCSS('display','contents')
    await page.screenshot({path:`output/playwright/exhibit-layout/${info.project.name}-${width}-desktop.png`})
    await page.getByRole('button',{name:'关闭历史档案'}).click()
  }
})
