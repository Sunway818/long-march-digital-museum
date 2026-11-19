import type { Dispatch } from 'react'
import { armies, events, places, stages } from './data'
import { armyName } from './model'
import type { HistoryAction } from './model'
import type { HistoryState } from './types'

export function MapControls({ state, dispatch, onStage }: { state: HistoryState; dispatch: Dispatch<HistoryAction>; onStage: (id: string | null) => void }) {
  return <aside className="map-controls map-floating-panel" aria-label="地图筛选与图例">
    <div className="panel-heading"><span>部队与图例</span></div>
    <fieldset className="army-filters"><legend>部队路线</legend><div className="filter-shortcuts"><button onClick={() => dispatch({ type: 'armies', ids: armies.map(a => a.id) })}>全部显示</button><button onClick={() => dispatch({ type: 'armies', ids: [] })}>全部隐藏</button></div>
      {armies.map(army => <div className={'army-control ' + (state.selectedArmy === army.id ? 'is-focused' : '')} key={army.id} style={{ '--army-color': army.color } as React.CSSProperties}>
        <label><input type="checkbox" aria-label={'显示' + (army.id === 'second' ? armyName('second', state.currentDay, state.mode) : army.name)} checked={state.visibleArmies.includes(army.id)} onChange={() => dispatch({ type: 'army', id: army.id })} /><i aria-hidden="true" /><span>{{ central: '红一方面军', second: state.mode === 'overview' ? '红二、红六军团' : armyName('second', state.currentDay), fourth: '红四方面军', twentyfive: '红二十五军' }[army.id]}{army.id === 'central' && <small>中央红军</small>}{army.id === 'second' && <small>{state.mode === 'overview' ? '1936.07.05 编为红二方面军' : '1936.07.05 编成'}</small>}</span></label>
      </div>)}
      <label className="reception-filter"><input type="checkbox" aria-label="显示1936年红一方面军接应会师线" checked={state.showReception !== false} disabled={!state.visibleArmies.includes('central')} onChange={e => dispatch({ type: 'reception', enabled: e.target.checked })} /><span>1936年接应会师线<small>与1934—1935长征分列</small></span></label>
    </fieldset>
    <section className="map-legend" aria-labelledby="map-legend-title"><h2 id="map-legend-title">读图说明</h2><div><span className="legend-symbol" aria-hidden="true">○</span>行军<span className="legend-symbol" aria-hidden="true">★</span>会议</div><div><span className="legend-symbol" aria-hidden="true">◇</span>战斗<span className="legend-symbol" aria-hidden="true">◎</span>会师</div><p><span className="legend-line" />虚线与箭头：区域行进方向</p><div className="campaign-key"><small><i className="campaign-south" />1935 南下川康</small><small><i className="campaign-north" />1936 再北上</small><small><i className="campaign-relief" />1936 红一接应</small></div><p><span className="legend-point is-regional">?</span>地域参考，历史确址待核</p><small>本版无精确路线实线。{places.filter(p => p.longitude !== null).length}个地域参考点，{events.length}项资料；{places.filter(p => p.longitude === null).length}处未定位。</small></section>
    <details className="stage-filters"><summary>按历史阶段查阅</summary><button className="stage-reset" aria-pressed={!state.stageId} onClick={() => onStage(null)}>全部历史阶段</button>{stages.map(stage => <button key={stage.id} aria-pressed={state.stageId === stage.id} onClick={() => onStage(stage.id)}>{stage.label}</button>)}</details>
  </aside>
}
