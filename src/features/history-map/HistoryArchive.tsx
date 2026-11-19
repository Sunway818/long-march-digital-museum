import { useEffect, useRef, useState } from 'react'
import { documents, eventById, placeById, sourceById } from './data'
import { archiveDrafts, exhibitionImages } from './archiveContent'
import { featuredEvents, } from './curation'
import { featuredNotes } from './featuredEvents'
import { displayDateText, eventDay, toDay } from './model'
import type { HistoryImage } from './types'
import { ImageCard, ImageViewer } from './HistoryMedia'
import { ChishuiExhibition } from './ChishuiExhibition'
import { ChishuiCampaign, campaignMedia } from './ChishuiCampaign'
import { EventExhibition } from './EventExhibition'
import { AdaptiveExhibition } from './AdaptiveExhibition'
import { adaptiveExhibitions } from './adaptiveExhibitions'
import { exhibitionDefinitions } from './exhibitionDefinitions'
import { canPreviewArchive, chishuiExhibition, isArchiveReviewMode } from './exhibitionContent'
import '../../styles/history-archive.css'
import '../../styles/history-exhibition.css'
import '../../styles/history-campaign.css'
import '../../styles/adaptive-exhibition.css'
import { animateMotion, cancelMotion, motion } from '../../animations/motion'

export function HistoryArchive({ eventId, onNavigate, close, returnFocus, onMapCompare, topic, onMapEvent }: { eventId: string; onNavigate: (id: string) => void; close: () => void; returnFocus: HTMLElement | null; onMapCompare?: () => void; topic?: 'chishui'; onMapEvent?: (id: string) => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const scroll = useRef<HTMLDivElement>(null)
  const imageTrigger = useRef<HTMLElement | null>(null)
  const [image, setImage] = useState<HistoryImage | null>(null)
  const [copied, setCopied] = useState(false)
  const closing=useRef(false),sequenceToken=useRef(0)
  function requestClose(){
    if(closing.current)return
    closing.current=true
    if(dialog.current)dialog.current.dataset.closing='true'
    const token=++sequenceToken.current
    const animation=animateMotion(dialog.current,'archive-close',[{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(8px)'}],{duration:260,fill:'forwards'})
    const complete=()=>{if(sequenceToken.current===token)close()}
    if(animation)void animation.finished.then(complete,complete);else complete()
  }
  const event = eventById.get(eventId)!
  const campaign = topic === 'chishui'
  const definition = exhibitionDefinitions[eventId]
  const adaptive = adaptiveExhibitions[eventId]
  const exhibition = Boolean(definition || adaptive) || campaign
  const reviewMode = isArchiveReviewMode()
  const previewMode = canPreviewArchive()
  const draft = archiveDrafts[eventId]
  const media = campaign ? campaignMedia(previewMode) : exhibitionImages(event, previewMode)
  const note = featuredNotes[eventId]
  const sequence = [...featuredEvents.filter(e => e.id !== eventId), event].filter(e => eventDay(e)).sort((a, b) => toDay(eventDay(a)!) - toDay(eventDay(b)!) || a.id.localeCompare(b.id))
  const index = sequence.findIndex(e => e.id === eventId)
  const refs = [...new Set([...event.source_ids, ...(note?.sourceIds ?? []), ...(draft?.sections.flatMap(s => s.sourceIds) ?? [])])]
  const relatedDocuments = documents.filter(d => event.document_ids.includes(d.id) || d.event_ids.includes(eventId))
  useEffect(() => {
    dialog.current?.showModal()
    animateMotion(dialog.current,'archive-open',[{opacity:.45,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:motion.dialog})
    return () => { sequenceToken.current++;if(dialog.current)cancelMotion(dialog.current);dialog.current?.close(); if (returnFocus?.isConnected&&returnFocus.getClientRects().length) returnFocus.focus({ preventScroll: true }) }
  }, [])
  useEffect(() => {
    if(closing.current){closing.current=false;sequenceToken.current++;if(dialog.current){cancelMotion(dialog.current);delete dialog.current.dataset.closing}}
    scroll.current?.scrollTo({ top: 0 });setImage(null);setCopied(false)
    animateMotion(scroll.current,'archive-reading',[{opacity:.6},{opacity:1}],{duration:motion.reveal})
  }, [eventId, topic])
  const openImage = (item: HistoryImage) => { imageTrigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; setImage(item) }
  return <dialog ref={dialog} className={`history-archive-dialog${exhibition ? ' history-exhibition-dialog' : ''}`} aria-labelledby="archive-title" onCancel={event=>{event.preventDefault();requestClose()}}>
    <header className="archive-toolbar"><span>{exhibition ? campaign || eventId === chishuiExhibition.eventId ? '伟大征程 / 赤水专题' : '伟大征程 / 历史专题' : '伟大征程 / 历史档案'}</span>{exhibition && reviewMode && <small className="exhibit-review-label">审阅预览</small>}<div className="archive-toolbar-actions"><button type="button" onClick={() => {
      const address = location.href
      const manual = () => { window.prompt('复制展品链接', address) }
      if (navigator.clipboard?.writeText) void navigator.clipboard.writeText(address).then(() => setCopied(true), manual)
      else manual()
    }} aria-label="复制展品链接">{copied ? '链接已复制' : '复制展品链接'}</button><span className="sr-only" role="status">{copied ? '展品链接已复制' : ''}</span><button autoFocus onClick={requestClose} aria-label="关闭历史档案">{exhibition ? '返回地图' : '关闭'} <span aria-hidden="true">×</span></button></div></header>
    <div className="archive-scroll" ref={scroll} key={`${eventId}-${topic ?? ''}`}>
      {campaign ? <ChishuiCampaign media={media} previewMode={previewMode} reviewMode={reviewMode} onOpen={openImage} onMapEvent={onMapEvent} /> : adaptive ? <AdaptiveExhibition definition={adaptive} event={event} media={media} previewMode={previewMode} reviewMode={reviewMode} onOpen={openImage} onMapCompare={onMapCompare} /> : eventId === chishuiExhibition.eventId ? <ChishuiExhibition event={event} media={media} sourceIds={refs} reviewMode={reviewMode} previewMode={previewMode} onOpen={openImage} onMapCompare={onMapCompare} /> : definition ? <EventExhibition event={event} media={media} previewMode={previewMode} reviewMode={reviewMode} onOpen={openImage} onMapCompare={onMapCompare} /> : <>
      <div className="archive-masthead"><p className="archive-id">历史资料选读{reviewMode && ` · ${event.id}`}</p><h2 id="archive-title">{event.title}</h2><p className="archive-subtitle">{displayDateText(event.date_text)}　/　{event.place_ids.map(id => placeById.get(id)?.name).join('、')}　/　{event.army_text}</p></div>
      <div className="archive-reading-grid"><main className="archive-prose">
        <p className="archive-intro">{draft?.lead || note?.summary || event.summary.replace(/^经过：/, '').split(' 背景：')[0]}</p>
        {draft ? draft.sections.map(section => <section className={section.interpretation ? 'archive-interpretation' : ''} key={section.title}><h3>{section.title}</h3>{section.interpretation && <p className="archive-section-label">本站解读 · 非史料原文</p>}{section.paragraphs.map(p => <p key={p}>{p}</p>)}<small className="archive-evidence">依据：{section.sourceIds.map(id => { const source = sourceById.get(id); return source ? <a key={id} href={source.url} target="_blank" rel="noreferrer">{source.title}　</a> : null })}{reviewMode && section.locator}</small></section>) : <>
          {event.background && <section><h3>历史背景</h3><p>{event.background}</p></section>}
          {event.relation && <section><h3>前后行动关系</h3><p>{event.relation}</p></section>}
          {event.significance && <section><h3>历史意义</h3><p>{event.significance}</p></section>}
        </>}
        {relatedDocuments.length > 0 && <section><h3>相关文献</h3>{relatedDocuments.map(d => <div className="document-entry" key={d.id}><a href={d.url} target="_blank" rel="noreferrer">{d.title}</a><p>{d.creator} · {d.date_text}</p><p>{d.nature}；{d.scope}</p><p>{d.summary}</p></div>)}</section>}
        <details className="archive-sources"><summary>史料依据与延伸阅读 · {refs.length}项</summary><ul className="source-list">{refs.map(id => { const s = sourceById.get(id); return s && <li key={id}><a href={s.url} target="_blank" rel="noreferrer">{id} · {s.title}</a><span>{s.institution}</span></li> })}</ul></details>
        {event.disputes && <details><summary>资料记载的差异</summary><p>{event.disputes.replace(/本轮文物报道/g, '文物报道').replace(/原?v\d+(?:\.\d+)?/gi, '早期资料')}</p></details>}
        {reviewMode && (event.gaps || event.anchor_note) && <details><summary>史料整理记录</summary><p>{event.gaps}</p><p>{event.anchor_note}</p></details>}
      </main>{media.length > 0 && <aside className="archive-gallery" aria-label="历史影像画廊"><h3>历史影像 <span>{media.length.toString().padStart(2, '0')}</span></h3>{media.map(item => <div key={item.id}><ImageCard image={item} onOpen={() => { imageTrigger.current = document.activeElement as HTMLElement; setImage(item) }} /></div>)}</aside>}</div>
      </>}
      {exhibition && !campaign && <footer className="exhibit-navigation" aria-label="前后事件阅读"><button disabled={index <= 0} onClick={() => onNavigate(sequence[index - 1]!.id)} aria-label="上一个事件"><small>前一段历史</small><span>← {sequence[index - 1]?.title}</span></button><button disabled={index < 0 || index >= sequence.length - 1} onClick={() => onNavigate(sequence[index + 1]!.id)} aria-label="下一个事件"><small>继续阅读</small><span>{sequence[index + 1]?.title} →</span></button></footer>}
    </div>
    {!exhibition && <footer className="archive-navigation"><button disabled={index <= 0} onClick={() => onNavigate(sequence[index - 1]!.id)}>← 上一个事件</button><button onClick={requestClose}>返回地图</button><button disabled={index < 0 || index >= sequence.length - 1} onClick={() => onNavigate(sequence[index + 1]!.id)}>下一个事件 →</button></footer>}
    {image && <ImageViewer image={image} close={() => setImage(null)} returnFocus={imageTrigger.current} immersive={exhibition} gallery={media} onNavigate={setImage} reviewMode={reviewMode} />}
  </dialog>
}
