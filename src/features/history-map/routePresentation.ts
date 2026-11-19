import { events, stages } from './data'
import { eventDay, toDay } from './model'
import { displayDirections } from './routeDisplay'
import type { RouteChain } from './routeDisplay'
import type { HistoryState, RoutePhase } from './types'

// Display associations only; these IDs refer to existing regional geometry.
const crossingRoutes: Record<string, string[]> = {
  'EVT-023': ['VIEW-central-20-22', 'VIEW-central-22-25'],
  'EVT-028': ['VIEW-central-25-28', 'VIEW-central-28-20'],
  'EVT-033': ['VIEW-central-20-33'],
  'EVT-034': ['VIEW-central-34-36'],
}
export const routePhaseNames: Record<RoutePhase, string> = {
  march: '长征行军', 'first-north': '1935年西进与首次北上', south: '1935年南下川康',
  west: '1936年西转', north: '1936年再北上', reception: '1936年接应会师', preparation: '长征前准备',
}
export function focusedRouteIds(state: HistoryState): Set<string> {
  const selected = events.find(e => e.id === state.selectedEventId)
  const anchor = selected && eventDay(selected)
  if (selected && anchor && state.routeFocus !== false && state.currentDay >= toDay(anchor) && state.currentDay <= toDay(selected.end_date && selected.end_date > anchor ? selected.end_date : anchor)) {
    if (crossingRoutes[selected.id]) return new Set(crossingRoutes[selected.id])
    // Prefer incoming transitions. Outgoing roads do not describe an arrival.
    return new Set(displayDirections.filter(s => selected.army_ids.includes(s.army_id) && selected.place_ids.includes(s.to_place_id) && s.start_date && s.reveal_date && toDay(s.start_date) <= state.currentDay && Math.abs(toDay(s.reveal_date) - state.currentDay) <= 31).map(s => s.id))
  }
  if (state.mode === 'time' && state.playing) {
    return new Set(displayDirections.filter(s => s.start_date && s.reveal_date && toDay(s.start_date) <= state.currentDay && toDay(s.reveal_date) >= state.currentDay).map(s => s.id))
  }
  const stage = state.mode === 'time' && stages.find(s => s.id === state.stageId)
  return new Set(stage ? displayDirections.filter(s => stage.eventIds.some(id => events.find(e => e.id === id)?.place_ids.includes(s.to_place_id)) && s.army_id === stage.army).map(s => s.id) : [])
}
export interface PresentedRoute extends RouteChain { emphasis: 'focus' | 'related' | 'context' | 'comparison'; opacity: number; width: number }
/** Split a visible prefix only at an existing segment boundary when its display
 * weight changes. Neither source vertices nor time clipping are modified. */
export function presentRoutes(chains: RouteChain[], state: HistoryState): PresentedRoute[] {
  const focus = focusedRouteIds(state)
  const focusedArmies = new Set(chains.filter(c => c.segmentIds.some(id => focus.has(id))).map(c => c.armyId))
  const output: PresentedRoute[] = []
  for (const chain of chains) {
    let offset = 0, previous: PresentedRoute | undefined
    for (const id of chain.segmentIds) {
      const segment = displayDirections.find(s => s.id === id)!
      const coordinates = chain.coordinates.slice(offset, offset + segment.geometry.coordinates.length)
      offset += coordinates.length - 1
      const emphasis = !focusedArmies.size ? 'comparison' : focus.has(id) ? 'focus' : focusedArmies.has(chain.armyId) ? 'related' : 'context'
      const opacity = { comparison: 1, focus: 1, related: .66, context: .43 }[emphasis]
      const width = emphasis === 'focus' ? 1.35 : 1
      if (previous?.emphasis === emphasis) { previous.segmentIds.push(id); previous.coordinates.push(...coordinates.slice(1)) }
      else { previous = { armyId: chain.armyId, phase: chain.phase, segmentIds: [id], coordinates, emphasis, opacity, width }; output.push(previous) }
      if (chain.partialSegmentId === id) previous.partialSegmentId = id
    }
  }
  // Focus is drawn last, above other armies; comparison order stays unchanged.
  return output.sort((a, b) => Number(a.emphasis === 'focus') - Number(b.emphasis === 'focus'))
}
