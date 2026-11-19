import type { ArmyId, HistoricalEvent, HistoricalPlace, HistoryState, RouteSegment, Stage } from './types'

export const DAY = 86_400_000
export const toDay = (iso: string) => Math.floor(Date.parse(iso + 'T00:00:00Z') / DAY)
export const isoDay = (day: number) => new Date(day * DAY).toISOString().slice(0, 10)
export const formatDay = (day: number) => isoDay(day).replaceAll('-', '.')
export const eventDay = (event: HistoricalEvent) => event.display_date ?? event.start_date
export const displayDateText = (text: string) => text.replace(/[（(]v\d+(?:\.\d+)*(?:既有记载|范围)?[）)]/gi, '').trim()
export function armyName(id: ArmyId, day: number, mode: HistoryState['mode'] = 'time') {
  if (id !== 'second') return { central: '中央红军', twentyfive: '红二十五军', fourth: '红四方面军' }[id]
  if (mode === 'overview') return '红二、红六军团及红二方面军'
  if (day < toDay('1934-10-24')) return '红六军团（先遣）'
  return day < toDay('1936-07-05') ? '红二、红六军团' : '红二方面军'
}
export type HistoryAction =
  | { type: 'reception'; enabled: boolean }
  | { type: 'seek'; day: number; tick?: boolean }
  | { type: 'select'; id: string; revealArmy?: boolean }
  | { type: 'army'; id: ArmyId } | { type: 'armies'; ids: ArmyId[] }
  | { type: 'focusArmy'; id: ArmyId | null }
  | { type: 'play' } | { type: 'pause' } | { type: 'close' }
  | { type: 'speed'; speed: 1 | 2 | 4 } | { type: 'mode'; mode: HistoryState['mode'] }
  | { type: 'follow'; enabled: boolean } | { type: 'stage'; id: string | null }
  | { type: 'followArmy'; id: ArmyId | null }

export function createHistoryModel(events: HistoricalEvent[], stages: Stage[], startDay: number, endDay: number) {
  const byId = new Map(events.map(e => [e.id, e]))
  const clamp = (day: number, fractional = false) => Number.isFinite(day) ? Math.max(startDay, Math.min(endDay, fractional ? day : Math.floor(day))) : startDay
  function reconcile(state: HistoryState): HistoryState {
    if (state.followArmyId && !state.visibleArmies.includes(state.followArmyId)) state = { ...state, followCamera: false, followArmyId: null }
    if (!state.visibleArmies.length) return { ...state, selectedEventId: null, selectedArmy: null, routeFocus: false, playing: false, followCamera: false, followArmyId: null }
    const selected = state.selectedEventId ? byId.get(state.selectedEventId) : null
    if (selected && (!selected.army_ids.some(id => state.visibleArmies.includes(id)) || (state.mode === 'time' && eventDay(selected) && toDay(eventDay(selected)!) > state.currentDay))) return { ...state, selectedEventId: null, selectedArmy: null, routeFocus: false }
    return state.selectedArmy && !state.visibleArmies.includes(state.selectedArmy) ? { ...state, selectedArmy: null } : state
  }
  return (state: HistoryState, action: HistoryAction): HistoryState => {
    switch (action.type) {
      case 'reception': return { ...state, showReception: action.enabled }
      case 'seek': return reconcile({ ...state, mode: 'time', currentDay: clamp(action.day, Boolean(action.tick)), playing: Boolean(action.tick && state.playing && action.day < endDay) })
      case 'select': {
        const event = byId.get(action.id)
        if (!event) return state
        const alreadyVisible = event.army_ids.some(a => state.visibleArmies.includes(a))
        const visible = action.revealArmy && !alreadyVisible ? [...new Set([...state.visibleArmies, ...event.army_ids])] : state.visibleArmies
        if (!event.army_ids.some(a => visible.includes(a))) return state
        // 会师/混合编组事件涉及多军时，保留仍参与该事件的明确目标，不按数组首项换军。
        const preferred = state.followArmyId ?? state.selectedArmy
        const selectedArmy = preferred && visible.includes(preferred) && event.army_ids.includes(preferred) ? preferred : event.army_ids.find(a => visible.includes(a))!
        return { ...state, currentDay: eventDay(event) ? clamp(toDay(eventDay(event)!)) : state.currentDay, selectedEventId: event.id, selectedArmy, followArmyId: selectedArmy, playing: false, visibleArmies: visible, routeFocus: true }
      }
      case 'army': return reconcile({ ...state, visibleArmies: state.visibleArmies.includes(action.id) ? state.visibleArmies.filter(a => a !== action.id) : [...state.visibleArmies, action.id] })
      case 'armies': return reconcile({ ...state, visibleArmies: action.ids })
      case 'focusArmy': return { ...state, selectedArmy: action.id }
      case 'play': return state.visibleArmies.length ? { ...state, mode: 'time', playing: true, currentDay: state.currentDay >= endDay ? startDay : state.currentDay, selectedEventId: state.currentDay >= endDay ? null : state.selectedEventId } : state
      case 'pause': return { ...state, playing: false }
      case 'close': return { ...state, selectedEventId: null, selectedArmy: null, routeFocus: false }
      case 'speed': return { ...state, speed: action.speed }
      case 'mode': return reconcile({ ...state, mode: action.mode, playing: false, followCamera: action.mode === 'overview' ? false : state.followCamera, routeFocus: action.mode === 'overview' ? false : state.routeFocus, selectedArmy: action.mode === 'overview' ? null : state.selectedArmy })
      case 'follow': return { ...state, followCamera: action.enabled, ...(action.enabled ? { mode: 'time' as const, followArmyId: state.followArmyId ?? state.selectedArmy ?? (state.visibleArmies.length === 1 ? state.visibleArmies[0]! : null) } : {}) }
      case 'followArmy': return action.id && !state.visibleArmies.includes(action.id) ? state : { ...state, followArmyId: action.id, selectedArmy: action.id }
      case 'stage': {
        const stage = stages.find(s => s.id === action.id)
        return stage ? { ...state, stageId: stage.id, currentDay: clamp(stage.firstDay), selectedArmy: stage.army, followArmyId: stage.army, selectedEventId: null, playing: false, mode: 'time', visibleArmies: [...new Set([...state.visibleArmies, stage.army])] } : { ...state, stageId: null }
      }
    }
  }
}
export function eventVisible(event: HistoricalEvent, state: HistoryState) {
  return event.army_ids.some(a => state.visibleArmies.includes(a)) && (state.mode === 'overview' || Boolean(eventDay(event) && toDay(eventDay(event)!) <= state.currentDay))
}
export function visibleSegments(segments: RouteSegment[], state: HistoryState) {
  return segments.filter(s => state.visibleArmies.includes(s.army_id) && (state.mode === 'overview' || Boolean(s.reveal_date && toDay(s.reveal_date) <= state.currentDay)))
}
export function hasCoordinate(p: HistoricalPlace): p is HistoricalPlace & { longitude: number; latitude: number } {
  return p.coordinate_precision !== 'unverified' && p.longitude !== null && p.latitude !== null && Number.isFinite(p.longitude) && Number.isFinite(p.latitude)
}
export function lastKnownEvents(events: HistoricalEvent[], state: HistoryState) {
  return state.visibleArmies.flatMap(army => events.filter(e => e.army_ids.includes(army) && eventDay(e) && toDay(eventDay(e)!) <= state.currentDay).sort((a, b) => toDay(eventDay(b)!) - toDay(eventDay(a)!)).slice(0, 1))
}
export function clusterTimeline(events: HistoricalEvent[], start: number, end: number, width: number) {
  const groups: { position: number; events: HistoricalEvent[] }[] = []
  for (const event of events.filter(e => e.start_date).sort((a, b) => toDay(a.start_date!) - toDay(b.start_date!))) {
    const position = (toDay(event.start_date!) - start) / (end - start)
    const last = groups.at(-1)
    if (last && (position - last.position) * width < 28) last.events.push(event)
    else groups.push({ position, events: [event] })
  }
  return groups
}
