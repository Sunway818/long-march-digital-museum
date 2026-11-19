import { test, expect } from '@playwright/test'
import { writeFileSync } from 'node:fs'

test('从减少动态恢复时首页和人物馆均不重播完整开场',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'})
 await page.goto('/#people')
 const root=page.locator('.people-memorial')
 await expect(root).toHaveAttribute('data-intro','done')
 await page.emulateMedia({reducedMotion:'no-preference'})
 await page.waitForTimeout(80)
 expect(await root.getAttribute('data-intro')).toBe('done')
 await page.emulateMedia({reducedMotion:'reduce'})
 await page.goto('/#home')
 await expect(page.locator('#hero-title')).toBeVisible()
 await page.emulateMedia({reducedMotion:'no-preference'})
 await page.waitForTimeout(80)
 expect(Number(await page.locator('#hero-title').evaluate(el=>getComputedStyle(el).opacity))).toBe(1)
})

test('慢速章节可以取消返回首页，迟到资源不覆盖当前页面',async({page},info)=>{
 let release!:()=>void
 const gate=new Promise<void>(resolve=>{release=resolve})
 await page.route('**/assets/LegacyPage-*.js',async route=>{await gate;await route.continue()})
 try{
  await page.goto('/#legacy',{waitUntil:'domcontentloaded'})
  await expect(page.getByRole('status')).toContainText('正在进入精神传承')
  await page.getByRole('link',{name:'返回首页',exact:true}).click()
  await expect(page.locator('#home')).toBeVisible()
 }finally{release()}
 await expect(page.locator('.legacy-page')).toBeAttached()
 await expect(page.locator('.legacy-page')).toBeHidden()
 await expect(page).toHaveURL(/#home$/)
 await page.evaluate(()=>document.fonts.ready)
 await page.locator('.hero-image').evaluate(image=>(image as HTMLImageElement).decode())
 await page.screenshot({path:`output/playwright/motion/${info.project.name}-slow-load-cancel.png`})
})

test('后台初次进入三时代图直接保留完整终态，返回不追播',async({page})=>{
 await page.addInitScript(()=>Object.defineProperty(document,'hidden',{configurable:true,value:true}))
 await page.goto('/#legacy/relay')
 const circuit=page.locator('#legacy-relay .legacy-circuit')
 await circuit.evaluate(el=>el.scrollIntoView({block:'center'}))
 await expect(circuit).toHaveAttribute('data-circuit-phase',/./)
 expect(await circuit.getAttribute('data-circuit-phase')).toBe('complete')
 expect(Number(await circuit.locator('.legacy-route-path').evaluate(el=>getComputedStyle(el).strokeDashoffset.replace('px','')))).toBe(0)
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'))})
 await expect(circuit).toHaveAttribute('data-circuit-phase','complete')
})

test('地图首次加载中取消，稍后进入仍使用正式可视尺寸的初始视野',async({page})=>{
 await page.goto('/#map')
 const map=page.locator('.history-map-canvas')
 await expect(map).toHaveAttribute('data-map-state','local')
 await expect.poll(()=>map.getAttribute('data-zoom')).not.toBeNull()
 const originalZoom=Number(await map.getAttribute('data-zoom'))
 let release!:()=>void
 const gate=new Promise<void>(resolve=>{release=resolve})
 await page.route('**/assets/HistoryMapPage-*.js',async route=>{await gate;await route.continue()})
 try{
  await page.goto('/?motion-map-cancel#map',{waitUntil:'domcontentloaded'})
  await expect(page.getByRole('status')).toContainText('正在载入长征时空地图')
  await page.evaluate(()=>{location.hash='home'})
  await expect(page.locator('#home')).toBeVisible()
 }finally{release()}
 await expect(map).toBeAttached()
  // 用户取消后可在首页停留；迟到资源完成不能留下按隐藏尺寸拟合的镜头。
  await page.waitForTimeout(1000)
 await page.evaluate(()=>{location.hash='map'})
 await expect(map).toHaveAttribute('data-map-state','local')
 await expect.poll(async()=>Math.abs(Number(await map.getAttribute('data-zoom'))-originalZoom)).toBeLessThan(.01)
})

test('桌面和横屏肖像余光、八字完整，光影暂停与恢复',async({browser},info)=>{
 for(const [width,height] of [[1440,900],[844,390]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:width<1000,isMobile:width<1000})
  const page=await context.newPage()
  await page.goto('http://127.0.0.1:4173/#legacy/entrust')
  await expect(page.locator('.legacy-page')).toBeVisible()
  await page.evaluate(()=>document.fonts.ready)
  await page.locator('.legacy-jiang img').evaluate(image=>(image as HTMLImageElement).decode())
  await page.locator('.legacy-entrust-composition').evaluate(el=>el.scrollIntoView({block:'start'}))
  await expect(page.locator('.legacy-entrust-words h2')).toHaveCSS('opacity','1')
  await page.waitForTimeout(1100)
  const header=await page.locator('.legacy-topbar').evaluate(el=>({box:el.getBoundingClientRect().toJSON(),style:{opacity:getComputedStyle(el).opacity,visibility:getComputedStyle(el).visibility},children:[...el.children].map(child=>({box:child.getBoundingClientRect().toJSON(),opacity:getComputedStyle(child).opacity,visibility:getComputedStyle(child).visibility})),windowScroll:scrollY,pageScroll:document.querySelector('.legacy-page')?.scrollTop,viewportTop:visualViewport?.offsetTop}))
  writeFileSync(`output/playwright/motion/${info.project.name}-${width}-jiang-header.json`,JSON.stringify(header,null,2))
  await page.screenshot({path:`output/playwright/motion/${info.project.name}-${width}-jiang-final.png`})
  await page.evaluate(()=>{location.hash='legacy/prologue'})
  await page.getByRole('button',{name:'暂停光影',exact:true}).click()
  await expect(page.locator('.legacy-page')).toHaveAttribute('data-legacy-ambient','paused')
  expect(await page.locator('.legacy-prologue-art').evaluate(el=>getComputedStyle(el,':after').animationPlayState)).toBe('paused')
  await page.getByRole('button',{name:'播放光影',exact:true}).click()
  await expect(page.locator('.legacy-page')).toHaveAttribute('data-legacy-ambient','running')
  await context.close()
 }
})

test('短聚焦窗口内新人物与浏览器返回取代旧回调，不残留肖像副本',async({page})=>{
 await page.goto('/#people')
 const root=page.locator('.people-memorial')
 await expect(root).toHaveAttribute('data-intro','done')
 await page.evaluate(()=>{
  (document.querySelector('[data-person="mao-zedong"]') as HTMLAnchorElement).click()
  location.hash='people/zhou-enlai'
 })
 await page.waitForTimeout(400)
 expect(await page.locator('.person-archive h1').textContent()).toBe('周恩来')
 await expect(root).toHaveAttribute('data-transition','idle')
 await page.getByRole('button',{name:'关闭档案 ×',exact:true}).click()
 await expect(root).toHaveAttribute('data-transition','idle')
 await page.getByRole('link',{name:'阅读毛泽东人物档案',exact:true}).click()
 await expect(root).toHaveAttribute('data-transition','idle')
 await page.evaluate(()=>{
  (document.querySelector('.people-topbar button') as HTMLButtonElement).click()
  history.back()
 })
 await expect(page).toHaveURL(/#people$/)
 await expect(root).toHaveAttribute('data-transition','idle')
 await expect(page.locator('.people-flight-image')).toHaveCount(0)
})
