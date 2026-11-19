import rawPlaces from '../../data/history/map/places.json' with { type: 'json' }
import rawEvents from '../../data/history/map/events.json' with { type: 'json' }
import rawRoutes from '../../data/history/map/routes.json' with { type: 'json' }
import rawImages from '../../data/history/map/images.json' with { type: 'json' }
import mediaFiles from '../../data/history/map/media-files.json' with { type: 'json' }
import rawDocuments from '../../data/history/map/documents.json' with { type: 'json' }
import rawSources from '../../data/history/map/sources.json' with { type: 'json' }
import config from '../../data/history/map/map-config.json' with { type: 'json' }
import enrichment from '../../data/history/map/route-enrichment.json' with { type: 'json' }
import campaigns from '../../data/history/map/campaign-references.json' with { type: 'json' }
import audit from '../../data/history/map/route-audit.json' with { type: 'json' }
import { siteAssetUrl } from '../../assets/siteAssetUrl'
import exhibitionSources from '../../data/history/exhibitions/sources.json' with { type: 'json' }
import adaptiveSources from '../../data/history/exhibitions/adaptive-sources.json' with { type: 'json' }
import { formationEvent, campaignAnchors, eventRefinements } from './campaignNotes'
import type { Army, HistoricalEvent, HistoricalPlace, HistoryDocument, HistoryImage, HistorySource, RouteNode, RouteSegment, Stage } from './types'
import { toDay } from './model'
import { armyDisplayOrder, armyPresentation } from './presentation'
export { config }
const locationSupplements = new Map(enrichment.locations.map(p => [p.placeId, p]))
const reviewedLocations = new Map([...campaigns.locations, ...audit.locations].map(p => [p.placeId, p]))
export const places: HistoricalPlace[] = rawPlaces.map(place => {
  const reviewed = reviewedLocations.get(place.id)
  if (reviewed) return { ...place, longitude: reviewed.longitude, latitude: reviewed.latitude, coordinate_precision: 'regional',
    coordinate_source_ids: ['SRC-0079'], coordinate_record_url: `https://www.geonames.org/${reviewed.geonamesId}/`,
    coordinate_record_name: reviewed.referenceName, coordinate_note: `现代地域参照：${reviewed.referenceName}。${'scopeNote' in reviewed ? reviewed.scopeNote : ''}历史确址待核。`,
    related_event_ids: place.id === 'PLC-0100' ? [...place.related_event_ids, formationEvent.id] : place.related_event_ids } as HistoricalPlace
  if (place.id === 'PLC-0100') return { ...place, related_event_ids: [...place.related_event_ids, formationEvent.id] } as HistoricalPlace
  const supplement = locationSupplements.get(place.id)
  if (!supplement) return place as HistoricalPlace
  if (place.longitude !== null || place.latitude !== null) throw Error('Cannot overwrite an existing geographic reference: ' + place.id)
  return { ...place, longitude: supplement.longitude, latitude: supplement.latitude, coordinate_precision: 'regional',
    coordinate_source_ids: [supplement.sourceId], coordinate_record_url: `https://www.geonames.org/${supplement.geonamesId}/`,
    coordinate_record_name: supplement.referenceName,
    coordinate_note: `现代${supplement.referenceName}参考（GeoNames ${supplement.geonamesId}，WGS84）；${supplement.scopeNote}历史确址待核。` } as HistoricalPlace
})
// Named reference points used only in regional lines; they have no event marker.
export const routeWaypoints = new Map([...campaigns.waypoints, ...audit.waypoints].map(p => [p.placeId, p]))
export const events: HistoricalEvent[] = rawEvents.map(event => {
  const anchor = campaignAnchors[event.id] ?? enrichment.eventAnchors.find(a => a.eventId === event.id)
  const refinement = eventRefinements[event.id]
  return { ...event, ...refinement,
    source_ids: [...new Set([...event.source_ids, ...(refinement?.source_ids ?? [])])],
    ...(anchor ? { display_date: anchor.date, anchor_note: `${event.anchor_note} ${anchor.note}` } : {}),
  } as HistoricalEvent
}).concat(formationEvent)
export const routes = rawRoutes as { nodes: RouteNode[]; segments: RouteSegment[] }
export const images: HistoryImage[] = rawImages.map(image => {
  const path = (mediaFiles as Record<string, string>)[image.id]
  return { ...image, local_preview_url: path ? siteAssetUrl(path) : null }
})
export const documents = rawDocuments as HistoryDocument[]
export const sources = [...rawSources, ...enrichment.sources, ...campaigns.sources, ...audit.sources, ...exhibitionSources, ...adaptiveSources] as HistorySource[]
export const armies: Army[] = armyDisplayOrder.map(id => ({ id, ...armyPresentation[id] }))
export const startDay = toDay('1934-10-10')
export const endDay = toDay(config.end_date)
export const placeById = new Map(places.map(p => [p.id, p]))
export const eventById = new Map(events.map(e => [e.id, e]))
export const sourceById = new Map(sources.map(s => [s.id, s]))
const labels = ['战略转移与突破封锁', '遵义会议与四渡赤水', '金沙江与大渡河', '雪山草地与甘南', '陕北落脚与会师']
export const stages: Stage[] = [
  ...labels.map((label, i) => ({ id: 'central-' + (i + 1), label, army: 'central' as const, list: events.filter(e => e.batch === i + 1 && e.army_ids.includes('central')) })),
  ...(['twentyfive', 'fourth', 'second'] as const).map(army => ({ id: army, label: { twentyfive: '红二十五军长征', fourth: '红四方面军长征', second: '红二、红六军团长征' }[army], army, list: events.filter(e => e.army_ids.includes(army)) })),
].map(stage => ({ id: stage.id, label: stage.label, army: stage.army, eventIds: stage.list.map(e => e.id), firstDay: Math.max(startDay, Math.min(...stage.list.filter(e => e.start_date).map(e => toDay(e.start_date!)))) }))
