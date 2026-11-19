import { buildRouteChains } from './routeDisplay'
import { toDay } from './model'
import type { ArmyId, HistoryState, RouteSegment } from './types'

/** 明确目标优先；多军同时显示且未选择时保持镜头，不按数组首项猜测。 */
export function followArmy(state: HistoryState): ArmyId | null {
  const chosen = state.followArmyId ?? state.selectedArmy
  if (chosen) return state.visibleArmies.includes(chosen) ? chosen : null
  return state.visibleArmies.length === 1 ? state.visibleArmies[0]! : null
}
export function followPosition(segments: RouteSegment[], state: HistoryState) {
  const army = followArmy(state)
  if (!army || !Number.isFinite(state.currentDay)) return null
  const own = segments.filter(s => s.army_id === army)
  // 与渲染使用同一裁切函数、显示锚点、驻留规则；不另算“真实位置”。
  const chains = buildRouteChains(own, { ...state, mode: 'time', visibleArmies: [army] })
  const byId = new Map(own.map(s => [s.id, s]))
  const candidates = chains.flatMap(chain => {
    const segmentId = chain.partialSegmentId ?? chain.segmentIds.at(-1)
    const segment = segmentId ? byId.get(segmentId) : undefined
    const coordinate = chain.coordinates.at(-1)
    if (!segment || !coordinate || !coordinate.every(Number.isFinite)) return []
    const partial = Boolean(chain.partialSegmentId)
    const date = partial ? segment.start_date : segment.reveal_date
    if (!date) return []
    return [{ army, segmentId: segment.id, coordinate, partial, day: toDay(date) }]
  })
  // 多分支优先当前展开段，其次最近完成段；同日按稳定ID选择，避免数组顺序抖动。
  candidates.sort((a, b) => Number(b.partial) - Number(a.partial) || b.day - a.day || a.segmentId.localeCompare(b.segmentId))
  return candidates[0] ?? null
}
