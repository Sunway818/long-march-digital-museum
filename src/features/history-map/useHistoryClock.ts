import { useEffect, useRef } from 'react'
import type { Dispatch } from 'react'
import type { HistoryState } from './types'
import type { HistoryAction } from './model'

/** The sole history RAF. It advances accumulated days, never scroll position. */
export function useHistoryClock(state: HistoryState, dispatch: Dispatch<HistoryAction>, active: boolean) {
  const day = useRef(state.currentDay)
  day.current = state.currentDay
  useEffect(() => {
    const hidden = () => { if (document.hidden) dispatch({ type: 'pause' }) }
    document.addEventListener('visibilitychange', hidden)
    return () => document.removeEventListener('visibilitychange', hidden)
  }, [dispatch])
  useEffect(() => { if (!active) dispatch({ type: 'pause' }) }, [active, dispatch])
  useEffect(() => {
    if (!active || !state.playing || document.hidden) return
    let raf = 0, previous: number | null = null, lastPublished = 0
    const tick = (now: number) => {
      if (previous !== null) day.current += Math.min((now - previous) / 1000, .15) * 7 * state.speed
      previous = now
      // One clock, fractional history days. Cap publications at 20Hz so the line
      // grows smoothly without React/GeoJSON worker updates at display refresh rate.
      if (now - lastPublished >= 50) { lastPublished = now; dispatch({ type: 'seek', day: day.current, tick: true }) }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, state.playing, state.speed, dispatch])
}
