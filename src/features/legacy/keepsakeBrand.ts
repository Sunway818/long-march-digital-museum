import { siteAssetUrl } from '../../assets/siteAssetUrl'

/** 官网原始反白SVG，保持完整校标及校名组合，不改色、不裁切。 */
export const keepsakeMarkUrl = siteAssetUrl('/legacy-brand/hdu-official-white.svg')
// 采用原SVG viewBox比例，避免naturalWidth整数取整造成轻微变形。
export const keepsakeMarkRatio = 314.419 / 70
let mark: HTMLImageElement | null = null
let pending: Promise<HTMLImageElement> | null = null

export function loadKeepsakeMark(): Promise<HTMLImageElement> {
 if(mark)return Promise.resolve(mark)
 if(pending)return pending
 pending=new Promise((resolve,reject)=>{
  const image=new Image()
  image.decoding='async'
  let settled=false
  const finish=(loaded:boolean)=>{
   if(settled)return
   settled=true
   window.clearTimeout(timeout)
   image.onload=null;image.onerror=null
   if(loaded&&image.naturalWidth>0){mark=image;resolve(image)}
   else{pending=null;reject(Error('校标暂未加载，请重试生成；也可先复制文字保存。'))}
  }
  const timeout=window.setTimeout(()=>finish(false),8000)
  image.onload=()=>finish(true)
  image.onerror=()=>finish(false)
  image.src=keepsakeMarkUrl
 })
 return pending
}
