import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { YouthKeyword } from '../../data/history/legacy/content'
import { paintKeepsake } from './keepsake'
import { loadKeepsakeMark } from './keepsakeBrand'
import { animateMotion, cancelMotion, motion } from '../../animations/motion'

/** 仅随输入或字体就绪重绘；不创建播放时钟，不持久保存个人文字。 */
export function KeepsakePreview({keyword,answer}:{keyword:YouthKeyword|null;answer:string}) {
 const canvas=useRef<HTMLCanvasElement>(null)
 const [mark,setMark]=useState<HTMLImageElement|null>(null),[failed,setFailed]=useState(false)
 useEffect(()=>{
  const element=canvas.current
  if(mark)animateMotion(element,'keyword-preview',[{opacity:.76},{opacity:1}],{duration:motion.feedback})
  return()=>{if(element)cancelMotion(element)}
 },[keyword?.id,mark])
 useEffect(()=>{
  let cancelled=false
  void Promise.all([loadKeepsakeMark(),Promise.allSettled([document.fonts.load('40px LegacySerif'),document.fonts.load('100px LegacyBrush')])]).then(([image])=>{if(!cancelled)setMark(image)}).catch(()=>{if(!cancelled)setFailed(true)})
  return()=>{cancelled=true}
 },[])
 useLayoutEffect(()=>{
  if(!mark)return
  try{if(canvas.current)paintKeepsake(canvas.current,keyword,answer,mark,true);setFailed(false)}catch{setFailed(true)}
 },[keyword,answer,mark])
 const description=(keyword?`纪念笺实时预览，关键词${keyword.word}。${answer||'尚未书写个人文字。'}`:'纪念笺示例预览，尚未选择关键词。每一份青春，都有自己的征途。')+' 含杭州电子科技大学官方校标，学生课程实践作品。'
 return <figure className="youth-live-preview" data-motion-slot="keepsake-preview">
  <canvas ref={canvas} className="youth-live-canvas" width="1080" height="1440" role="img" aria-label={description} aria-busy={!mark&&!failed} hidden={failed}/>
  {failed&&<div className="youth-preview-fallback"><p>伟大征程 · 青春纪念笺</p><h3>{keyword?.word??'青春'}</h3><p>{answer||'每一份青春，都有自己的征途。'}</p><p>国家大事，千万尽力。</p><p>图片预览暂不可用，可继续书写并复制文字保存。</p></div>}
  <figcaption>{!mark&&!failed?'正在准备纪念笺预览…':keyword?'实时预览 · 生成后可保存完整图片':'示例预览 · 选择关键词，开始书写'}</figcaption>
 </figure>
}
