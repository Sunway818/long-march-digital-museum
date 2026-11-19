import { useRef } from 'react'
import type { HistoricalEvent, HistoryImage } from './types'
import { archiveDrafts } from './archiveContent'
import { documents, sourceById } from './data'
import { chishuiExhibition as content, exhibitionDate } from './exhibitionContent'
import { ExhibitImage } from './ExhibitionPrimitives'

export function ChishuiExhibition({ event, media, sourceIds, reviewMode, previewMode, onOpen, onMapCompare }: { event: HistoricalEvent; media: HistoryImage[]; sourceIds: string[]; reviewMode: boolean; previewMode: boolean; onOpen: (image: HistoryImage) => void; onMapCompare?: () => void }) {
  const draft = previewMode ? archiveDrafts[event.id] : undefined
  const [background, narrative, interpretation] = draft?.sections ?? []
  const hero = media.find(i => i.id === content.heroImageId)
  const route = media.find(i => i.id === content.routeImageId)
  const sources = useRef<HTMLDetailsElement>(null)
  const relatedDocuments = documents.filter(d => event.document_ids.includes(d.id) || d.event_ids.includes(event.id))
  const refs = [...new Set([...sourceIds, ...media.flatMap(i => i.source_ids)])]
  const cite = (ids: string[]) => <span className="exhibit-citations">{ids.map(id => <button key={id} aria-label={`查看出处 ${refs.indexOf(id) + 1}`} onClick={() => {
    if (sources.current) { sources.current.open = true; sources.current.querySelector<HTMLElement>(`[data-source="${id}"] a`)?.focus() }
  }}>[{refs.indexOf(id) + 1}]</button>)}</span>
  return <article className="chishui-exhibition" aria-label="一渡赤水专题展厅">
    <section className={`exhibit-opening${hero ? '' : ' exhibit-opening-text'}`} aria-labelledby="archive-title">
      {hero && <ExhibitImage image={hero} opening onOpen={() => onOpen(hero)} />}
      <div className="exhibit-opening-copy"><p className="exhibit-date"><time dateTime={event.start_date ?? undefined}>{exhibitionDate(event)}</time></p><h2 id="archive-title">{event.title}</h2><p className="exhibit-opening-line">{content.opening}</p><p className="exhibit-question">{content.question}</p><p className="exhibit-place">{content.placeText} <span>{content.armyText}</span></p>
        <a href="#exhibit-story" onClick={e => { e.preventDefault(); document.getElementById('exhibit-story')?.scrollIntoView({ block: 'start' }); document.getElementById('exhibit-story')?.focus({ preventScroll: true }) }}>进入这段历史 <span aria-hidden="true">↓</span></a>
      </div>
    </section>
    <div className="exhibit-story" id="exhibit-story" tabIndex={-1}>
      {draft ? <>
        <div className="exhibit-lead"><p>{draft.lead}</p></div>
        {background && <section className="exhibit-background" aria-labelledby="exhibit-background-title"><h3 id="exhibit-background-title">{content.backgroundTitle}</h3><div className="exhibit-prose">{background.paragraphs.map(p => <p key={p}>{p}</p>)}{cite(background.sourceIds)}</div></section>}
        {narrative && <section className="exhibit-narrative" aria-labelledby="exhibit-narrative-title"><div className="exhibit-narrative-heading"><p>{content.narrativeDate}</p><h3 id="exhibit-narrative-title">{content.narrativeTitle}</h3></div><div className="exhibit-prose">{narrative.paragraphs.map(p => <p key={p}>{p}</p>)}{cite(narrative.sourceIds)}</div></section>}
        {route && <section className="exhibit-route" aria-labelledby="exhibit-route-title"><div className="exhibit-route-copy"><h3 id="exhibit-route-title">{content.routeTitle}</h3><p>{content.routeDescription}</p>{onMapCompare && <button className="exhibit-map-compare" onClick={onMapCompare}>返回地图对照 <span aria-hidden="true">↗</span></button>}</div><ExhibitImage image={route} onOpen={() => onOpen(route)} /></section>}
        {interpretation && <section className="exhibit-analysis" aria-labelledby="exhibit-analysis-title"><div className="exhibit-analysis-heading"><p>{content.analysisLabel}</p><h3 id="exhibit-analysis-title">{interpretation.title}</h3><span>基于史料的分析判断，非历史人物原话</span></div><div className="exhibit-prose">{interpretation.paragraphs.map(p => <p key={p}>{p}</p>)}{cite(interpretation.sourceIds)}</div></section>}
      </> : <p className="exhibit-public-note">专题内容正在整理，可查阅下方史料目录中的相关资料。</p>}
      <section className="exhibit-references" aria-label="文献与史料"><h3>回到史料</h3><details ref={sources} className="archive-sources"><summary>史料依据与延伸阅读</summary><ol>{refs.map(id => { const source = sourceById.get(id); return source && <li key={id} data-source={id}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a><p>{source.institution}</p>{draft?.sections.filter(s => s.sourceIds.includes(id)).map(s => <small key={s.title}>{s.title}：{s.locator}</small>)}</li> })}</ol>
        {media.length > 0 && <div className="exhibit-image-sources"><h4>影像出处</h4>{media.map(i => <p key={i.id}><a href={i.source_url} target="_blank" rel="noreferrer">{content.imageNotes[i.id]?.title ?? i.title}</a><span>{content.imageNotes[i.id]?.credit}</span></p>)}</div>}
        {relatedDocuments.length > 0 && <div><h4>相关文献</h4>{relatedDocuments.map(d => <div key={d.id}><a href={d.url} target="_blank" rel="noreferrer">{d.title}</a><p>{d.summary}</p></div>)}</div>}
      </details>
      {reviewMode && <details className="exhibit-review"><summary>审阅记录</summary><p>叙事草稿 · 待人工审核。现有两张素材供本机研究预览，公开展示许可均未确认。</p><p>{event.disputes}</p><p>{event.gaps}</p>{media.map(i => <div key={i.id}><h4>{i.id} · {i.title}</h4><p>{i.verification_status}</p><p>{i.rights}</p></div>)}<p>本站解读沿用独立草稿；精确渡口、原始文献及各部队具体行军日程仍需补证。</p></details>}
      </section>
    </div>
  </article>
}
