import type { Dispatch } from 'react'
import { armies, endDay, events, startDay } from './data'
import { armyName, eventDay, formatDay, toDay } from './model'
import { followArmy } from './cameraFollow'
import type { HistoryAction } from './model'
import type { HistoryState } from './types'

export function UnifiedTimeline({ state, dispatch, onPick, onOverview }: { state: HistoryState; dispatch: Dispatch<HistoryAction>; onPick: (ids: string[]) => void; onOverview: () => void }) {
  const fraction = (state.currentDay - startDay) / (endDay - startDay)
  const important = events.filter(e => e.important && eventDay(e) && toDay(eventDay(e)!) >= startDay && e.army_ids.some(a => state.visibleArmies.includes(a))).sort((a, b) => toDay(eventDay(a)!) - toDay(eventDay(b)!))
  const previous = important.filter(e => toDay(eventDay(e)!) < Math.floor(state.currentDay)).at(-1)
  const next = important.find(e => toDay(eventDay(e)!) > Math.floor(state.currentDay))
  // This is a control band, not another event list. Previous/next still reaches
  // every important dated record without creating additional rows of markers.
  return <section className="unified-timeline" aria-label="长征统一时间轴" data-current-day={state.currentDay} data-playing={String(state.playing)}>
    <div className="timeline-controls">
      <div className="timeline-date" title="时间轴从1934年10月10日中央红军开始战略转移起算。更早的先遣行动可在总览及相关档案阅读。"><span className="timeline-caption">长征进程</span><time>{formatDay(state.currentDay)}</time><span>{state.mode === 'overview' ? '全程总览' : '时间演进'}</span></div>
      <div className="timeline-actions">
        <div className="timeline-transport" role="group" aria-label="事件与播放">
        <button aria-label="上一个重要事件" disabled={!previous} onClick={() => previous && onPick([previous.id])}><span aria-hidden="true">‹</span> 上一事件</button>
        <button className="timeline-play" disabled={!state.visibleArmies.length} aria-label={state.playing ? '暂停历史播放' : state.currentDay >= endDay ? '从起点重播历史' : '开始历史播放'} onClick={() => dispatch({ type: state.playing ? 'pause' : 'play' })}>
          <svg viewBox="0 0 16 16" aria-hidden="true">{state.playing ? <path d="M4 3h3v10H4zm5 0h3v10H9z" /> : <path d="m5 3 8 5-8 5z" />}</svg>{state.playing ? '暂停' : state.currentDay >= endDay ? '重播' : '播放'}
        </button>
        <button aria-label="下一个重要事件" disabled={!next} onClick={() => next && onPick([next.id])}>下一事件 <span aria-hidden="true">›</span></button>
        </div><div className="timeline-settings" role="group" aria-label="播放设置">
        <label className="speed-control">速度<select aria-label="播放速度" value={state.speed} onChange={e => dispatch({ type: 'speed', speed: Number(e.target.value) as 1 | 2 | 4 })}><option value="1">1×</option><option value="2">2×</option><option value="4">4×</option></select></label>
        <label className="follow-control"><input type="checkbox" checked={state.followCamera} onChange={e => dispatch({ type: 'follow', enabled: e.target.checked })} />镜头跟随</label>
        {state.followCamera && <label className="follow-target">目标<select aria-label="镜头跟随部队" value={followArmy(state) ?? ''} onChange={e => dispatch({ type: 'followArmy', id: armies.find(a => a.id === e.target.value)?.id ?? null })}><option value="">请选择部队</option>{armies.filter(a => state.visibleArmies.includes(a.id)).map(army => <option key={army.id} value={army.id}>{armyName(army.id, state.currentDay)}</option>)}</select></label>}
        </div><div className="timeline-secondary" role="group" aria-label="时间轴复位">
        <button onClick={() => dispatch({ type: 'seek', day: startDay })}>返回起点</button>
        <button onClick={onOverview}>全程总览</button>
        </div>
      </div>
    </div>
    <div className="timeline-rail" style={{ '--time-progress': `${fraction * 100}%` } as React.CSSProperties}>
    <div className="timeline-ruler" aria-hidden="true">{[0, .25, .5, .75, 1].map(f => <span key={f} style={{ left: `${f * 100}%` }}>{formatDay(Math.round(startDay + (endDay - startDay) * f)).slice(0, 7)}</span>)}</div>
    <label className="timeline-scrubber"><span className="sr-only">全局历史日期</span><input type="range" aria-label="全局历史日期" min={startDay} max={endDay} value={state.currentDay} aria-valuetext={formatDay(state.currentDay)} onPointerDown={() => dispatch({ type: 'pause' })} onPointerCancel={() => dispatch({ type: 'pause' })} onChange={e => dispatch({ type: 'seek', day: Number(e.target.value) })} onKeyDown={e => {
      const target = e.key === 'PageUp' ? state.currentDay + 30 : e.key === 'PageDown' ? state.currentDay - 30 : e.key === 'Home' ? startDay : e.key === 'End' ? endDay : null
      if (target !== null) { e.preventDefault(); dispatch({ type: 'seek', day: target }) }
    }} /></label>
    </div>
    <p className="timeline-footnote sr-only">1934—1936 · 方向键逐日，PageUp / PageDown调整30日 · 模糊日期按范围定位，非精确发生日</p>
  </section>
}
