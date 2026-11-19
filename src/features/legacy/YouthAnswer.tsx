import { useEffect, useRef, useState } from 'react'
import { legacyNarrative, youthKeywords } from '../../data/history/legacy/content'
import type { YouthKeyword } from '../../data/history/legacy/content'
import { keepsakeText, limitAnswer, renderKeepsake, splitCharacters } from './keepsake'
import { KeepsakePreview } from './KeepsakePreview'

type KeepsakeResult={keyword:YouthKeyword;answer:string;url:string;height:number}
export function YouthAnswer() {
 const [keyword,setKeyword]=useState<YouthKeyword|null>(null),[answer,setAnswer]=useState('')
 const [result,setResult]=useState<KeepsakeResult|null>(null),[busy,setBusy]=useState(false)
 const [message,setMessage]=useState(''),[manualCopy,setManualCopy]=useState(false)
 const field=useRef<HTMLTextAreaElement>(null),resultHeading=useRef<HTMLHeadingElement>(null),manual=useRef<HTMLTextAreaElement>(null)
 const composing=useRef(false),revision=useRef(0),imageUrl=useRef<string|null>(null)
 useEffect(()=>()=>{revision.current++;if(imageUrl.current)URL.revokeObjectURL(imageUrl.current)},[])
 useEffect(()=>{if(result)resultHeading.current?.focus({preventScroll:true})},[result])
 useEffect(()=>{if(manualCopy){manual.current?.focus();manual.current?.select()}},[manualCopy])
 function invalidate(){
  revision.current++;setBusy(false);setResult(null);setManualCopy(false);setMessage('')
  if(imageUrl.current){URL.revokeObjectURL(imageUrl.current);imageUrl.current=null}
 }
 async function generate(){
  if(!keyword){setMessage('先选一个此刻与你相近的关键词。');document.getElementById('youth-keyword-study')?.focus();return}
  const text=limitAnswer(answer).trim()
  if(!text){setMessage('写下一句自己的思考，再生成纪念笺；也可以直接跳到尾声。');field.current?.focus();return}
  setAnswer(text);setMessage('');setBusy(true)
  const token=++revision.current
  let pendingUrl:string|null=null
  try{
   const blob=await renderKeepsake(keyword,text)
   if(token!==revision.current)return
   pendingUrl=URL.createObjectURL(blob)
   const image=new Image();image.src=pendingUrl;await image.decode()
   if(token!==revision.current){URL.revokeObjectURL(pendingUrl);return}
   if(imageUrl.current)URL.revokeObjectURL(imageUrl.current)
   imageUrl.current=pendingUrl
   setResult({keyword,answer:text,url:pendingUrl,height:image.naturalHeight})
   setMessage('纪念笺已生成。可保存完整图片，或复制文字。')
  }catch(error){
   if(pendingUrl)URL.revokeObjectURL(pendingUrl)
   if(token===revision.current)setMessage(error instanceof Error?error.message:'图片暂未生成，请重试或复制文字。')
  }finally{if(token===revision.current)setBusy(false)}
 }
 async function copy(){
  const selection=result?.keyword??keyword
  if(!selection)return
  const text=keepsakeText(selection,result?.answer??limitAnswer(answer))
  try{if(!navigator.clipboard?.writeText)throw Error();await navigator.clipboard.writeText(text);setMessage('纪念文字已复制。')}
  catch{
   setManualCopy(true)
   requestAnimationFrame(()=>{
    manual.current?.focus();manual.current?.select()
    let copied=false;try{copied=document.execCommand('copy')}catch{/* 保留手动选择 */}
    setMessage(copied?'纪念文字已复制。':'请在下方文字中全选并复制。')
   })
  }
 }
 function rewrite(){invalidate();setMessage('可以继续修改，再生成新的纪念笺。');requestAnimationFrame(()=>field.current?.focus())}
 function choose(item:YouthKeyword){
  invalidate()
  setKeyword(item)
  setMessage('已选「'+item.word+'」。可以在下方写一句自己的想法。')
  if(matchMedia('(orientation: landscape) and (max-height: 430px) and (any-pointer: coarse)').matches){
   requestAnimationFrame(()=>field.current?.closest('.youth-field')?.scrollIntoView({block:'nearest'}))
  }
 }
 return <div className="youth-workbench" data-state={result?'ready':'writing'}>
  <div className="youth-writing">
   <div className="youth-invitation"><p className="legacy-section-index">第四章 · 写给自己</p><h2 id="legacy-answer-title" tabIndex={-1}>我的青春答卷</h2><p className="youth-question">{legacyNarrative.youthQuestion}</p><p>{legacyNarrative.youthInvitation}</p></div>
   <form onSubmit={event=>{event.preventDefault();void generate()}}>
    <fieldset><legend>选一个关键词</legend><div className="youth-keywords">{youthKeywords.map(item=><label key={item.id} data-selected={keyword?.id===item.id}><input type="radio" id={`youth-keyword-${item.id}`} name="youth-keyword" value={item.id} checked={keyword?.id===item.id} onChange={()=>choose(item)}/><span>{item.word}</span>{keyword?.id===item.id&&<svg className="youth-selected-mark" width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m3 8 3 3 7-7"/></svg>}</label>)}</div></fieldset>
    <p className="youth-meaning" aria-live="polite">{keyword?.meaning??'笃学力行，守正求新。选一个词，让纪念笺从这里开始。'}</p>
    {keyword&&<div className="youth-field"><label htmlFor="youth-answer">在杭电的这几年，我希望……</label><textarea id="youth-answer" name="youth-answer" autoComplete="off" ref={field} rows={4} value={answer} aria-describedby="youth-count youth-privacy" onCompositionStart={()=>{composing.current=true}} onCompositionEnd={event=>{composing.current=false;invalidate();setAnswer(limitAnswer(event.currentTarget.value))}} onChange={event=>{invalidate();setAnswer(composing.current?event.target.value:limitAnswer(event.target.value))}} placeholder={legacyNarrative.youthPlaceholder}/><p id="youth-count" className="youth-count">{splitCharacters(answer).length} / 200 字 · 支持换行</p></div>}
    <div className="youth-generate-actions"><button type="submit" className="legacy-button" disabled={busy}>{busy?'正在生成纪念笺…':'生成我的青春纪念笺'}</button>{keyword&&answer.trim()&&!result&&<button type="button" className="legacy-text-link youth-copy-draft" onClick={()=>void copy()}>先复制文字保存</button>}</div>
   </form>
   {result&&<div className="youth-result-actions"><a className="legacy-button" href={result.url} download={`2026-青春纪念笺-${result.keyword.word}.png`}>保存纪念笺图片</a><button type="button" className="legacy-secondary" onClick={()=>void copy()}>复制纪念文字</button><button type="button" className="legacy-secondary" onClick={rewrite}>重新书写</button><a className="legacy-text-link" href="#legacy/epilogue">继续阅读尾声</a></div>}
   <p role="status" className="youth-feedback" aria-atomic="true">{message}</p>
   {manualCopy&&keyword&&<label className="youth-manual-copy">纪念文字（可全选复制）<textarea ref={manual} readOnly value={keepsakeText(result?.keyword??keyword,result?.answer??limitAnswer(answer))} rows={8}/></label>}
   <p id="youth-privacy" className="legacy-small">文字只留在本次浏览中，不上传、不采集身份信息。刷新页面会清除，离开前可保存纪念笺。</p>
   <p className="legacy-small youth-keyword-note">前四词取自杭电校训；“担当”为本章主题延伸。</p>
   <a className="legacy-text-link" href="#legacy/epilogue">此刻留白，继续读尾声</a>
  </div>
  <aside className="youth-preview-panel" aria-label="青春纪念笺预览">
   {result?<div className="youth-result"><h3 ref={resultHeading} tabIndex={-1}>{legacyNarrative.youthResultLead}</h3><img className="youth-keepsake" src={result.url} alt={`青春纪念笺，关键词${result.keyword.word}。你的文字：${result.answer}`} width="1080" height={result.height}/><p className="legacy-small">可长按完整图片保存。</p><a className="legacy-text-link" href={result.url} target="_blank" rel="noreferrer">打开纪念笺原图</a></div>:<KeepsakePreview keyword={keyword} answer={limitAnswer(answer)}/>}
  </aside>
 </div>
}
