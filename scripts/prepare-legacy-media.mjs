import fs from 'node:fs/promises'
import crypto from 'node:crypto'
import { chromium } from '@playwright/test'
const registry=JSON.parse(await fs.readFile('src/data/history/legacy/media-register.json','utf8'))
await fs.mkdir('public/legacy-media',{recursive:true})
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'})
try {
 const page=await browser.newPage()
 for(const item of registry){
  const original=await fs.readFile(item.originalPath)
  if(crypto.createHash('sha256').update(original).digest('hex')!==item.sha256)throw Error(`Original changed: ${item.id}`)
  const mime=item.file.endsWith('.png')?'image/png':'image/jpeg'
  const converted=await page.evaluate(async({base64,mime,resize})=>{
   const image=new Image();image.src=`data:${mime};base64,${base64}`;await image.decode()
   const scale=resize?Math.min(1,1920/image.naturalWidth):1
   const width=Math.round(image.naturalWidth*scale),height=Math.round(image.naturalHeight*scale)
   if(!resize)return{width,height,data:null}
   const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;canvas.getContext('2d').drawImage(image,0,0,width,height)
   return{width,height,data:canvas.toDataURL('image/webp',.84).split(',')[1]}
  },{base64:original.toString('base64'),mime,resize:!['LEG-01','LEG-05','LEG-06'].includes(item.id)})
  const file=converted.data?item.file.replace(/\.[^.]+$/,'.webp'):item.file
  const display=converted.data?Buffer.from(converted.data,'base64'):original
  await fs.writeFile(`public/legacy-media/${file}`,display)
  Object.assign(item,{displayPath:`public/legacy-media/${file}`,width:converted.width,height:converted.height,displayBytes:display.length,displaySha256:crypto.createHash('sha256').update(display).digest('hex'),processing:converted.data?'Chrome Canvas转WebP质量0.84，最大宽1920，保持完整画幅；原件保留于research。':'原字节保留，网页缩放、不AI修复。'})
  console.log(item.id,file,converted.width,converted.height,display.length)
 }
 await fs.writeFile('src/data/history/legacy/media-register.json',JSON.stringify(registry,null,2)+'\n')
}finally{await browser.close()}
