import { documents, sourceById } from './data'
import { displayDirections } from './routeDisplay'
import type { HistoricalEvent, HistoryImage } from './types'
import { ExhibitImage, ExhibitionSources } from './ExhibitionPrimitives'
import { AdaptiveRouteMap } from './AdaptiveRouteMap'
import { canDisplay, visibleModules, type AdaptiveExhibition as Definition, type Evidence, type NarrativeModule } from './adaptiveExhibitionModel'

const typeNames = { archival: '会议档案', battle: '战场叙事', route: '行军地图', immersive: '场景叙事', portrait: '人物与关系', composite: '组合展陈' }
function EvidenceNote({ evidence, reviewMode }: { evidence: Evidence; reviewMode: boolean }) {
  return <div className="adaptive-evidence"><small>资料依据 {evidence.sourceIds.map((id, i) => { const source = sourceById.get(id); return source && <a key={id} href={source.url} target="_blank" rel="noreferrer" aria-label={`依据：${source.title}`}>[{i + 1}]</a> })}</small>{reviewMode && <p>{evidence.verification} / {evidence.publication} · {evidence.locator}</p>}</div>
}
function ContentModule({ module, media, reviewMode, onOpen, onMapCompare }: { module: NarrativeModule; media: HistoryImage[]; reviewMode: boolean; onOpen: (image: HistoryImage) => void; onMapCompare?: () => void }) {
  const heading = <><p className="adaptive-section-type">{module.type === 'analysis' ? '本站解读' : module.type === 'archive' ? '文献线索' : module.type === 'route' ? '行军地域' : module.type === 'timeline' ? '时间与关系' : ''}</p><h3>{module.title}</h3></>
  let content: React.ReactNode
  switch (module.type) {
    case 'image': {
      const images = media.filter(image => module.imageIds.includes(image.id))
      content = <div className={`adaptive-images ${images.length === 1 ? 'adaptive-image-single' : 'adaptive-image-group'}`}>{images.map(image => <ExhibitImage key={image.id} image={image} onOpen={() => onOpen(image)} />)}</div>
      break
    }
    case 'archive': {
      const document = documents.find(doc => doc.id === module.documentId)!
      content = <div className="adaptive-document"><p className="adaptive-document-title">{document.title.replace(/线索$/, '')}</p><p>{document.creator} · {document.date_text}</p><div className="adaptive-reading"><p>{module.description}</p></div></div>
      break
    }
    case 'route': case 'battle': content = <><p className="adaptive-reading">{module.description}</p><AdaptiveRouteMap routeIds={module.routeIds} caption={module.caption} note={module.note} onMapCompare={onMapCompare} /></>; break
    case 'timeline': content = <ol className="adaptive-chronology">{module.entries.map(entry => <li key={`${entry.date}-${entry.title}`}><time>{entry.date}</time><div><h4>{entry.title}</h4><p>{entry.text}</p><EvidenceNote evidence={{ ...module.evidence, sourceIds: entry.sourceIds }} reviewMode={false} /></div></li>)}</ol>; break
    case 'people': content = <dl className="adaptive-people">{module.entries.map(entry => <div key={entry.name}><dt>{entry.name}</dt><dd>{entry.role}</dd>{entry.imageId && media.find(image => image.id === entry.imageId) && <ExhibitImage image={media.find(image => image.id === entry.imageId)!} onOpen={() => onOpen(media.find(image => image.id === entry.imageId)!)} />}</div>)}</dl>; break
    default: content = <div className="adaptive-reading">{module.paragraphs.filter(p => p.trim()).map((p, i) => <p key={i}>{p}</p>)}</div>
  }
  return <section id={`adaptive-${module.id}`} tabIndex={-1} className={`adaptive-module adaptive-${module.type}${'layout' in module && module.layout ? ` adaptive-layout-${module.layout}` : ''}`} data-module={module.id}>{heading}{content}<EvidenceNote evidence={module.evidence} reviewMode={reviewMode} /></section>
}
export function AdaptiveExhibition({ definition, event, media, previewMode, reviewMode, onOpen, onMapCompare }: { definition: Definition; event: HistoricalEvent; media: HistoryImage[]; previewMode: boolean; reviewMode: boolean; onOpen: (image: HistoryImage) => void; onMapCompare?: () => void }) {
  const opening = definition.opening
  const available = canDisplay(opening.evidence, previewMode)
  const modules = visibleModules(definition, previewMode, media, new Set(displayDirections.map(r => r.id)), new Set(documents.map(d => d.id)))
  const refs = [...new Set([...opening.evidence.sourceIds, ...definition.modules.flatMap(module => module.evidence.sourceIds)])]
  return <article className={`adaptive-exhibition adaptive-type-${definition.type}`} data-exhibition-type={definition.type} aria-label={opening.title}>
    <header className="adaptive-opening">
      <p className="adaptive-register"><span>{event.id}</span><span>{available ? opening.period : '伟大征程 · 历史专题'}</span><span>{definition.combines?.map(type => typeNames[type]).join(' / ') || typeNames[definition.type]}</span></p>
      <h2 id="archive-title">{opening.title}</h2>
      {available ? <><p className="adaptive-opening-meta">{opening.date}<br />{opening.place}　/　{opening.armies}</p><p className="adaptive-opening-lead">{opening.lead}</p><nav aria-label="本展阅读导览">{modules.filter(m => m.navLabel || ['decision', 'route', 'timeline'].includes(m.type)).map(m => <a key={m.id} href={`#adaptive-${m.id}`} onClick={e => { e.preventDefault(); const target = document.getElementById(`adaptive-${m.id}`); target?.focus({ preventScroll: true }); target?.scrollIntoView({ block: 'start' }) }}>{m.navLabel ?? (m.type === 'decision' ? '读会议' : m.type === 'route' ? '看方向' : '理时间')} <span aria-hidden="true">↓</span></a>)}</nav></> : <p className="adaptive-opening-lead">专题资料正在整理，相关文献与来源可在下方目录查阅。</p>}
    </header>
    {modules.map(module => <ContentModule key={module.id} module={module} media={media} reviewMode={reviewMode} onOpen={onOpen} onMapCompare={onMapCompare} />)}
    <ExhibitionSources sourceIds={refs} events={[event]} images={media} reviewMode={reviewMode}>{reviewMode && <><h4>本试点发布门槛</h4><p>策展内容全部 pending / draft，仅本机预览。文献原件、图片年代与许可、会议确址及分队行程尚未齐备；不得以本轮代码完成替代人工史实审核。</p><EvidenceNote evidence={opening.evidence} reviewMode /></>}</ExhibitionSources>
  </article>
}
