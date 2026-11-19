import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'

const directory = 'research/map_china_sheet_20261111'
const read = name => JSON.parse(readFileSync(directory + '/' + name, 'utf8'))
const provinces = read('china-sheet-wgs84.json')
const topology = read('china-sheet-wgs84.topo.json')
const geometry = topology.objects.default.geometries
const usage = new Map()
const count = arcs => {
  for (const arc of arcs) {
    if (Array.isArray(arc)) count(arc)
    else { const index = arc < 0 ? ~arc : arc; usage.set(index, (usage.get(index) ?? 0) + 1) }
  }
}
geometry.filter(g => g.type === 'Polygon' || g.type === 'MultiPolygon').forEach(g => count(g.arcs))
const decode = index => {
  let x = 0, y = 0
  return topology.arcs[index].map(point => {
    x += point[0]; y += point[1]
    return [x * topology.transform.scale[0] + topology.transform.translate[0],
      y * topology.transform.scale[1] + topology.transform.translate[1]]
  })
}
const collection = features => ({ type: 'FeatureCollection', features })
const exterior = collection([{ type: 'Feature', properties: {},
  geometry: { type: 'MultiLineString', coordinates: [...usage].filter(([, count]) => count === 1).map(([index]) => decode(index)) } }])
// Keep all 34 province geometries and the source's maritime line geometry.
writeFileSync('public/assets/map/china-provinces.geojson', JSON.stringify(provinces))
writeFileSync('public/assets/map/china-outline.geojson', JSON.stringify(exterior))
const rivers = JSON.parse(readFileSync('public/assets/map/rivers.geojson', 'utf8'))
writeFileSync('public/assets/map/china-rivers.geojson', JSON.stringify(collection(
  rivers.features.filter(f => ['Huang', 'Chang Jiang', 'Dadu', 'Jinsha', 'Yangtze'].includes(f.properties.name)))))
const provenance = ['china-sheet-wgs84.json', 'china-sheet-wgs84.topo.json'].map(file => ({
  file, url: 'https://geojson.cn/api/china/1.5.3/china.' + (file.includes('.topo.') ? 'topo.json' : 'json'),
  sha256: createHash('sha256').update(readFileSync(directory + '/' + file)).digest('hex'),
}))
writeFileSync(directory + '/provenance.json', JSON.stringify({
  coordinateSystem: 'WGS84, as documented by GeoJSON.cn for versions before 1.6.0',
  documentation: 'https://geojson.cn/data/atlas/china', version: '1.5.3', files: provenance,
  note: 'Modern geographic reference. Provider China-sheet layout includes a relocated South China Sea island frame. Mainland geometry preserved. No historical coordinate is taken from the inset.',
}, null, 2))
console.log('Built China-only sheet, 34 province regions and national exterior.')
