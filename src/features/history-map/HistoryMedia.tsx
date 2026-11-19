import { useEffect, useRef, useState } from 'react'
import type { HistoryImage } from './types'
import { exhibitionImageNote } from './ExhibitionPrimitives'

export function ImageViewer({ image, close, returnFocus, immersive = false, gallery = [], onNavigate, reviewMode = false }: { image: HistoryImage; close: () => void; returnFocus: HTMLElement | null; immersive?: boolean; gallery?: HistoryImage[]; onNavigate?: (image: HistoryImage) => void; reviewMode?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null)
  const [failed, setFailed] = useState(false)
  const [zoomed, setZoomed] = useState(false)
  const index = gallery.findIndex(i => i.id === image.id)
  const note = exhibitionImageNote(image)
  const navigate = (offset: number) => { const target = gallery[index + offset]; if (target) onNavigate?.(target) }
  useEffect(() => { setFailed(false); setZoomed(false) }, [image.id])
  useEffect(() => {
    const dialog = ref.current
    dialog?.showModal()
    return () => { dialog?.close(); if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true }) }
  }, [])
  return <dialog ref={ref} className={`history-image-dialog${immersive ? ' exhibit-image-viewer' : ''}`} onCancel={event => { event.preventDefault(); event.stopPropagation(); close() }} onKeyDown={event => { if (immersive && event.target === ref.current?.querySelector('[data-image-stage]') && ['ArrowLeft', 'ArrowRight'].includes(event.key)) { event.preventDefault(); navigate(event.key === 'ArrowLeft' ? -1 : 1) } }} aria-labelledby="history-image-title">
    <header><h2 id="history-image-title">{image.title}</h2><button autoFocus onClick={close}>关闭图片</button></header>
    {immersive ? <>
      <div className="exhibit-viewer-stage" data-image-stage tabIndex={0} role="region" aria-label="影像查看区，左右方向键切换图片" data-zoomed={zoomed}>
        {failed ? <p>影像暂未加载，可查阅原始来源。</p> : <img src={image.local_preview_url!} alt={image.title} width={note?.width} height={note?.height} onError={() => setFailed(true)} />}
      </div>
      <div className="exhibit-viewer-controls"><button disabled={index <= 0} onClick={() => navigate(-1)}>上一张图片</button><button onClick={() => setZoomed(!zoomed)} aria-pressed={zoomed}>{zoomed ? '适应窗口' : '放大影像'}</button><button disabled={index < 0 || index >= gallery.length - 1} onClick={() => navigate(1)}>下一张图片</button></div>
      <div className="exhibit-viewer-caption" aria-live="polite"><p>{note?.nature ?? image.type} · {note?.dateNote ?? image.date_text}</p><p>{note?.description ?? image.caption}</p>{reviewMode && <details><summary>影像审核信息</summary><p>{image.rights}</p></details>}<a href={image.source_url} target="_blank" rel="noreferrer">打开原始来源</a></div>
    </> : <>
      {failed ? <p>影像暂未加载，仍可查阅原始来源。</p> : <img src={image.local_preview_url!} alt={note.title} width={note.width} height={note.height} onError={() => setFailed(true)} />}
      <p>{note.nature} · {note.dateNote}</p><p>{note.description}</p><a href={image.source_url} target="_blank" rel="noreferrer">打开原始来源</a>
    </>}
  </dialog>
}
export function ImageCard({ image, onOpen, action = '放大查看' }: { image: HistoryImage; onOpen: () => void; action?: string }) {
  const [failed, setFailed] = useState(false)
  const note = exhibitionImageNote(image)
  return <figure className="history-image-card">
    {!failed ? <button className="image-enlarge" onClick={onOpen} aria-label={action + '：' + note.title}><img src={image.local_preview_url!} alt={note.title} width={note.width} height={note.height} loading="lazy" onError={() => setFailed(true)} /><span>{action}</span></button> : <p className="media-unavailable">影像暂未加载，原始来源仍可查阅。</p>}
    <figcaption><strong>{note.title}</strong><span>{note.nature}</span><span>{note.dateNote}</span><a href={image.source_url} target="_blank" rel="noreferrer">原始来源 ↗</a></figcaption>
  </figure>
}
