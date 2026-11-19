import { useId, useState } from 'react'
import { placeById } from './data'
import { displayDirections } from './routeDisplay'
import { armyPresentation } from './presentation'

export function AdaptiveRouteMap({ routeIds, caption, note, onMapCompare }: { routeIds: string[]; caption?: string; note?: string; onMapCompare?: () => void }) {
  const [selectedArmy, setSelectedArmy] = useState('all')
  const arrow = 'adaptive-arrow-' + useId().replaceAll(':', '')
  const routes = displayDirections.filter(route => routeIds.includes(route.id))
  const coordinates = routes.flatMap(route => route.geometry.coordinates)
  if (!coordinates.length) return null
  const xs = coordinates.map(c => c[0]), ys = coordinates.map(c => c[1])
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys)
  const factor = Math.cos((minY + maxY) / 2 * Math.PI / 180)
  const scale = Math.min(570 / ((maxX - minX) * factor || 1), 280 / (maxY - minY || 1))
  const project = ([x, y]: [number, number]) => [400 + (x - (minX + maxX) / 2) * factor * scale, 205 + ((minY + maxY) / 2 - y) * scale]
  const places = [...new Set(routes.flatMap(route => [route.from_place_id, route.to_place_id]))].map(id => placeById.get(id)).filter(p => p && p.longitude !== null && p.latitude !== null)
  const endX = routes.map(route => project(route.geometry.coordinates.at(-1)!)[0])
  const endCenter = endX.reduce((sum, x) => sum + x, 0) / endX.length
  return <figure className="adaptive-route-figure">
    <div className="adaptive-map-key"><span>地域方向示意 · 非实际道路</span><span>北 ↑</span></div>
    <svg viewBox="0 0 800 420" role="img" aria-label="既有阶段地域方向示意，非实际行军道路">
      <defs>{routes.map(route => <marker key={route.id} id={`${arrow}-${route.army_id}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill={armyPresentation[route.army_id].color} /></marker>)}</defs>
      {routes.map(route => <path key={route.id} data-route-id={route.id} d={route.geometry.coordinates.map((c, i) => `${i ? 'L' : 'M'}${project(c).join(' ')}`).join(' ')} fill="none" stroke={armyPresentation[route.army_id].color} strokeWidth={selectedArmy === route.army_id ? 5 : 3} opacity={selectedArmy === 'all' || selectedArmy === route.army_id ? 1 : .35} strokeDasharray="8 7" markerEnd={`url(#${arrow}-${route.army_id})`}><title>{`${armyPresentation[route.army_id].name}：${route.note}`}</title></path>)}
      {places.map(place => { const [x, y] = project([place!.longitude!, place!.latitude!]); const start = routes.some(r => r.from_place_id === place!.id); return <g key={place!.id} transform={`translate(${x} ${y})`}><circle r="7" fill="#e9e2d4" stroke="#463c31" strokeWidth="2" /><text y={start ? 34 : 5} x={start ? 0 : x < endCenter ? -18 : 18} textAnchor={start ? 'middle' : x < endCenter ? 'end' : 'start'}>{place!.name}</text>{start && <text y="56" textAnchor="middle" className="adaptive-map-subtitle">起点地域参考</text>}</g> })}
    </svg>
    <div className="adaptive-route-controls" role="group" aria-label="方向图部队强调"><button aria-pressed={selectedArmy === 'all'} onClick={() => setSelectedArmy('all')}>全部方向</button>{[...new Set(routes.map(r => r.army_id))].map(id => <button key={id} aria-pressed={selectedArmy === id} onClick={() => setSelectedArmy(id)}><i style={{ background: armyPresentation[id].color }} aria-hidden="true" />{armyPresentation[id].name}</button>)}</div>
    {caption && <figcaption>{caption}</figcaption>}
    {note && <p className="adaptive-route-note">{note}</p>}
    {onMapCompare && <button className="adaptive-map-return" onClick={onMapCompare}>返回原地图对照地域 ↗</button>}
  </figure>
}
