import { test, expect } from '@playwright/test'
import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { memorialPeople } from '../src/data/history/people/people'
import { personSourceById } from '../src/data/history/people/sources'
import rawEvents from '../src/data/history/map/events.json' with { type:'json' }
import { networkInterfaces } from 'node:os'
import type { Page } from '@playwright/test'
const loadWall = async(page:Page)=>{
  await expect(page.locator('.people-portrait')).toHaveCount(16)
  await page.locator('.people-portrait').last().scrollIntoViewIfNeeded()
  await expect.poll(()=>page.locator('.people-portrait img').evaluateAll(images=>images.every(img=>(img as HTMLImageElement).naturalWidth>0))).toBe(true)
  await page.locator('.people-scroll').evaluate(el=>{el.scrollTop=0})
}

test('人物、来源、事件关联与原件一致，不冒用L02或裁切合影', () => {
  expect(memorialPeople).toHaveLength(16)
  expect(new Set(memorialPeople.map(person => person.id)).size).toBe(16)
  const events = new Set(rawEvents.map(event => event.id))
  for (const person of memorialPeople) {
    expect(person.publicationStatus).toBe('draft')
    expect(personSourceById.has(person.portrait.sourceId)).toBe(true)
    expect(person.biography.length).toBeGreaterThan(20)
    expect(person.biographySourceIds.every(id=>personSourceById.has(id))).toBe(true)
    expect(existsSync('dist' + person.portrait.url)).toBe(true)
    for (const chapter of person.chapters) expect(chapter.sourceIds.every(id => personSourceById.has(id))).toBe(true)
    for(const moment of person.research!.moments){expect(moment.sourceIds.every(id=>personSourceById.has(id))).toBe(true);if(moment.mapEventId)expect(events.has(moment.mapEventId)).toBe(true)}
    for (const event of person.events) { expect(events.has(event.id)).toBe(true); expect(personSourceById.has(event.sourceId)).toBe(true) }
  }
  expect(memorialPeople[5]!.portrait.id).toContain('L-03')
  expect(memorialPeople[6]!.portrait.caption).toContain('合影')
  const {records:register} = JSON.parse(readFileSync('src/data/history/people/media-register.json','utf8')) as {records:{localPath:string;url:string;sha256:string}[]}
  for (const image of register) {
    const hash = (path: string) => createHash('sha256').update(readFileSync(path)).digest('hex')
    expect(hash(image.localPath)).toBe(image.sha256)
    expect(hash('dist'+image.url)).toBe(image.sha256)
  }
})

test('桌面纪念馆实照墙、独立档案、大图、目录、返回与键盘焦点', async ({ page },info) => {
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message))
  await page.emulateMedia({reducedMotion:'reduce'})
  await page.goto('/#people')
  await loadWall(page)
  await expect.poll(()=>page.locator('.people-portrait img').evaluateAll(images=>images.every(img=>(img as HTMLImageElement).naturalWidth>0))).toBe(true)
  expect(await page.locator('.people-portrait img').evaluateAll(items=>items.every(el=>{const img=el as HTMLImageElement;return img.naturalWidth===Number(img.getAttribute('width'))&&img.naturalHeight===Number(img.getAttribute('height'))}))).toBe(true)
  const positions=await page.locator('.people-portrait').evaluateAll(items=>items.map(el=>({x:el.getBoundingClientRect().x,y:el.getBoundingClientRect().y})))
  expect(new Set(positions.map(p=>Math.round(p.y))).size).toBe(4)
  expect(positions[3]!.x).toBeGreaterThan(positions[0]!.x)
  await page.evaluate(()=>document.fonts.ready)
  expect(await page.evaluate(()=>document.fonts.check('16px PeopleMemorialSerif','陈云稼祥恩来'))).toBe(true)
  await page.screenshot({path:`output/playwright/people-round2/${info.project.name}-wall.png`})
  await page.locator('.people-portrait').last().scrollIntoViewIfNeeded()
  await page.screenshot({path:`output/playwright/people-round2/${info.project.name}-wall-bottom.png`})
  await page.locator('.people-scroll').evaluate(el=>{el.scrollTop=0})
  await page.getByRole('link',{name:'阅读陈云人物档案',exact:true}).press('Enter')
  await expect(page).toHaveURL(/#people\/chen-yun$/)
  await expect(page.locator('.person-archive h1')).toBeFocused()
  await page.screenshot({path:`output/playwright/people-round2/${info.project.name}-chen.png`})
  await page.getByRole('button',{name:'放大陈云历史影像'}).click()
  await expect(page.getByRole('dialog',{name:'陈云完整历史影像'})).toBeVisible()
  await expect(page.getByRole('button',{name:'关闭影像 ×'})).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button',{name:'放大陈云历史影像'})).toBeFocused()
  await page.getByRole('button',{name:'亲历、传达与渡河组织',exact:true}).click()
  await expect(page.getByRole('heading',{name:'亲历、传达与渡河组织'})).toBeInViewport()
  await page.screenshot({path:`output/playwright/people-round2/${info.project.name}-reading.png`})
  await page.locator('.people-topbar').getByRole('button',{name:'关闭档案 ×'}).click()
  await expect(page.getByRole('link',{name:'阅读陈云人物档案',exact:true})).toBeFocused()
  expect(errors).toEqual([])
  await page.setViewportSize({width:1440,height:900})
  await page.screenshot({path:`output/playwright/people-round2/${info.project.name}-1440-wall.png`})
  expect(await page.locator('.people-scroll').evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true)
})

test('首次顺序显影、点击聚焦和中途取消、环境暂停与后台降级',async({page})=>{
  await page.goto('/#people')
  const root=page.locator('.people-memorial')
  await expect(page.locator('.people-portrait')).toHaveCount(16)
  const delays=await page.locator('.people-portrait').evaluateAll(items=>items.map(el=>parseFloat(getComputedStyle(el).animationDelay)))
  expect(delays[0]).toBeCloseTo(.8,2);expect(delays[15]!-delays[0]!).toBeCloseTo(1.2,2)
  await expect(root).toHaveAttribute('data-intro','done')
  await page.getByRole('button',{name:'暂停环境光'}).click()
  await expect(root).toHaveAttribute('data-ambient','paused')
  await page.getByRole('button',{name:'播放环境光'}).click()
  await expect(root).toHaveAttribute('data-ambient','running')
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'))})
  await expect(root).toHaveAttribute('data-ambient','paused')
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{value:false,configurable:true});document.dispatchEvent(new Event('visibilitychange'))})
  await page.getByRole('link',{name:'阅读毛泽东人物档案'}).click()
  await expect(root).toHaveAttribute('data-focus','mao-zedong')
  await expect(page.locator('.people-portrait[data-person="mao-zedong"]')).toHaveAttribute('data-selected','true')
  await expect(page.locator('.person-archive h1')).toHaveText('毛泽东')
  await expect(root).toHaveAttribute('data-transition','idle')
  await page.goBack()
  await expect(root).toHaveAttribute('data-intro','done')
  await page.getByRole('link',{name:'阅读张闻天人物档案'}).click()
  await page.keyboard.press('Escape')
  await expect(root).toHaveAttribute('data-transition','idle')
  await expect(root).toHaveAttribute('data-focus','')
  await page.evaluate(()=>{(document.querySelector('[data-person="zhang-wentian"]') as HTMLAnchorElement).click();Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'))})
  await expect(root).toHaveAttribute('data-focus','')
  await page.waitForTimeout(1100)
  await expect(page).toHaveURL(/#people$/)
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{value:false,configurable:true});document.dispatchEvent(new Event('visibilitychange'))})
  await page.getByRole('link',{name:'阅读周恩来人物档案'}).click()
  await page.locator('.people-topbar').getByRole('link',{name:'返回首页',exact:true}).click()
  await page.waitForTimeout(1200)
  await expect(page).toHaveURL(/#home$/)
  await expect(root).toHaveAttribute('data-ambient','paused')
})

test('localhost与真实WiFi地址的电脑/横屏模拟十六人影像一致',async({browser},info)=>{
  const ip=Object.values(networkInterfaces()).flat().find(n=>n?.family==='IPv4'&&!n.internal&&n.mac!=='00:00:00:00:00:00')?.address
  expect(ip).toBeTruthy()
  const lan=process.env.LAN_TEST_URL??`http://${ip}:4173`
  for(const [label,origin,mobile] of [['localhost','http://localhost:4173',false],['lan-desktop',lan,false],['lan-mobile',lan,true]] as const){
    const context=await browser.newContext({viewport:mobile?{width:844,height:390}:{width:1440,height:900},hasTouch:mobile,isMobile:mobile,reducedMotion:'reduce'})
    const page=await context.newPage();await page.goto(origin+'/#people')
    await loadWall(page)
    await expect.poll(()=>page.locator('.people-portrait img').evaluateAll(items=>items.every(img=>(img as HTMLImageElement).complete&&(img as HTMLImageElement).naturalWidth>0))).toBe(true)
    for(const person of memorialPeople){
      const response=await context.request.get(origin+person.portrait.url)
      expect(response.status()).toBe(200)
      expect(response.headers()['content-type']).toMatch(/^image\//)
      expect(createHash('sha256').update(await response.body()).digest('hex')).toBe(createHash('sha256').update(readFileSync('dist'+person.portrait.url)).digest('hex'))
    }
    await page.screenshot({path:`output/playwright/people-round2/${info.project.name}-${label}.png`})
    await context.close()
  }
})

test('人物关联复用地图实例与选择逻辑，回退保留独立人物档案',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'})
  await page.goto('/#map')
  await expect(page.locator('.history-map-canvas')).toHaveAttribute('data-map-state','local')
  await page.locator('.history-map-canvas').evaluate(el=>el.setAttribute('data-preserved','yes'))
  await page.getByRole('link',{name:'返回首页',exact:true}).click()
  await page.getByRole('navigation',{name:'主导航'}).getByRole('link',{name:'英雄人物',exact:true}).click()
  await page.getByRole('link',{name:'阅读刘伯承人物档案'}).click()
  await page.locator('.person-events').getByRole('link',{name:/巧渡金沙江/}).click()
  await expect(page).toHaveURL(/#map\?event=EVT-042$/)
  await expect(page.locator('.history-map-canvas')).toHaveAttribute('data-preserved','yes')
  await expect(page.locator('.history-detail h2')).toHaveText('巧渡金沙江')
  await page.goBack()
  await expect(page.locator('.person-archive h1')).toHaveText('刘伯承')
  await page.reload()
  await expect(page.locator('.person-archive h1')).toHaveText('刘伯承')
})

test('图片失败有文字降级，十六份正文与来源可独立访问',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'})
  await page.route('**/people-media/POR-ZHANG-01.jpg',route=>route.abort())
  await page.goto('/#people')
  await expect(page.getByRole('img',{name:'张闻天的历史影像暂未加载'})).toBeVisible()
  await page.getByRole('link',{name:'阅读张闻天人物档案'}).click()
  await expect(page.locator('.person-archive h1')).toHaveText('张闻天')
  for(const person of memorialPeople){
    await page.goto(`/#people/${person.id}`)
    await expect(page.locator('.person-chapter')).toHaveCount(person.chapters.length)
    await page.locator('.person-sources summary').click()
    await expect(page.locator('.person-sources')).toContainText(person.portrait.date)
    expect(await page.locator('.people-scroll').evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true)
  }
})

for(const [width,height] of [[932,430],[844,390],[740,320],[667,375]])test(`横屏${width}四列四排、触摸档案并列、旋转不丢人`,async({browser},info)=>{
  const context=await browser.newContext({viewport:{width,height},hasTouch:true,isMobile:true,reducedMotion:'reduce',baseURL:'http://127.0.0.1:4173'})
  const page=await context.newPage();await page.goto('/#people')
  await expect(page.locator('html')).toHaveAttribute('data-compact','true')
  await loadWall(page)
  const xs=await page.locator('.people-portrait').evaluateAll(items=>items.map(el=>Math.round(el.getBoundingClientRect().x)))
  expect(new Set(xs).size).toBe(4)
  expect(await page.locator('.people-scroll').evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true)
  await expect.poll(()=>page.locator('.people-portrait img').evaluateAll(imgs=>imgs.every(img=>(img as HTMLImageElement).naturalWidth>0))).toBe(true)
  await page.evaluate(()=>document.fonts.ready)
  await page.screenshot({path:`output/playwright/people-round2/${info.project.name}-${width}-wall.png`})
  await page.locator('.people-portrait').last().scrollIntoViewIfNeeded()
  await page.screenshot({path:`output/playwright/people-round2/${info.project.name}-${width}-wall-bottom.png`})
  await page.locator('.people-scroll').evaluate(el=>{el.scrollTop=0})
  await page.getByRole('link',{name:'阅读周恩来人物档案'}).tap()
  const pic=(await page.locator('.person-archive-portrait').boundingBox())!,text=(await page.locator('.person-archive-heading').boundingBox())!
  expect(pic.x+pic.width).toBeLessThan(text.x+1)
  await expect(page.locator('.person-archive h1')).toBeInViewport()
  await page.screenshot({path:`output/playwright/people-round2/${info.project.name}-${width}-profile.png`})
  await page.getByRole('button',{name:'放大周恩来历史影像'}).tap()
  await expect(page.getByRole('button',{name:'关闭影像 ×'})).toBeInViewport({ratio:1})
  await page.getByRole('button',{name:'关闭影像 ×'}).tap()
  await page.setViewportSize({width:390,height:844})
  await page.getByRole('button',{name:'继续竖屏浏览'}).click()
  await expect(page.locator('.person-archive h1')).toHaveText('周恩来')
  await page.setViewportSize({width,height})
  await expect(page.locator('.person-archive h1')).toHaveText('周恩来')
  await page.locator('.people-topbar').getByRole('button',{name:'关闭档案 ×'}).tap()
  await context.close()
})
