import type { StyleSpecification } from 'maplibre-gl'
import { siteAssetUrl } from '../../assets/siteAssetUrl'

// The source China-sheet layout includes its own South China Sea island frame.
export const chinaBounds: [[number, number], [number, number]] = [[73.45, 17.8], [135.15, 53.6]]
export const chinaSheetStyle: StyleSpecification = {
  version: 8,
  sources: {
    china: { type: 'geojson', data: siteAssetUrl('/assets/map/china-provinces.geojson'), attribution: '<a href="https://geojson.cn/data/atlas/china">GeoJSON.cn 1.5.3</a>' },
    outline: { type: 'geojson', data: siteAssetUrl('/assets/map/china-outline.geojson') },
    rivers: { type: 'geojson', data: siteAssetUrl('/assets/map/china-rivers.geojson'), attribution: '<a href="https://www.naturalearthdata.com/about/terms-of-use/">Natural Earth</a>' },
  },
  layers: [
    { id: 'paper', type: 'background', paint: { 'background-color': '#d9cfb9' } },
    { id: 'china-land', type: 'fill', source: 'china', filter: ['==', ['geometry-type'], 'Polygon'],
      paint: { 'fill-color': '#e9e1cf', 'fill-opacity': .96 } },
    { id: 'china-provinces', type: 'line', source: 'china', filter: ['==', ['geometry-type'], 'Polygon'],
      paint: { 'line-color': '#a39785', 'line-opacity': .36, 'line-width': ['interpolate', ['linear'], ['zoom'], 2, .35, 7, 1] } },
    { id: 'china-rivers', type: 'line', source: 'rivers', minzoom: 4.5,
      paint: { 'line-color': '#778e95', 'line-opacity': .6, 'line-width': ['interpolate', ['linear'], ['zoom'], 4, .65, 9, 1.6] } },
    { id: 'china-border-wash', type: 'line', source: 'outline',
      paint: { 'line-color': '#915f4e', 'line-width': 3, 'line-opacity': .06 } },
    { id: 'china-border', type: 'line', source: 'outline',
      paint: { 'line-color': '#946958', 'line-width': ['interpolate', ['linear'], ['zoom'], 2, 1.2, 6, 1.8], 'line-opacity': .7 } },
    { id: 'china-maritime', type: 'line', source: 'china', filter: ['==', ['geometry-type'], 'LineString'],
      paint: { 'line-color': '#ad4c38', 'line-width': 1.2, 'line-opacity': .7 } },
  ],
}
