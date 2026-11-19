import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { armies, eventById, placeById } from './data'
import { armyName, displayDateText, eventDay, hasCoordinate, toDay } from './model'
import type { ArmyId, HistoricalEvent } from './types'
import { HistoryArchive } from './HistoryArchive'
import { ImageCard } from './HistoryMedia'
import { archiveDrafts, exhibitionImages } from './archiveContent'
import { canPreviewArchive, isArchiveReviewMode } from './exhibitionContent'
import { crossingLegends } from './campaignNotes'
import { featuredEvents } from './curation'
import { chishuiEventIds, featuredNotes } from './featuredEvents'
import { exhibitionDefinitions, migratedEventIds } from './exhibitionDefinitions'
import { adaptiveExhibitions } from './adaptiveExhibitions'
import { animateMotion, cancelMotion, motion } from '../../animations/motion'

export function HistoryPanel({ active, selected, requestedArchive, requestedCampaign, choices, visibleArmies, onSelect, onClose, onLocate, onRead }: { active: boolean; selected: HistoricalEvent | null; requestedArchive: string | null; requestedCampaign: boolean; choices: string[]; visibleArmies: ArmyId[]; onSelect: (id: string) => void; onClose: () => void; onLocate: (ids: string[]) => void; onRead: () => void }) {
  const [archiveId, setArchiveId] = useState<string | null>(null)
  const [campaignOpen, setCampaignOpen] = useState(false)
  const [search, setSearch] = useState('')
  const root = useRef<HTMLElement>(null)
  const imageTrigger = useRef<HTMLElement | null>(null)
  const returnHash = useRef('#map')
  const openedLink = useRef<string | null>(null)
  useEffect(() => { openedLink.current = null; if (!active || !requestedArchive) setArchiveId(null) }, [active, requestedArchive, requestedCampaign])
  useLayoutEffect(()=>{
    const element=root.current
    if(!element)return
    const detail=element.querySelector('.history-detail')
    if(active&&selected)animateMotion(detail,'event-detail',[{opacity:.45,transform:'translateX(9px)'},{opacity:1,transform:'translateX(0)'}],{duration:motion.reveal})
    return()=>{if(detail)cancelMotion(detail)}
  },[active,selected?.id])
  useEffect(() => { if (choices.length) setSearch('') }, [choices])
  useLayoutEffect(() => { if (selected) { if (root.current) root.current.scrollTop = 0; root.current?.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true }) }; setArchiveId(null) }, [selected?.id])
  useEffect(() => {
    if (!active || !requestedArchive || selected?.id !== requestedArchive) return
    if (openedLink.current === requestedArchive) return
    openedLink.current = requestedArchive
    returnHash.current = '#map?event=' + requestedArchive
    imageTrigger.current = null
    setCampaignOpen(requestedCampaign)
    setArchiveId(requestedArchive)
  }, [active, requestedArchive, requestedCampaign, selected?.id])
  const place = selected ? placeById.get(selected.place_ids[0]!) : null
  const reviewMode = isArchiveReviewMode()
  const previewMode = canPreviewArchive()
  const isSample = Boolean(selected && exhibitionDefinitions[selected.id])
  const adaptive = selected ? adaptiveExhibitions[selected.id] : undefined
  const selectedImages = selected ? exhibitionImages(selected, previewMode) : []
  const setArchiveAddress = (id: string, campaign: boolean) => history.replaceState(history.state, '', '#map?archive=' + (campaign ? 'EVT-023&topic=chishui' : encodeURIComponent(id)))
  const closeArchive = () => {
    if (location.hash.startsWith('#map?archive=')) history.replaceState(history.state, '', returnHash.current)
    setArchiveId(null)
    setCampaignOpen(false)
  }
  const open = (campaign: boolean) => {
    if (!selected) return
    imageTrigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    returnHash.current = location.hash
    onRead()
    setCampaignOpen(campaign)
    setArchiveId(selected.id)
    setArchiveAddress(selected.id, campaign)
  }
  const note = selected ? featuredNotes[selected.id] : undefined
  const catalogue = migratedEventIds.map(id => eventById.get(id)!).filter(Boolean)
  const pilots = Object.keys(adaptiveExhibitions).map(id => eventById.get(id)!).filter(Boolean)
  const query = search.trim().toLowerCase()
  const searchPool = query ? [...new Map([...featuredEvents, ...catalogue, ...pilots].map(e => [e.id, e])).values()] : featuredEvents
  const list = (choices.length ? choices.map(id => eventById.get(id)).filter((e): e is HistoricalEvent => Boolean(e)) : searchPool).filter(e =>
    [e.title, exhibitionDefinitions[e.id]?.title, ...e.place_ids.map(id => placeById.get(id)?.name), e.id, displayDateText(e.date_text)].join(' ').toLowerCase().includes(query))
  return <aside ref={root} id="history-index" tabIndex={-1} className="history-panel map-floating-panel" aria-label="历史事件资料">
    <div className="panel-heading"><span>精选历史节点</span>{selected && <button aria-label="关闭事件详情" onClick={onClose}>返回索引</button>}</div>
    {selected && place ? <article className="history-detail" key={selected.id} data-event-id={selected.id}>
      {reviewMode && <p className="archive-id">{selected.id} / {place.id}</p>}<h2 tabIndex={-1}>{selected.title}</h2>{(!adaptive || previewMode) && <><p>{place.name}</p><p className="event-date">{adaptive?.opening.date ?? displayDateText(selected.date_text)}</p>
      <div className="event-army-tags">{armies.filter(a => selected.army_ids.includes(a.id)).map(army => <span key={army.id} style={{ '--army-color': army.color } as React.CSSProperties}><i aria-hidden="true" />{army.id === 'second' && eventDay(selected) ? armyName('second', toDay(eventDay(selected)!)) : army.name}</span>)}</div></>}
      <button className="archive-open" onClick={() => open(false)}>深入了解 <span aria-hidden="true">→</span></button>
      {chishuiEventIds.includes(selected.id) && <button className="campaign-open" aria-label="走进四渡赤水，阅读四渡赤水完整专题" onClick={() => open(true)}><strong><span>走进</span>四渡赤水</strong><span>四次渡河 · 战略转折 · 历史全景</span><small>进入完整历史专题 <i aria-hidden="true">→</i></small></button>}
      {chishuiEventIds.includes(selected.id) && <section className="chishui-sequence" aria-label="四渡赤水行动次序"><h3>四渡赤水</h3><p>中央红军 · 1935年1月至3月</p>{chishuiEventIds.map(id => { const event = eventById.get(id)!; return <button key={id} aria-label={'查看' + event.title} aria-pressed={id === selected.id} onClick={() => onSelect(id)}><span>{event.title}</span><small>{crossingLegends[id]?.split(' · ')[1]}</small></button> })}</section>}
      <p className="archive-lead">{adaptive ? previewMode ? adaptive.opening.lead : '专题资料正在整理，可进入展厅查阅文献与来源。' : ((!isSample || previewMode) && archiveDrafts[selected.id]?.lead) || note?.summary || selected.summary.split(' 背景：')[0]!.replace(/^经过：/, '')}</p>
      {selectedImages[0] && <ImageCard image={selectedImages[0]} onOpen={() => open(false)} action="查看影像档案" />}
      {selected.verification_status === 'disputed' && <p className="date-precision-note">不同资料记载有差异，可查阅档案中的依据。</p>}
      <button className="locate-place" disabled={!hasCoordinate(place)} onClick={() => onLocate([place.id])}>{hasCoordinate(place) ? '定位区域参考点' : '历史坐标未确认，暂不定位'}</button>
    </article> : <div className="history-index">
      <p className="archive-id">1934—1936</p><h2>{choices.length ? '选择这一地域的事件' : '循图读史'}</h2>
      <p className="index-intro">第一次来？可先阅读「四渡赤水专题」，也可用时间轴看各军如何前行。图上地点是地域参考。</p>
      <details className="exhibition-catalogue"><summary>历史专题展厅</summary><p>按事件类型阅读；未定位节点保留文字与资料。</p>{catalogue.map(event => <button key={event.id} onClick={() => onSelect(event.id)}>{exhibitionDefinitions[event.id]!.title}<small>{displayDateText(event.date_text)}</small></button>)}</details>
      <label className="history-search">精选节点检索<input type="search" placeholder="如：遵义、1935、会师" value={search} onChange={e => setSearch(e.target.value)} /></label>
      {choices.length > 0 && <button onClick={onClose}>返回全部资料</button>}
      <p className="index-count">{list.length}项{choices.length ? '关联资料' : query ? '搜索结果 · 限精选与专题' : '精选节点'}</p>
      <div className="history-event-list">{list.map(event => <button key={event.id} onClick={() => onSelect(event.id)}><span className={'event-kind kind-' + event.kind} aria-hidden="true">{{ meeting: '会', reunion: '合', battle: '战', march: '行' }[event.kind]}</span><span><strong>{exhibitionDefinitions[event.id]?.title ?? event.title}</strong><small>{displayDateText(event.date_text)}</small><small>{placeById.get(event.place_ids[0]!)?.name}</small>{!event.army_ids.some(id => visibleArmies.includes(id)) && <small>显示相关部队并定位</small>}</span></button>)}</div>
      {!list.length && <p>未在精选节点和专题中找到匹配资料。可换一个词，或展开上方专题目录。</p>}
    </div>}
    {active && archiveId && <HistoryArchive eventId={archiveId} topic={campaignOpen ? 'chishui' : undefined} onMapEvent={id => { closeArchive(); onSelect(id) }} onNavigate={id => { setArchiveId(id); setArchiveAddress(id, false) }} close={closeArchive} returnFocus={imageTrigger.current} onMapCompare={archiveId === selected?.id ? () => {
      closeArchive()
      requestAnimationFrame(() => root.current?.closest('.history-map-page')?.querySelector<HTMLElement>('.history-marker[data-selected="true"]:not([hidden])')?.focus({ preventScroll: true }))
    } : undefined} />}
  </aside>
}
