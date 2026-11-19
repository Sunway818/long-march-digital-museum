import { useState } from 'react'
import type { HistoricalEvent, HistoryImage } from './types'
import dimensions from '../../data/history/exhibitions/media-dimensions.json' with { type: 'json' }
import { documents, sourceById } from './data'
import { chishuiExhibition } from './exhibitionContent'
import { displayDateText } from './model'

export function exhibitionImageNote(image: HistoryImage) {
  const special = chishuiExhibition.imageNotes[image.id]
  const size = (dimensions as Record<string, { width: number; height: number }>)[image.id]
  const regional = image.type.startsWith('历史遗址照片（拍摄年代待核')
  return special ?? {
    title: image.title, nature: regional ? '地域照片' : image.type,
    dateNote: regional ? '拍摄年代未注明' : displayDateText(image.date_text),
    description: regional ? `${image.caption}。原网页未注明拍摄年代，本展不将其作为1935年现场实拍。` : image.caption,
    credit: `来源：${image.source_ids.map(id => sourceById.get(id)?.institution).filter(Boolean).join('、') || '见史料目录原始链接'}`,
    width: size?.width, height: size?.height,
  }
}

export function ExhibitImage({ image, opening = false, onOpen }: { image: HistoryImage; opening?: boolean; onOpen: () => void }) {
  const [failed, setFailed] = useState(false)
  const note = exhibitionImageNote(image)
  return <figure className={`exhibit-image${opening ? ' exhibit-opening-image' : ''}`}>
    {failed ? <p className="exhibit-image-unavailable">影像暂未加载，可在文末史料目录查阅原始来源。</p> : <button className="exhibit-image-open" onClick={onOpen} aria-label={`放大查看：${note.title}`}>
      <img src={image.local_preview_url!} alt={note.title} width={note.width} height={note.height} loading={opening ? 'eager' : 'lazy'} fetchPriority={opening ? 'high' : 'auto'} onError={() => setFailed(true)} />
      <span aria-hidden="true">{opening ? '查看完整影像' : '放大查看'} <span>↗</span></span>
    </button>}
    <figcaption><span>{note.nature}{note.dateNote && ` · ${note.dateNote}`}</span><strong>{note.title}</strong><p>{note.description}</p><small><a href={image.source_url} target="_blank" rel="noreferrer">{note.credit} ↗</a></small></figcaption>
  </figure>
}

export function ExhibitionSources({ sourceIds, events, images, reviewMode, children }: { sourceIds: string[]; events: HistoricalEvent[]; images: HistoryImage[]; reviewMode: boolean; children?: React.ReactNode }) {
  const refs = [...new Set([...sourceIds, ...events.flatMap(e => e.source_ids), ...images.flatMap(i => i.source_ids)])]
  const docs = documents.filter(d => events.some(e => e.document_ids.includes(d.id) || d.event_ids.includes(e.id)))
  return <section className="exhibit-references" aria-label="文献与史料"><h3>史料与延伸阅读</h3>
    <details className="archive-sources"><summary>史料依据与延伸阅读</summary><ul className="source-list">{refs.map(id => { const source = sourceById.get(id); return source && <li key={id} data-source={id}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a><span>{source.institution}</span>{reviewMode && <small>{source.status}</small>}</li> })}</ul>
      {docs.length > 0 && <div><h4>相关文献</h4>{docs.map(d => <div className="document-entry" key={d.id}><a href={d.url} target="_blank" rel="noreferrer">{d.title}</a><p>{d.creator} · {d.date_text}</p><p>{d.nature}；{d.scope}</p><p>{d.summary}</p></div>)}</div>}
      {images.length > 0 && <details><summary>登记的关联影像来源</summary>{images.map(i => <div className="document-entry" key={i.id}><a href={i.source_url} target="_blank" rel="noreferrer">{i.title}</a><p>{i.type}</p></div>)}</details>}
      {children}
    </details>
    {reviewMode && <details className="exhibit-review"><summary>审阅记录</summary><p>正文和本站解读为草稿，尚未提升为正式发布内容；本机素材预览不代表公开许可。</p>{events.map(e => <div key={e.id}><h4>{e.id} · {e.title}</h4><p>{e.disputes}</p><p>{e.gaps}</p></div>)}{images.map(i => <div key={i.id}><h4>{i.id} · {i.title}</h4><p>{i.verification_status}</p><p>{i.rights}</p></div>)}</details>}
  </section>
}
