import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
const browser = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true })
try {
  const page = await browser.newPage()
  await page.goto('http://127.0.0.1:5173/')
  await page.waitForFunction(() => document.querySelector('#home')?.dataset.flagState === 'ready')
  const result = await page.evaluate(async () => {
    const { createAmbientAnimations } = await import('/src/animations/ambientAnimations.ts')
    const tracked = new Map(), counts = {}, restores = []
    for (const kind of ['Buffer','Texture','Shader','Program','VertexArray']) {
      const proto = WebGL2RenderingContext.prototype, create = proto[`create${kind}`], remove = proto[`delete${kind}`]
      tracked.set(kind,new Set()); counts[kind] = {created:0,deleted:0}
      proto[`create${kind}`] = function(...args) { const object = create.apply(this,args);if(object){tracked.get(kind).add(object);counts[kind].created++}return object }
      proto[`delete${kind}`] = function(object) { if(tracked.get(kind).delete(object)) counts[kind].deleted++;return remove.call(this,object) }
      restores.push(() => {proto[`create${kind}`]=create;proto[`delete${kind}`]=remove})
    }
    const scope = document.querySelector('#home').cloneNode(true)
    scope.id='lifecycle-check';scope.style.cssText='position:fixed;top:0;left:0;width:320px;height:180px;min-height:0;z-index:-100'
    document.body.append(scope)
    let manager
    try {
      // Match StrictMode's setup -> immediate cleanup -> setup while textures decode.
      createAmbientAnimations(scope).destroy()
      manager = createAmbientAnimations(scope);manager.start()
      const began=performance.now()
      while(scope.dataset.flagState!=='ready') {if(performance.now()-began>8000)throw Error('lifecycle initialization timeout');await new Promise(r=>setTimeout(r,20))}
      manager.destroy()
      const canvas = scope.querySelector('.flag-canvas'), time=canvas.dataset.flagTime
      await new Promise(r=>setTimeout(r,250))
      return {counts,noRemainingGpuResources:[...tracked.values()].every(s=>s.size===0),clockStopped:canvas.dataset.flagTime===time}
    } finally {manager?.destroy();scope.remove();restores.forEach(restore=>restore())}
  })
  await mkdir('output/playwright/flag-integrated',{recursive:true})
  await writeFile('output/playwright/flag-integrated/lifecycle.json',JSON.stringify(result,null,2))
  console.log(JSON.stringify(result,null,2))
  if(!result.noRemainingGpuResources||!result.clockStopped)throw Error('Resource cleanup failed')
} finally {await browser.close()}
