import {test,expect} from '@playwright/test'
import {mkdirSync,writeFileSync} from 'node:fs'

// Optional review artifact: record actual Chrome frames, without a new media dependency.
test('实际浏览器录制环境光周期与肖像档案往返',async({page},info)=>{
 test.setTimeout(60_000)
 mkdirSync('output/playwright/motion',{recursive:true})
 await page.goto('/#people')
 await expect(page.locator('.people-memorial')).toHaveAttribute('data-intro','done')
 await page.evaluate(()=>{
  const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=720
  const context=canvas.getContext('2d')!
  context.fillStyle='#151412';context.fillRect(0,0,1280,720)
  const stream=canvas.captureStream(20)
  const recorder=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp8',videoBitsPerSecond:1800000})
  const chunks:Blob[]=[]
  recorder.ondataavailable=event=>{if(event.data.size)chunks.push(event.data)}
  ;(window as Window & {reviewCapture?:{canvas:HTMLCanvasElement;recorder:MediaRecorder;chunks:Blob[];stream:MediaStream}}).reviewCapture={canvas,recorder,chunks,stream}
  recorder.start(500)
 })
 const session=await page.context().newCDPSession(page)
 let frames=0;let drawing=Promise.resolve()
 session.on('Page.screencastFrame',frame=>{
  void session.send('Page.screencastFrameAck',{sessionId:frame.sessionId})
  drawing=drawing.then(async()=>{
   await page.evaluate(async data=>{
    const state=(window as Window & {reviewCapture?:{canvas:HTMLCanvasElement}}).reviewCapture!
    const image=new Image();image.src='data:image/jpeg;base64,'+data;await image.decode()
    state.canvas.getContext('2d')!.drawImage(image,0,0,state.canvas.width,state.canvas.height)
   },frame.data)
   frames++
  })
 })
 await session.send('Page.startScreencast',{format:'jpeg',quality:72,maxWidth:1280,maxHeight:720,everyNthFrame:2})
 await page.waitForTimeout(16_000)
 await page.getByRole('link',{name:'阅读毛泽东人物档案'}).click()
 await expect(page.locator('.people-memorial')).toHaveAttribute('data-transition','idle')
 await page.waitForTimeout(800)
 await page.getByRole('button',{name:'关闭档案 ×'}).click()
 await expect(page.locator('.people-memorial')).toHaveAttribute('data-transition','idle')
 await page.waitForTimeout(800)
 await session.send('Page.stopScreencast');await drawing
 const data=await page.evaluate(async()=>{
  const state=(window as Window & {reviewCapture?:{recorder:MediaRecorder;chunks:Blob[];stream:MediaStream}}).reviewCapture!
  await new Promise<void>(resolve=>{state.recorder.onstop=()=>resolve();state.recorder.stop()})
  const bytes=new Uint8Array(await new Blob(state.chunks,{type:'video/webm'}).arrayBuffer())
  let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte)
  state.stream.getTracks().forEach(track=>track.stop())
  delete (window as Window & {reviewCapture?:unknown}).reviewCapture
  return btoa(binary)
 })
 expect(frames).toBeGreaterThan(40)
 writeFileSync(`output/playwright/motion/${info.project.name}-light-and-portrait.webm`,Buffer.from(data,'base64'))
 writeFileSync(`output/playwright/motion/${info.project.name}-recording.json`,JSON.stringify({browser:info.project.name,frames,resolution:'1280x720',realTime:true,note:'CDP实际帧经浏览器MediaRecorder编码；非真机录屏、非生成画面。'},null,2))
 await session.detach()
})
