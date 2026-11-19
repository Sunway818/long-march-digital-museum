import { useEffect, useEffectEvent, useReducer, useRef, useState } from 'react'
import { armies, endDay, eventById, events, startDay, stages } from './data'
import { createHistoryModel, eventVisible } from './model'
import type { HistoryState } from './types'
import { MapCanvas } from './MapCanvas'
import type { CameraRequest } from './MapCanvas'
import { UnifiedTimeline } from './ParallelTimeline'
import { MapControls } from './MapControls'
import { HistoryPanel } from './HistoryPanel'
import { useHistoryClock } from './useHistoryClock'
import { MapPaper } from './MapPaper'
import { chishuiEventIds, chishuiPlaceIds } from './featuredEvents'
import { focusedRouteIds } from './routePresentation'
import { modules } from '../../data/exhibition'
import '../../styles/history-map.css'
import '../../styles/map-refinement.css'

const reducer = createHistoryModel(events, stages, startDay, endDay)
const initial: HistoryState = { currentDay: startDay, visibleArmies: armies.map(a => a.id), selectedArmy: null, selectedEventId: null, playing: false, speed: 1, mode: 'overview', followCamera: false, stageId: null }
export default function HistoryMapPage({ active, requestedEventId = null, requestedArchive = null, requestedCampaign = false }: { active: boolean; requestedEventId?: string | null; requestedArchive?: string | null; requestedCampaign?: boolean }) {
  const [state, dispatch] = useReducer(reducer, initial)
  const [compactPanel, setCompactPanel] = useState<'armies' | 'history' | null>(null)
  const [choices, setChoices] = useState<string[]>([])
  const [chishuiTopic, setChishuiTopic] = useState(false)
  const [camera, setCamera] = useState<CameraRequest>({ key: 0, placeIds: [] })
  const [layers, setLayers] = useState({ directions: true, labels: true })
  const [toolsOpen, setToolsOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [fullscreenError, setFullscreenError] = useState('')
  const [fullscreen, setFullscreen] = useState(false)
  const root = useRef<HTMLElement>(null)
  const help = useRef<HTMLDialogElement>(null)
  const tools = useRef<HTMLDivElement>(null)
  const toolsButton = useRef<HTMLButtonElement>(null)
  const detailTrigger = useRef<HTMLElement | null>(null)
  useHistoryClock(state, dispatch, active)
  const selected = state.selectedEventId ? eventById.get(state.selectedEventId) ?? null : null
  const visibleChoices = choices.filter(id => {
    const event = eventById.get(id)
    return event && eventVisible(event, state)
  })
  const locate = (placeIds: string[]) => { dispatch({ type: 'follow', enabled: false }); setCamera(c => ({ key: c.key + 1, placeIds })) }
  const select = (id: string, fullTopic = false) => {
    const event = eventById.get(id)
    if (!event) return
    setChishuiTopic(chishuiEventIds.includes(id))
    detailTrigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    if (chishuiEventIds.includes(id)) dispatch({ type: 'mode', mode: fullTopic ? 'overview' : 'time' })
    setCompactPanel('history'); setChoices([]); dispatch({ type: 'select', id, revealArmy: true }); locate(chishuiEventIds.includes(id) ? chishuiPlaceIds : event.place_ids)
  }
  const pick = (ids: string[]) => {
    if (ids.length === 1) select(ids[0]!)
    else if (ids.length) { setCompactPanel('history'); dispatch({ type: 'pause' }); dispatch({ type: 'close' }); setChoices(ids) }
  }
  const overview = () => { setChishuiTopic(false); dispatch({ type: 'mode', mode: 'overview' }); dispatch({ type: 'stage', id: null }); locate([]) }
  // Person archives reuse the existing selection/reveal/date/camera contract.
  const selectLinkedEvent = useEffectEvent((id: string, campaign: boolean) => {
    if (campaign) dispatch({ type: 'armies', ids: ['central'] })
    select(id, campaign)
  })
  useEffect(() => { if (active && requestedEventId) selectLinkedEvent(requestedEventId, requestedCampaign) }, [active, requestedEventId, requestedCampaign])
  useEffect(() => { if (active) root.current?.querySelector<HTMLElement>('h1')?.focus() }, [active])
  useEffect(() => { if (!active) { setHelpOpen(false); setToolsOpen(false); if (document.fullscreenElement === root.current) void document.exitFullscreen().catch(() => {}) } }, [active])
  useEffect(() => {
    const change = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', change)
    change()
    return () => document.removeEventListener('fullscreenchange', change)
  }, [])
  useEffect(() => {
    if (!active || !toolsOpen) return
    const dismiss = (event: PointerEvent) => { if (event.target instanceof Node && !tools.current?.contains(event.target)) setToolsOpen(false) }
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setToolsOpen(false)
      toolsButton.current?.focus()
    }
    document.addEventListener('pointerdown', dismiss)
    document.addEventListener('keydown', escape)
    return () => { document.removeEventListener('pointerdown', dismiss); document.removeEventListener('keydown', escape) }
  }, [active, toolsOpen])
  useEffect(() => {
    const dialog = help.current
    if (!active || !dialog) return
    const restoreFocus = () => toolsButton.current?.focus({ preventScroll: true })
    dialog.addEventListener('close', restoreFocus)
    return () => dialog.removeEventListener('close', restoreFocus)
  }, [active])
  useEffect(() => {
    if (active && helpOpen) help.current?.showModal()
    else help.current?.close()
  }, [active, helpOpen])
  const fullscreenLabel = fullscreen ? '退出全屏' : '全屏'
  return <section ref={root} className="history-map-page" aria-label="长征时空地图" data-mode={state.mode} data-compact-panel={compactPanel ?? ''}>
    <a className="skip-link" href="#history-index" onClick={event => { event.preventDefault(); root.current?.querySelector<HTMLElement>('#history-index')?.focus() }}>跳到历史资料索引</a>
    <header className="map-topbar">
      <div className="map-title-group"><a className="map-brand" href="#home" aria-label="伟大征程，返回首页">伟大征程</a><span className="map-title-rule" /><h1 tabIndex={-1}>长征时空地图</h1><span className="map-years">1934—1936</span></div>
      <nav className="map-chapter-links" aria-label="地图导航">
        <a href="#home">首页</a>
        {modules.map(module => <a key={module.id} href={module.id === 'journey' ? '#map' : `#${module.id}`} aria-current={module.id === 'journey' ? 'page' : undefined}>{module.label}</a>)}
      </nav>
      <div className="map-display-controls" role="group" aria-label="地图显示与工具">
        <div className="map-tools" ref={tools} onBlur={event => { if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) setToolsOpen(false) }}>
          <button type="button" className="map-tools-trigger" ref={toolsButton} title="地图图层与使用说明" aria-label="地图工具" aria-expanded={toolsOpen} aria-controls="map-tools-panel" onClick={() => setToolsOpen(!toolsOpen)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/><path d="M8 3v6m8 0v6m-6 0v6" strokeWidth="2.5"/></svg>
            <span>地图工具</span><svg className="map-tools-chevron" width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" aria-hidden="true"><path d="m2 4 4 4 4-4"/></svg>
          </button>
          <div className="map-tools-panel" id="map-tools-panel" hidden={!toolsOpen}>
            <fieldset><legend>地图图层</legend>{([['directions', '区域方向示意'], ['labels', '历史地点标签']] as const).map(([key, label]) => <label key={key}><input type="checkbox" checked={layers[key]} onChange={event => setLayers(current => ({ ...current, [key]: event.target.checked }))} />{label}</label>)}</fieldset>
            <button type="button" aria-haspopup="dialog" onClick={() => { setToolsOpen(false); setHelpOpen(true) }}>使用说明 <span aria-hidden="true">↗</span></button>
          </div>
        </div>
        <button type="button" className="map-fullscreen" aria-label={fullscreenLabel} aria-pressed={fullscreen} title={fullscreenLabel} onClick={() => {
          const toggle = document.fullscreenElement ? document.exitFullscreen?.() : root.current?.requestFullscreen?.()
          setFullscreenError('')
          if (toggle) void toggle.catch(() => setFullscreenError('浏览器暂不允许全屏，可使用浏览器菜单。'))
          else setFullscreenError('当前浏览器不支持网页全屏，可使用浏览器菜单。')
        }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d={fullscreen ? 'M9 3v6H3m18 0h-6V3M3 15h6v6m6 0v-6h6' : 'M9 3H3v6m12-6h6v6M3 15v6h6m6 0h6v-6'}/></svg></button>
      </div>
    </header>
    <MapCanvas chishuiTopic={chishuiTopic} state={state} dispatch={dispatch} active={active} camera={camera} layers={layers} onPick={pick} />
    <MapPaper />
    {state.mode === 'time' && state.currentDay < startDay + 7 && layers.directions && state.visibleArmies.includes('central') && <p className="map-opening-note">中央红军开始战略转移 · 集结方向先于主力渡河路线展开</p>}
    <div className="map-compact-tools" role="group" aria-label="地图资料面板"><button aria-expanded={compactPanel === 'armies'} onClick={() => setCompactPanel(compactPanel === 'armies' ? null : 'armies')}>部队与图例</button><button aria-expanded={compactPanel === 'history'} onClick={() => setCompactPanel(compactPanel === 'history' ? null : 'history')}>历史资料</button>{compactPanel && <button aria-label="收起资料面板" onClick={() => setCompactPanel(null)}>收起 ×</button>}</div>
    <div className="map-sheet-heading"><span>中国工农红军</span><h2>长征行军图</h2><p>1934—1936 · 区域行进方向示意</p></div>
    <div className="map-view-toolbar"><div className="map-mode-switch" role="group" aria-label="地图模式"><button aria-pressed={!chishuiTopic && state.mode === 'overview'} onClick={overview}>全程总览</button><button aria-pressed={!chishuiTopic && state.mode === 'time'} onClick={() => { setChishuiTopic(false); dispatch({ type: 'mode', mode: 'time' }) }}>时间演进</button><button className="chishui-focus" aria-pressed={chishuiTopic} onClick={() => { dispatch({ type: 'armies', ids: ['central'] }); select('EVT-023', true) }}>四渡赤水专题</button></div><p className="map-observation-mode">{chishuiTopic ? `四渡赤水 · ${state.mode === 'overview' ? '四次行动全程对照' : '按日期演进，保留四处导航点'}` : state.mode === 'overview' ? '全程总览 · 包含1936年路线，不按游标日期裁切' : '时间演进 · 仅显示已展开的地域方向'}{focusedRouteIds(state).size > 0 && <span>当前阶段加粗 · 其他路线保留</span>}</p></div>
    <div className="map-north" aria-hidden="true"><span>北</span><svg viewBox="0 0 28 48"><path d="M14 2 25 37 14 30 3 37Z" fill="none" stroke="currentColor"/><path d="M14 2v28L3 37Z" fill="currentColor"/></svg></div>
    <p className="map-accuracy-note">地域参考 · 线条延伸为时间示意，非逐日位置或精确道路</p>
    <MapControls state={state} dispatch={dispatch} onStage={id => { setChishuiTopic(false); dispatch({ type: 'stage', id }); const stage = stages.find(s => s.id === id); locate(stage ? events.filter(e => stage.eventIds.includes(e.id)).flatMap(e => e.place_ids) : []) }} />
    {!state.visibleArmies.length && <div className="map-empty-state" role="status"><h2>当前未显示部队</h2><p>选择一支部队，继续浏览对应的征程。</p><button onClick={() => dispatch({ type: 'armies', ids: armies.map(a => a.id) })}>恢复全部部队</button></div>}
    <HistoryPanel onRead={() => dispatch({ type: 'pause' })} active={active} selected={selected} requestedArchive={requestedArchive} requestedCampaign={requestedCampaign} choices={visibleChoices} visibleArmies={state.visibleArmies} onSelect={select} onClose={() => { dispatch({ type: 'close' }); setChoices([]); requestAnimationFrame(() => { const target = detailTrigger.current?.isConnected ? detailTrigger.current : root.current?.querySelector<HTMLElement>('.history-search input'); target?.focus({ preventScroll: true }) }) }} onLocate={ids => locate(ids)} />
    <button className="map-reset-camera" onClick={() => locate([])}>重置视野</button>
    <UnifiedTimeline state={state} dispatch={dispatch} onPick={pick} onOverview={overview} />
    {fullscreenError && <p className="fullscreen-message" role="status">{fullscreenError}</p>}
    <dialog ref={help} className="map-help-dialog" aria-labelledby="map-help-title" onCancel={() => setHelpOpen(false)}>
      <h2 id="map-help-title">如何阅读这幅地图</h2><button autoFocus onClick={() => setHelpOpen(false)}>关闭说明</button>
      <ol>
        <li>想先读懂一段历史，可以从「四渡赤水专题」开始。点地图节点或在「历史资料」检索，再打开「深入了解」。档案打开时可复制地址，分享同一展品。</li>
        <li>「全程总览」展示各部队方向；「播放」和拖动日期则按时间逐段展开。时间轴从1934年10月10日中央红军开始战略转移起算。此前红六军团的先遣行动仍可在总览及相关档案阅读。</li>
        <li>拖动地图平移；双指捏合、鼠标滚轮或地图上的加减按钮可缩放。用「部队与图例」选择路线，「重置视野」回到长征沿线。</li>
        <li>虚线是区域行进方向，节点是现代地域参照。线条展开只表示展陈时间，不表示当日确址、匀速行军或实际道路。</li>
        <li>四渡赤水专题单独显示中央红军；可在部队栏恢复全部路线。1936年接应线可单独切换。手动移动地图会取消镜头跟随。</li>
      </ol>
      <p>河流：Natural Earth；区域点：GeoNames（CC BY 4.0）。中国底图：GeoJSON.cn 1.5.3；边界为现代地域参照。</p>
    </dialog>
  </section>
}
