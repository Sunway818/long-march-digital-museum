import type { HistoricalEvent, HistoryImage } from './types'
import { archiveImages } from './archiveContent'
import { exhibitionDefinitions } from './exhibitionDefinitions'
import { exhibitionDate } from './exhibitionContent'
import { eventById, placeById } from './data'
import { ExhibitImage, ExhibitionSources } from './ExhibitionPrimitives'

export function EventExhibition({ event, media, previewMode, reviewMode, onOpen, onMapCompare }: { event: HistoricalEvent; media: HistoryImage[]; previewMode: boolean; reviewMode: boolean; onOpen: (image: HistoryImage) => void; onMapCompare?: () => void }) {
  const definition = exhibitionDefinitions[event.id]!
  const hero = media.find(i => i.id === definition.heroImageId)
  const gallery = media.filter(i => i !== hero)
  const facts = definition.sections.filter(s => !s.interpretation)
  const analyses = definition.sections.filter(s => s.interpretation)
  const ids = [...new Set(definition.sections.flatMap(s => s.sourceIds))]
  const context = definition.relatedEventIds?.map(id => eventById.get(id)!).filter(Boolean) ?? []
  return <article className="event-exhibition" data-event-id={event.id} data-kind={definition.kind} data-long-title={definition.title.length > 6}>
    <section className={`exhibit-opening${hero ? '' : ' exhibit-opening-text'}${!hero && context.length ? ' exhibit-opening-context' : ''}`} aria-labelledby="archive-title">
      {hero && <ExhibitImage image={hero} opening onOpen={() => onOpen(hero)} />}
      <div className="exhibit-opening-copy"><p className="exhibit-date">{definition.dateText ?? exhibitionDate(event)}</p><h2 id="archive-title">{definition.title}</h2><p className="exhibit-opening-line">{definition.opening}</p><p className="exhibit-question">{definition.question}</p><p className="exhibit-place">{event.place_ids.map(id => placeById.get(id)?.historical_name).join('、')}<span>{event.army_text}</span></p><a href="#event-exhibit-story" onClick={e => { e.preventDefault(); document.getElementById('event-exhibit-story')?.scrollIntoView({ block: 'start' }); document.getElementById('event-exhibit-story')?.focus({ preventScroll: true }) }}>进入这段历史 <span aria-hidden="true">↓</span></a></div>
      {!hero && context.length > 0 && <aside className="event-opening-context" aria-label="前后事件关系"><h3>{definition.kind === 'reunion' ? '分次会师' : '决策的连续过程'}</h3><ol>{context.map(e => <li key={e.id} data-current={e.id === event.id}><time>{exhibitionDate(e)}</time><strong>{exhibitionDefinitions[e.id]?.title ?? e.title}</strong><p>{e.army_text}</p></li>)}</ol></aside>}
    </section>
    <div className="exhibit-story" id="event-exhibit-story" tabIndex={-1}>
      {previewMode ? <>
        <div className="exhibit-lead"><p>{definition.lead}</p></div>
        {facts.map(s => <section className={definition.kind === 'meeting' ? 'exhibit-background' : 'exhibit-narrative'} key={s.title}><h3>{s.title}</h3><div className="exhibit-prose">{s.paragraphs.map(p => <p key={p}>{p}</p>)}</div></section>)}
        {gallery.length > 0 && <section className={`event-exhibit-gallery event-gallery-${definition.kind}`} aria-label="历史影像与文献展览">{gallery.map(i => <ExhibitImage key={i.id} image={i} onOpen={() => onOpen(i)} />)}</section>}
        {analyses.map(s => <section className="exhibit-analysis" key={s.title}><div className="exhibit-analysis-heading"><p>本站解读</p><h3>{s.title}</h3><span>基于史料的分析判断，非历史人物原话</span></div><div className="exhibit-prose">{s.paragraphs.map(p => <p key={p}>{p}</p>)}</div></section>)}
        {onMapCompare && <div className="event-exhibit-map-action"><button className="exhibit-map-compare" onClick={onMapCompare}>返回地图对照 <span aria-hidden="true">↗</span></button><p>沿用原选中事件与地域参考，返回不改变日期或镜头。</p></div>}
      </> : <p className="exhibit-public-note">专题内容正在整理，可查阅下方史料目录中的相关资料。</p>}
      <ExhibitionSources events={[event]} images={archiveImages(event)} sourceIds={ids} reviewMode={reviewMode} />
    </div>
  </article>
}
