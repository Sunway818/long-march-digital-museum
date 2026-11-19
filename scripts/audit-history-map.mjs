import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'

const read = name => JSON.parse(readFileSync(`src/data/history/map/${name}.json`, 'utf8'))
const places = read('places'), events = read('events'), routes = read('routes')
const images = read('images'), documents = read('documents'), sources = read('sources'), config = read('map-config')
const sha = bytes => createHash('sha256').update(bytes).digest('hex')
const check = (value, message) => { if (!value) throw Error(message) }
check(sha(readFileSync(resolve('research/overnight_20261110', config.workbook))) === config.workbook_sha256, '原始工作簿 SHA-256 已变化')
const sets = Object.fromEntries(Object.entries({ places, events, images, documents, sources }).map(([name, list]) => {
  const ids = new Set(list.map(e => e.id)); check(ids.size === list.length, `${name}编号重复`); return [name, ids]
}))
for (const row of [...places, ...events, ...routes.nodes]) {
  for (const [field, target] of Object.entries({ source_ids: 'sources', coordinate_source_ids: 'sources', related_event_ids: 'events', place_ids: 'places', image_ids: 'images', document_ids: 'documents' })) {
    check((row[field] ?? []).every(id => sets[target].has(id)), `悬空引用 ${row.id ?? row.route_id}:${field}`)
  }
  if (row.start_date && row.end_date) check(row.start_date <= row.end_date, `日期逆序 ${row.id ?? row.route_id}`)
}
for (const p of places) {
  check((p.longitude === null) === (p.latitude === null), `${p.id}经纬度未配对`)
  if (p.longitude !== null) check(p.coordinate_source_ids.length && p.coordinate_precision === 'regional', `${p.id}区域精度与来源不符`)
}
for (const segment of routes.segments) {
  check(segment.display_style === 'dashed' && segment.geometry_confidence === 'regional-direction-only' && segment.evidence_locator && segment.source_ids.length, `${segment.id}缺失示意限定/证据`)
  const from = places.find(p => p.id === segment.from_place_id), to = places.find(p => p.id === segment.to_place_id)
  check(JSON.stringify(segment.geometry.coordinates) === JSON.stringify([[from.longitude, from.latitude], [to.longitude, to.latitude]]), `${segment.id}位置偏移`)
}
const saved = JSON.parse(readFileSync('research/overnight_20261110/images/data/download-results.json', 'utf8')).filter(row => row.localPath)
for (const row of saved) {
  check(row.localPath.startsWith('research/'), `${row.id}原件被指向公开目录`)
  check(existsSync(row.localPath) && sha(readFileSync(row.localPath)) === row.sha256, `${row.id}本地原件不存在或校验失败`)
}
const csv = (name, headers, rows) => {
  const quote = value => '"' + String(value ?? '').replaceAll('"', '""') + '"'
  writeFileSync(`research/map_stage1_20261110/${name}.csv`, '\ufeff' + [headers, ...rows].map(row => row.map(quote).join(',')).join('\r\n') + '\r\n')
}
csv('coordinate-audit', ['地点编号', '地点名称', '现代行政区划', '参考经度', '参考纬度', '坐标精度', '地名库记录', '坐标来源', '定位说明'], places.map(p => [p.id, p.name, p.modern_location, p.longitude, p.latitude, p.coordinate_precision, p.coordinate_record_name, p.coordinate_record_url, p.coordinate_note]))
csv('unlocated-places', ['地点编号', '地点名称', '原文日期', '现代行政区划', '来源编号'], places.filter(p => p.longitude === null).map(p => [p.id, p.name, events.find(e => e.place_ids.includes(p.id))?.date_text, p.modern_location, p.source_ids.join(';')]))
csv('route-segment-audit', ['方向示意编号', '部队', '起点编号', '终点编号', '来源编号', '具体出处', '核验状态', '限定说明'], routes.segments.map(s => [s.id, s.army_id, s.from_place_id, s.to_place_id, s.source_ids.join(';'), s.evidence_locator, s.verification_status, s.note]))
const result = {
  checkedAt: new Date().toISOString(), workbook: config.workbook, workbookSha256: config.workbook_sha256,
  places: places.length, events: events.length, regionalReferences: places.filter(p => p.longitude !== null).length,
  missingCoordinates: places.filter(p => p.longitude === null).length, exactHistoricalCoordinates: 0,
  routeNodeRows: routes.nodes.length, distinctOriginalRouteIds: new Set(routes.nodes.map(n => n.route_id)).size,
  directionDiagrams: routes.segments.length, exactRouteSegments: 0, savedImagesVerified: saved.length,
  imagesAvailableForLocalReview: images.filter(i => i.local_preview_url).length,
  documents: documents.length, sources: sources.length, unknownTimeAnchors: events.filter(e => !e.start_date).map(e => e.id),
  armies: config.armies.map(a => ({ ...a, events: events.filter(e => e.army_ids.includes(a.id)).length, routeNodeRows: routes.nodes.filter(n => n.army_id === a.id).length, regionalReferences: places.filter(p => p.longitude !== null && p.army_ids.includes(a.id)).length, directionDiagrams: routes.segments.filter(s => s.army_id === a.id).length })),
  checks: '工作簿SHA、92张已存原图SHA、跨表引用、经纬度配对、方向示意端点及出处通过；并非历史事实逐项审核结论',
}
writeFileSync('research/map_stage1_20261110/map-data-audit.json', JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify(result, null, 2))
