import { useId } from 'react'
import { displayDirections } from './routeDisplay'
import { eventById, placeById } from './data'
import { campaignBindings, campaignPlaceCaptions, type CampaignSceneId } from './campaignContent'

/** 只读取现有地域方向；不补河流、敌军坐标、实际渡口或缺失道路。 */
export const campaignRoutes = displayDirections.filter(r => campaignBindings.epilogue.routeIds.includes(r.id))
const crossings = (['first','second','third','fourth'] as const).map(id => ({ id, ...campaignBindings[id] }))
export function CampaignRouteMap({ sceneId, onScene }: { sceneId: CampaignSceneId; onScene: (id: CampaignSceneId) => void }) {
  const arrowId = 'campaign-arrow-' + useId().replaceAll(':', '')
  const binding = campaignBindings[sceneId]
  const visible = campaignRoutes.filter(r => sceneId === 'epilogue' || r.id !== 'VIEW-central-36-42')
  const coordinates = visible.flatMap(r => r.geometry.coordinates)
  const lon = coordinates.map(c => c[0]), lat = coordinates.map(c => c[1])
  const minX = Math.min(...lon), maxX = Math.max(...lon), minY = Math.min(...lat), maxY = Math.max(...lat)
  const lonFactor = Math.cos((minY + maxY) / 2 * Math.PI / 180)
  const spanX = (maxX - minX) * lonFactor, spanY = maxY - minY
  const scale = Math.min(504 / (spanX || 1), 316 / (spanY || 1))
  const project = ([x,y]: [number, number]) => [300 + (x - (minX + maxX) / 2) * lonFactor * scale, 202 + ((minY + maxY) / 2 - y) * scale]
  return <section className="campaign-route-map" aria-label="四渡赤水阶段地域方向示意" data-scene={sceneId} data-direction={binding.direction}>
    <div className="campaign-map-heading"><span>{binding.label}</span><h3>{binding.direction}</h3><p>{campaignPlaceCaptions[sceneId]}</p></div>
    <svg viewBox="0 0 600 410" role="img" aria-label="从已有地域参考路线派生的方向图，线条不代表精确渡河道路">
      <defs><marker id={arrowId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#c95549" /></marker></defs>
      {visible.map(route => { const active = binding.routeIds.includes(route.id), aftermath = route.id === 'VIEW-central-36-42'; return <path key={route.id} data-route-id={route.id} data-highlighted={active} data-aftermath={aftermath} d={route.geometry.coordinates.map((c, i) => `${i ? 'L' : 'M'}${project(c).join(' ')}`).join(' ')} fill="none" stroke={active ? aftermath ? '#c4ac7d' : '#c95549' : '#71655b'} strokeWidth={active ? 4 : 1.5} strokeDasharray={aftermath ? '5 6' : '8 5'} markerEnd={active && !aftermath ? `url(#${arrowId})` : undefined}><title>{route.note}</title></path> })}
      {crossings.map(c => {
        const event = eventById.get(c.eventId!)!, point = placeById.get(event.place_ids[0]!)
        if (!point || point.longitude === null || point.latitude === null) return null
        const [x,y] = project([point.longitude, point.latitude]), active = c.id === sceneId
        return <g key={c.id} transform={`translate(${x} ${y})`} role="button" tabIndex={0} aria-label={`阅读${event.title}，地域参考点`} onClick={() => onScene(c.id)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onScene(c.id) } }} className="campaign-map-point" data-selected={active}><title>{event.title} · {point.name} · 历史确址待核</title><circle r="22" fill="transparent" /><circle r={active ? 13 : 9} fill="#191818" stroke={active ? '#f1d3a4' : '#aa8c66'} strokeWidth="2" />{active && <text y="-28" textAnchor="middle" fill="#eee9df" fontSize="22">{event.title}</text>}</g>
      })}
      <text x="550" y="28" fill="#bcb5a9" fontSize="14">北 ↑</text>
    </svg>
    <nav aria-label="四次渡河地图导航">{crossings.map(c => <button key={c.id} aria-pressed={c.id === sceneId} onClick={() => onScene(c.id)}>{c.label}<small>{c.direction}</small></button>)}</nav>
    <p>地域参考 · 虚线为既有阶段方向，非实际道路或精确渡口。三渡至四渡之间的连接表示转场，不作为四渡东渡的精确路线。</p>
    {sceneId === 'epilogue' && <p>古金虚线：四渡之后向云南、金沙江的战略行动，非第五次赤水渡河。</p>}
  </section>
}
