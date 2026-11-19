import { readFileSync, writeFileSync } from 'node:fs'

// Presentation only: no historical coordinates, routes, IDs or dates are changed.
const style = JSON.parse(readFileSync('research/map_stage1_20261110/openfreemap-style.json', 'utf8'))
style.layers = style.layers.filter(layer => !['raster', 'hillshade', 'fill-extrusion'].includes(layer.type))
for (const [id, source] of Object.entries(style.sources)) if (['raster', 'raster-dem'].includes(source.type)) delete style.sources[id]
for (const layer of style.layers) {
  const id = layer.id, paint = layer.paint ??= {}, layout = layer.layout ??= {}
  if (layer.type === 'background') paint['background-color'] = '#dec28c'
  if (layer.type === 'fill') {
    paint['fill-color'] = id.includes('water') ? '#c6a674' : '#e8ce98'
    if (/wood|forest|park/.test(id)) layout.visibility = 'none'
    if (paint['fill-outline-color']) paint['fill-outline-color'] = '#af9465'
    delete paint['fill-pattern']
  }
  if (layer.type === 'line') {
    if (id.includes('water')) {
      paint['line-color'] = '#94703d'; paint['line-opacity'] = .65
      if (id === 'waterway_river') { layer.minzoom = 5; paint['line-width'] = ['interpolate', ['linear'], ['zoom'], 5, .6, 8, 1.3, 12, 2.4] }
    }
    else if (id.includes('boundary')) {
      paint['line-color'] = '#816039'; paint['line-opacity'] = .65; layer.minzoom = 2
      if (id === 'boundary_2' || id === 'boundary_disputed') { paint['line-color'] = '#674326'; paint['line-opacity'] = .9; paint['line-width'] = ['interpolate', ['linear'], ['zoom'], 3, 1.8, 6, 2.5, 12, 4] }
    }
    else if (/road|bridge|tunnel|rail|aeroway/.test(id)) layout.visibility = 'none'
    else { paint['line-color'] = '#b7a27a'; paint['line-opacity'] = .25 }
  }
  if (layer.type === 'symbol') {
    layout['text-field'] = ['coalesce', ['get', 'name:zh'], ['get', 'name']]
    paint['text-color'] = '#776c53'; paint['text-halo-color'] = '#f1e3c2'; paint['text-halo-width'] = 1.2
    if (/label_city/.test(id)) { layer.minzoom = Math.max(layer.minzoom ?? 0, 9); paint['text-opacity'] = .55 }
    if (id === 'waterway_line_label') { layer.minzoom = 7; paint['text-color'] = '#8b6638'; paint['text-opacity'] = .75 }
    if (id === 'label_state') { layer.minzoom = 3; layout['text-size'] = 13; layout['text-letter-spacing'] = .12; paint['text-color'] = '#886a40'; paint['text-opacity'] = .65 }
  }
  if (/poi|housenumber|building|highway|airport|country|road_/.test(id)) layout.visibility = 'none'
}
style.name = '伟大征程 · 中国地域档案图（现代省域参照）'
writeFileSync('public/assets/map/historical-terrain.json', JSON.stringify(style) + '\n')
console.log('档案纸面底图样式已生成；历史数据未改动。')
