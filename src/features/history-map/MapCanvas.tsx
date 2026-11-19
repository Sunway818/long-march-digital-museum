import { useEffect, useMemo, useRef, useState } from 'react'
import * as maplibregl from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import type { GeoJSONSource, Map as LibreMap } from 'maplibre-gl'
import type { FeatureCollection, LineString, Point } from 'geojson'
import 'maplibre-gl/dist/maplibre-gl.css'
import { armies, events, places, placeById, routeWaypoints, sourceById } from './data'
import { displayDateText, eventDay, eventVisible, hasCoordinate, lastKnownEvents, toDay } from './model'
import type { HistoricalPlace, HistoryState } from './types'
import type { HistoryAction } from './model'
import type { Dispatch } from 'react'
import { buildRouteChains, clipDirection, displayDirections } from './routeDisplay'
import { campaignLabels, crossingLegends } from './campaignNotes'
import { presentRoutes, routePhaseNames } from './routePresentation'
import type { PresentedRoute } from './routePresentation'
import { featuredNotes } from './featuredEvents'
import { chinaSheetStyle } from './chinaSheet'
import { followPosition } from './cameraFollow'
import { animateMotion, cancelMotion, motion } from '../../animations/motion'

const empty: FeatureCollection<LineString> = { type: 'FeatureCollection', features: [] }
const segmentById = new Map(displayDirections.map(segment => [segment.id, segment]))
const armyById = new Map(armies.map(army => [army.id, army]))
const overviewLabels: Record<string, string> = { 'EVT-006': '于都', 'EVT-053': '懋功', 'EVT-072': '吴起镇', 'EVT-076': '会宁', 'EVT-077': '将台堡', 'EVT-100': '甘孜', 'EVT-125': '何家冲', 'EVT-150': '永坪' }
// v6's separate ESM worker must be bundled explicitly by Vite (dev AND production).
maplibregl.setWorkerUrl(workerUrl)
export interface CameraRequest { key: number; placeIds: string[] }
type PositionedPlace = HistoricalPlace & { longitude: number; latitude: number }
export function MapCanvas({ state, dispatch, active, camera, layers, onPick, chishuiTopic = false }: {
  state: HistoryState; dispatch: Dispatch<HistoryAction>; active: boolean; camera: CameraRequest
  layers: { directions: boolean; labels: boolean }; onPick: (eventIds: string[]) => void
  chishuiTopic?: boolean
}) {
  const container = useRef<HTMLDivElement>(null)
  const map = useRef<LibreMap | null>(null)
  const markers = useRef<{ element: HTMLButtonElement; places: PositionedPlace[]; coordinate: [number, number] }[]>([])
  const latest = useRef({ state, layers, onPick, chishuiTopic, active })
  latest.current = { state, layers, onPick, chishuiTopic, active }
  const latestCamera = useRef(camera)
  latestCamera.current = camera
  const appliedCameraKey = useRef<number | null>(null)
  const [status, setStatus] = useState<'loading' | 'local' | 'unavailable'>('loading')
  const [reload, setReload] = useState(0)
  const [inspectedId, setInspectedId] = useState<string | null>(null)
  const ready = useRef(false)
  const overviewView = useRef(true)
  const overviewZoom = useRef(5)
  const visibleChains = useRef<PresentedRoute[]>([])
  const refreshArrows = useRef<() => void>(() => {})
  const refreshMarkers = useRef<() => void>(() => {})
  const [styleRevision, setStyleRevision] = useState(0)
  const { currentDay, mode, visibleArmies, showReception, selectedArmy, selectedEventId, routeFocus, stageId, playing } = state
  const markerDay = mode === 'time' ? Math.floor(currentDay) : 0
  const geometryDay = mode === 'time' || selectedEventId ? currentDay : 0
  const routeState = useMemo<HistoryState>(() => ({
    currentDay: geometryDay, mode, visibleArmies, showReception, selectedArmy, selectedEventId, routeFocus, stageId, playing,
    followCamera: false, speed: 1,
  }), [geometryDay, mode, visibleArmies, showReception, selectedArmy, selectedEventId, routeFocus, stageId, playing])
  const chains = useMemo(() => layers.directions ? buildRouteChains(displayDirections, routeState) : [], [layers.directions, routeState])
  const presented = useMemo(() => presentRoutes(chains, routeState), [chains, routeState])
  const followed = state.followCamera ? followPosition(displayDirections, state) : null
  const followKey = followed ? `${followed.army}:${followed.segmentId}:${followed.coordinate.join(',')}` : ''
  const followMoving = useRef(false)
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches
  function fit(ids: string[], duration: number) {
    if (!map.current) return
    overviewView.current = !ids.length
    const points = places.filter(p => ids.includes(p.id) && hasCoordinate(p)) as PositionedPlace[]
    if (ids.length && !points.length) return
    const bounds = new maplibregl.LngLatBounds()
    if (!ids.length) displayDirections.forEach(s => s.geometry.coordinates.forEach(p => bounds.extend(p)))
    else points.forEach(p => bounds.extend([p.longitude, p.latitude]))
    // The map now owns the unobscured central sheet, rather than the full window.
    // Fit actual route-region coordinates with small internal margins.
    const padding = document.documentElement.dataset.compact === 'true' ? { left: 12, right: 12, top: 46, bottom: 8 } : { left: 28, right: 28, top: 86, bottom: 32 }
    map.current.fitBounds(bounds, { padding, maxZoom: points.length === 1 ? 7.4 : ids.length && points.length <= 10 ? 8 : 6.4, duration: reduced() ? 0 : duration })
    if (!ids.length) {
      const fitted = map.current.cameraForBounds(bounds, { padding, maxZoom: 6.4 })
      overviewZoom.current = fitted?.zoom ?? map.current.getZoom()
    }
  }
  useEffect(() => {
    if (!container.current) return
    delete container.current.dataset.mapError
    let disposed = false, fitted = false, cameraMoving = false, userMoving = false, settleFrame = 0, touchPinch = false
    let previousArrows = ''
    const coarse = matchMedia('(any-pointer: coarse)').matches
    const controller = new AbortController()
    let instance: LibreMap
    try {
      instance = new maplibregl.Map({ container: container.current, style: chinaSheetStyle, center: [107, 31], zoom: 4.7, minZoom: 1.2, maxZoom: 12, renderWorldCopies: false, attributionControl: false, dragRotate: false, pitchWithRotate: false, touchPitch: false, cooperativeGestures: false,
        ...(coarse ? { maxBounds: [[47, -2], [158, 66]], dragPan: { deceleration: 4800, maxSpeed: 950 } } : {}),
        pixelRatio: coarse ? Math.min(devicePixelRatio, 1.5) : devicePixelRatio,
        locale: { 'NavigationControl.ZoomIn': '放大地图', 'NavigationControl.ZoomOut': '缩小地图', 'NavigationControl.ResetBearing': '恢复正北方向' } })
    } catch { setStatus('unavailable'); return () => controller.abort() }
    map.current = instance
    instance.touchZoomRotate.disableRotation()
    instance.touchZoomRotate.setZoomThreshold(.035)
    instance.keyboard.disableRotation()
    instance.addControl(new maplibregl.NavigationControl({ visualizePitch: false }), 'bottom-left')
    instance.addControl(new maplibregl.ScaleControl({ maxWidth: 100, unit: 'metric' }), 'bottom-left')
    instance.addControl(new maplibregl.AttributionControl({ compact: true, customAttribution: '<a href="https://www.geonames.org/">GeoNames CC BY 4.0</a>' }), 'bottom-right')
    const receptionLabels = displayDirections.filter(s => s.phase === 'reception').map(segment => {
      const button = document.createElement('button')
      button.type = 'button'; button.className = 'route-period-label'; button.dataset.segmentId = segment.id
      button.textContent = segment.to_place_id === 'PLC-0076' ? '1936 接应会宁' : '1936 接应将台堡'
      button.setAttribute('aria-label', `查看${button.textContent}路线说明`)
      button.addEventListener('click', () => setInspectedId(segment.id))
      const marker = new maplibregl.Marker({ element: button, anchor: 'left', offset: [9, segment.to_place_id === 'PLC-0076' ? -14 : 12] }).setLngLat(clipDirection(segment.geometry.coordinates, .5).at(-1)!).addTo(instance)
      return { segment, button, marker }
    })
    const groups = new Map<string, PositionedPlace[]>()
    const nodeLayer = document.createElement('div')
    nodeLayer.className = 'history-node-layer'
    instance.getCanvasContainer().append(nodeLayer)
    const positioned = places.filter(hasCoordinate)
    positioned.forEach(p => { const key = `${p.longitude},${p.latitude}`; groups.set(key, [...groups.get(key) ?? [], p]) })
    for (const group of groups.values()) {
      const button = document.createElement('button')
      button.type = 'button'; button.className = 'history-marker'; button.dataset.placeIds = group.map(p => p.id).join(',')
      const leader = document.createElement('span'); leader.className = 'history-label-leader'; leader.hidden = true; leader.setAttribute('aria-hidden', 'true'); button.append(leader)
      const label = document.createElement('span'); label.className = 'history-marker-label'; button.append(label)
      const pulse=document.createElement('span');pulse.className='history-node-focus';pulse.setAttribute('aria-hidden','true');button.append(pulse)
      button.addEventListener('click', () => {
        if (button.dataset.campaign === 'chishui') fit(['PLC-0020', 'PLC-0022', 'PLC-0025', 'PLC-0028', 'PLC-0029', 'PLC-0033', 'PLC-0034'], 750)
        latest.current.onPick((button.dataset.eventIds ?? '').split(',').filter(Boolean))
      })
      button.hidden = true
      nodeLayer.append(button)
      markers.current.push({ element: button, places: group, coordinate: [group[0]!.longitude, group[0]!.latitude] })
    }
    function positionNodes() {
      for (const { element, coordinate } of markers.current) {
        if (element.hidden) continue
        const { x, y } = instance.project(coordinate)
        element.style.transform = `translate(${x.toFixed(2)}px,${y.toFixed(2)}px) translate(-50%,-50%)`
      }
    }
    function publishCamera() {
      if (container.current) {
        const center = instance.getCenter()
        container.current.dataset.zoom = instance.getZoom().toFixed(3)
        container.current.dataset.center = `${center.lng.toFixed(3)},${center.lat.toFixed(3)}`
      }
    }
    function syncMarkers() {
      if (userMoving) return
      const { state: current, layers: currentLayers, chishuiTopic: topic } = latest.current
      for (const { segment, button } of receptionLabels) {
        button.hidden = !currentLayers.directions || !current.visibleArmies.includes('central') || current.showReception === false || (current.mode === 'time' && current.currentDay < toDay(segment.reveal_date!))
      }
      // Topic waypoints are navigation references; future routes remain date-clipped.
      const byPlace = new Map<string, typeof events>()
      const eligible = events.filter(e => eventVisible(e, current) || (topic && current.visibleArmies.includes('central') && Boolean(crossingLegends[e.id])))
      for (const event of eligible) for (const id of event.place_ids) {
        const related = byPlace.get(id)
        if (related) related.push(event)
        else byPlace.set(id, [event])
      }
      const currentPlaces = new Set(current.mode === 'time' ? lastKnownEvents(events, current).flatMap(e => e.place_ids) : [])
      const zoom = instance.getZoom()
      const level = zoom <= overviewZoom.current + .15 ? 'overview' : zoom < Math.max(overviewZoom.current + .85, 6.4) ? 'regional' : 'detail'
      const crossingEvents = eligible.filter(e => crossingLegends[e.id])
      const chosen = events.find(e => e.id === current.selectedEventId)
      let visibleCount = 0
      const labelCandidates: { label: HTMLSpanElement; point: maplibregl.Point; priority: number }[] = []
      const candidates = markers.current.map(group => {
        const activePlaces = group.places.filter(p => byPlace.has(p.id))
        const selected = Boolean(chosen?.place_ids.some(id => activePlaces.some(p => p.id === id)))
        return { group, activePlaces, priority: selected ? 2 : activePlaces.length > 1 ? 1 : 0 }
      }).sort((a, b) => b.priority - a.priority)
      // A shared marker means the same geographic reference. Screen proximity
      // must never merge separate meetings, armies or dates into a reunion.
      for (const { group, activePlaces } of candidates) {
        visibleCount += activePlaces.length
        let related = activePlaces.length <= 1 ? byPlace.get(activePlaces[0]?.id ?? '') ?? [] : eligible.filter(e => activePlaces.some(p => e.place_ids.includes(p.id)))
        const campaign = level !== 'detail' && activePlaces.some(p => p.id === 'PLC-0022') && crossingEvents.length > 0
        if (campaign) related = crossingEvents
        const selected = related.some(e => e.id === chosen?.id)
        const currentArrival = activePlaces.some(p => currentPlaces.has(p.id))
        const major = related.find(e => overviewLabels[e.id])
        if (!related.length || (level !== 'detail' && !campaign && related.some(e => crossingLegends[e.id])) ||
          (level === 'overview' && !major && !campaign && !selected && !currentArrival)) {
          if (!group.element.hidden) group.element.hidden = true
          delete group.element.dataset.eventIds
          group.element.dataset.selected = 'false'
          group.element.dataset.current = 'false'
          continue
        }
        if (group.element.hidden) group.element.hidden = false
        group.element.dataset.campaign = campaign ? 'chishui' : ''
        group.element.dataset.major = String(Boolean(major || campaign || related.some(e => e.important)))
        group.element.dataset.eventIds = related.map(e => e.id).join(',')
        group.element.dataset.clusterPlaceIds = activePlaces.map(p => p.id).join(',')
        group.element.dataset.clusterSize = String(activePlaces.length)
        const event = related.find(e => e.id === chosen?.id) ?? related.find(e => e.kind === 'reunion') ?? related.find(e => e.kind === 'meeting') ?? related.find(e => e.kind === 'battle') ?? related[0]!
        const armyId = current.selectedArmy && current.visibleArmies.includes(current.selectedArmy) && event.army_ids.includes(current.selectedArmy) ? current.selectedArmy : event.army_ids.find(id => current.visibleArmies.includes(id))!
        const army = armyById.get(armyId)!
        group.element.style.setProperty('--army-color', army.color)
        group.element.dataset.symbol = related.length > 1 ? String(related.length) : { meeting: '会', reunion: '合', battle: '战', march: '·' }[event.kind]
        group.element.dataset.selected = String(selected)
        group.element.dataset.current = String(currentArrival)
        group.element.dataset.kind = event.kind
        group.element.classList.toggle('is-dimmed', Boolean(current.selectedArmy && !related.some(e => e.army_ids.includes(current.selectedArmy!))))
        const title = activePlaces.map(p => p.name).join('、')
        group.element.title = `区域参考点：${title}，历史确址待核`
        group.element.setAttribute('aria-label', `查看${title}，区域参考点，非历史确址`)
        const label = group.element.querySelector<HTMLSpanElement>('.history-marker-label')!
        const crossings = related.filter(e => crossingLegends[e.id])
        const future = current.mode === 'time' && crossings.length > 0 && crossings.every(e => eventDay(e) && toDay(eventDay(e)!) > current.currentDay)
        group.element.dataset.future = String(future)
        group.element.dataset.crossings = crossings.map(e => e.id).join(',')
        group.element.dataset.crossingStep = crossings.length && level === 'detail' ? crossings[0]!.title[0]! : ''
        const specific = related.find(e => e.id === chosen?.id)
        const caption = specific && campaignLabels[specific.id]
        const titles = [...new Set(related.map(e => campaignLabels[e.id]).filter(Boolean))]
        const shared = related.length > 1
        // At a common reference show the distinct visits, never assign one
        // event's reunion glyph to an unrelated meeting at the same reference.
        if (shared && !specific && new Set(related.map(e => e.kind)).size > 1) group.element.dataset.kind = 'visits'
        label.textContent = campaign ? '四渡赤水' : level === 'overview' && major ? overviewLabels[major.id]! : crossings.length ? crossings.map(e => crossingLegends[e.id]).join('\n')
          : caption || (titles.length ? titles.join('\n') : shared ? activePlaces[0]!.historical_name + ' · 多次行动' : activePlaces[0]!.name)
        if (future) { label.textContent = '待到达 · ' + label.textContent; group.element.setAttribute('aria-label', `查看${title}，专题待到达地点，非当前已发生事件`) }
        group.element.title += ' · ' + related.map(e => e.title + ' ' + displayDateText(e.date_text)).join(' / ')
        label.hidden = true
        group.element.querySelector<HTMLElement>('.history-label-leader')!.hidden = true
        if (currentLayers.labels && (selected || level !== 'overview') && (selected || campaign || major || level === 'detail' || related.some(e => Boolean(featuredNotes[e.id])))) {
          const keyPlace = related.some(e => e.id === 'EVT-006' || e.id === 'EVT-063')
          labelCandidates.push({ label, point: instance.project(group.coordinate), priority: selected ? 10 : major?.id === 'EVT-076' ? 9 : major?.id === 'EVT-072' ? 8 : campaign ? 7 : major ? 6 : keyPlace ? 5 : crossings.length ? 5 : titles.length ? 4 : event.important ? 1 : 0 })
        }
      }
      // Greedy screen-space label placement. Never move a geographic marker to fit text.
      const mapWidth = instance.getContainer().clientWidth, mapHeight = instance.getContainer().clientHeight
      const occupied: { left: number; right: number; top: number; bottom: number }[] = [
        { left: 0, right: 235, top: 0, bottom: 110 }, // archive map title
        { left: mapWidth - 255, right: mapWidth, top: 0, bottom: 85 }, // mode / north
        { left: 0, right: 180, top: mapHeight - 95, bottom: mapHeight },
        { left: 0, right: mapWidth, top: mapHeight - 40, bottom: mapHeight }, // credits / precision note
      ]
      let labelCount = 0
      labelCandidates.sort((a, b) => b.priority - a.priority).forEach(({ label, point }) => {
        if (level === 'regional' && labelCount >= 14) return
        if (point.x < 0 || point.x > mapWidth || point.y < 0 || point.y > mapHeight) return
        const lines = (label.textContent ?? '').split('\n')
        const width = Math.min(210, Math.max(...lines.map(line => [...line].reduce((sum, char) => sum + (char.charCodeAt(0) < 128 ? 6 : 11), 0))) + 8)
        const height = 17 * lines.length + 3
        const offsets = [[-width / 2, 14], [-width / 2, -height - 10], [-width - 12, -height / 2],
          [12, -height / 2], [-width - 12, -height - 10], [12, -height - 10], [-width / 2, 34]]
        for (const [dx, top] of offsets as [number, number][]) {
          const left = Math.max(3, Math.min(mapWidth - width - 3, point.x + dx))
          const box = { left, right: left + width, top: point.y + top, bottom: point.y + top + height }
          if (box.top < 0 || box.bottom > mapHeight || occupied.some(b => box.left < b.right && box.right > b.left && box.top < b.bottom && box.bottom > b.top)) continue
          label.style.left = (left + width / 2 - point.x + 13) + 'px'
          label.style.top = (top + 13) + 'px'
          const endX = Math.max(box.left + 3, Math.min(box.right - 3, point.x)) - point.x
          const endY = Math.max(box.top, Math.min(box.bottom, point.y)) - point.y
          const leader = label.previousElementSibling as HTMLElement
          leader.style.width = Math.hypot(endX, endY) + 'px'
          leader.style.transform = `rotate(${Math.atan2(endY, endX)}rad)`
          leader.hidden = false
          label.hidden = false; labelCount++; occupied.push(box); break
        }

      })
      if (container.current) { container.current.dataset.labelLevel = level; container.current.dataset.visibleLabels = String(labelCount); container.current.dataset.visibleNodes = String(visibleCount); container.current.dataset.visibleMarkers = String(candidates.filter(c => !c.group.element.hidden).length); container.current.dataset.bounds = instance.getBounds().toArray().flat().join(',') }
      publishCamera()
      positionNodes()
    }
    function syncArrows() {
      if (!ready.current || cameraMoving) return
      const features: FeatureCollection<Point>['features'] = []
      const occupied: maplibregl.Point[] = []
      const nodes = markers.current.filter(m => !m.element.hidden).map(m => instance.project(m.coordinate))
      for (const chain of [...visibleChains.current].sort((a, b) => Number(b.emphasis === 'focus') - Number(a.emphasis === 'focus'))) {
        const projected = chain.coordinates.map(p => instance.project(p))
        const length = projected.slice(1).reduce((total, p, i) => total + p.dist(projected[i]!), 0)
        const count = Math.min(24, Math.max(chain.emphasis === 'focus' && length > 45 ? 1 : 0, Math.floor(length / 155)))
        for (let i = 0; i < count; i++) {
          const fraction = (i + .5) / count
          const position = clipDirection(chain.coordinates, fraction).at(-1)!
          const next = clipDirection(chain.coordinates, Math.min(.999999, fraction + .001)).at(-1)!
          const point = instance.project(position), tangent = instance.project(next)
          if (nodes.some(p => p.dist(point) < 22) || occupied.some(p => p.dist(point) < 28)) continue
          occupied.push(point)
          features.push({ type: 'Feature', geometry: { type: 'Point', coordinates: position },
            properties: { arrow: 'march-arrow-' + chain.armyId, opacity: chain.opacity, emphasis: chain.emphasis, bearing: Math.atan2(tangent.y - point.y, tangent.x - point.x) * 180 / Math.PI } })
        }
      }
      const nextArrows = JSON.stringify(features)
      if (nextArrows === previousArrows) return
      previousArrows = nextArrows
      ;(instance.getSource('history-arrows') as GeoJSONSource | undefined)?.setData({ type: 'FeatureCollection', features })
      if (container.current) container.current.dataset.directionArrows = String(features.length)
    }
    refreshArrows.current = syncArrows
    refreshMarkers.current = syncMarkers
    instance.on('style.load', () => {
      if (disposed) return
      previousArrows = ''
      instance.addSource('history-directions', { type: 'geojson', data: empty })
      // The focus pass is last, so a different army's later layer cannot cover it.
      for (const focus of [false, true]) {
        instance.addLayer({ id: focus ? 'history-focus-casing' : 'history-direction-casing', type: 'line', source: 'history-directions', ...(focus ? { filter: ['==', ['get', 'emphasis'], 'focus'] as maplibregl.FilterSpecification } : {}), layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#f7f2e7', 'line-width': ['interpolate', ['linear'], ['zoom'], 2, ['*', 3.5, ['get', 'width']], 4.8, ['*', 6, ['get', 'width']], 9, ['*', 10, ['get', 'width']]], 'line-opacity': ['get', 'opacity'] } })
        for (const [id, dash] of [['march', [8, .65]], ['first-north', [8, .65]], ['south', [2, 1.3]], ['west', [1, 1]], ['north', [5, 1, 1, 1]], ['reception', [1, 1.8]], ['preparation', [1, 2]]] as const) {
          instance.addLayer({ id: focus ? 'history-focus-' + id : id === 'march' ? 'history-directions' : 'history-' + id, type: 'line', source: 'history-directions', layout: { 'line-join': 'round' },
            filter: focus ? ['all', ['==', ['get', 'phase'], id], ['==', ['get', 'emphasis'], 'focus']] : ['==', ['get', 'phase'], id], paint: { 'line-color': ['get', 'color'], 'line-width': ['interpolate', ['linear'], ['zoom'], 2, ['*', 1.8, ['get', 'width']], 4.8, ['*', id === 'north' ? 2.4 : 3.5, ['get', 'width']], 9, ['*', id === 'north' ? 5 : 7.4, ['get', 'width']]], 'line-dasharray': [...dash], 'line-opacity': ['get', 'opacity'] } })
        }
      }
      instance.addSource('history-route-hit', { type: 'geojson', data: empty })
      instance.addLayer({ id: 'history-route-hit', type: 'line', source: 'history-route-hit', paint: { 'line-width': 14, 'line-opacity': 0 } })
      instance.on('click', 'history-route-hit', event => { const id = event.features?.[0]?.properties.id; if (typeof id === 'string') setInspectedId(id) })
      instance.on('mouseenter', 'history-route-hit', () => { instance.getCanvas().style.cursor = 'pointer' })
      instance.on('mouseleave', 'history-route-hit', () => { instance.getCanvas().style.cursor = '' })
      for (const army of armies) {
        const canvas = document.createElement('canvas'); canvas.width = 24; canvas.height = 24
        const context = canvas.getContext('2d')!
        context.strokeStyle = army.color; context.lineWidth = 4; context.lineCap = 'round'; context.lineJoin = 'round'
        context.beginPath(); context.moveTo(6, 5); context.lineTo(17, 12); context.lineTo(6, 19); context.stroke()
        instance.addImage('march-arrow-' + army.id, context.getImageData(0, 0, 24, 24))
      }
      instance.addSource('history-arrows', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
      instance.addLayer({ id: 'history-direction-arrows', type: 'symbol', source: 'history-arrows',
        layout: { 'icon-image': ['get', 'arrow'], 'icon-size': ['case', ['==', ['get', 'emphasis'], 'focus'], .65, .53], 'icon-rotate': ['get', 'bearing'], 'icon-rotation-alignment': 'viewport', 'icon-allow-overlap': true }, paint: { 'icon-opacity': ['get', 'opacity'] } })
      ready.current = true; syncMarkers(); setStyleRevision(r => r + 1)
      if (!fitted && latest.current.active) { fit(latestCamera.current.placeIds, 0); appliedCameraKey.current = latestCamera.current.key; fitted = true }
    })
    instance.on('sourcedata', () => {
      if (!disposed && instance.isSourceLoaded('china') && instance.isSourceLoaded('outline') && instance.isSourceLoaded('rivers')) setStatus('local')
    })
    instance.on('error', event => { if (!disposed) { setStatus('unavailable'); if (container.current) container.current.dataset.mapError = event.error.message } })
    instance.on('movestart', event => {
      cameraMoving = true
      userMoving = Boolean(event.originalEvent)
      if (settleFrame) cancelAnimationFrame(settleFrame)
      settleFrame = 0
    })
    instance.on('move', () => {
      publishCamera()
      positionNodes()
    })
    instance.on('moveend', () => {
      cameraMoving = false
      userMoving = false
      if (settleFrame) cancelAnimationFrame(settleFrame)
      settleFrame = requestAnimationFrame(() => {
        settleFrame = 0
        if (!latest.current.active || !ready.current || cameraMoving) return
        syncMarkers()
        syncArrows()
      })
    })
    instance.on('idle', () => {
      if (container.current && instance.getLayer('history-directions')) container.current.dataset.renderedRouteFeatures = String(instance.queryRenderedFeatures({ layers: ['history-directions', 'history-first-north', 'history-south', 'history-west', 'history-north', 'history-reception', 'history-preparation'] }).length)
    })
    const takeCamera = () => {
      userMoving = true
      followMoving.current = false
      overviewView.current = false
      if (latest.current.state.followCamera) dispatch({ type: 'follow', enabled: false })
    }
    instance.on('dragstart', takeCamera)
    instance.on('zoomstart', event => {
      if (!event.originalEvent) return
      if (event.originalEvent.type === 'touchmove') touchPinch = true
      takeCamera()
    })
    instance.on('zoomend', event => {
      if (!touchPinch) return
      touchPinch = false
      if (event.originalEvent?.type !== 'touchend' && event.originalEvent?.type !== 'touchcancel') return
      queueMicrotask(() => {
        if (!disposed && instance.isZooming()) instance.jumpTo({})
      })
    })
    const resize = new ResizeObserver(() => {
      instance.resize()
    })
    resize.observe(container.current)
    instance.getCanvas().addEventListener('webglcontextlost', () => { if (!disposed) setStatus('unavailable') }, { signal: controller.signal })
    instance.getCanvas().addEventListener('webglcontextrestored', () => { if (!disposed) setStatus('local') }, { signal: controller.signal })
    return () => { disposed = true; ready.current = false; if (settleFrame) cancelAnimationFrame(settleFrame); refreshMarkers.current = () => {}; refreshArrows.current = () => {}; controller.abort(); resize.disconnect(); receptionLabels.forEach(m => m.marker.remove()); nodeLayer.remove(); markers.current = []; instance.remove(); map.current = null }
  // Each instance owns its resources; reload is the explicit retry boundary.
  }, [reload, dispatch])
  useEffect(()=>{
    const stop=()=>{if(!active||document.hidden){map.current?.stop();followMoving.current=false;if(container.current)cancelMotion(container.current)}}
    stop();document.addEventListener('visibilitychange',stop)
    return()=>document.removeEventListener('visibilitychange',stop)
  },[active])
  useEffect(() => {
    if (!map.current || !ready.current) return
    refreshMarkers.current()
  }, [markerDay, mode, visibleArmies, selectedArmy, selectedEventId, showReception, layers.directions, layers.labels, styleRevision, chishuiTopic])
  useEffect(() => {
    const instance = map.current
    if (!instance || !ready.current) return
    instance.setFilter('history-direction-arrows', ['in', ['get', 'arrow'], ['literal', layers.directions ? visibleArmies.map(id => 'march-arrow-' + id) : []]])
  }, [layers.directions, visibleArmies, styleRevision])
  useEffect(() => {
    if (!map.current || !ready.current) return
    visibleChains.current = presented
    const source = map.current.getSource('history-directions') as GeoJSONSource | undefined
    source?.setData({ type: 'FeatureCollection', features: presented.map((chain, index) => ({ type: 'Feature', id: index, geometry: { type: 'LineString', coordinates: chain.coordinates }, properties: { phase: chain.phase, color: armyById.get(chain.armyId)!.color, opacity: chain.opacity, width: chain.width, emphasis: chain.emphasis } })) })
    const hitFeatures: FeatureCollection<LineString>['features'] = []
    for (const chain of presented) {
      let offset = 0
      for (const id of chain.segmentIds) {
        const segment = segmentById.get(id)!
        const coordinateCount = Math.min(segment.geometry.coordinates.length, chain.coordinates.length - offset)
        if (segment.phase === 'reception') hitFeatures.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: chain.coordinates.slice(offset, offset + coordinateCount) }, properties: { id } })
        offset += coordinateCount - 1
      }
    }
    ;(map.current.getSource('history-route-hit') as GeoJSONSource | undefined)?.setData({ type: 'FeatureCollection', features: hitFeatures })
    refreshArrows.current()
    if (container.current) {
      container.current.dataset.showReception = String(showReception !== false)
      container.current.dataset.visibleSegmentIds = chains.flatMap(c => c.segmentIds).join(',')
      container.current.dataset.routePresentation = JSON.stringify(presented.map(c => ({ ids: c.segmentIds, emphasis: c.emphasis, opacity: c.opacity, width: c.width })))
      container.current.dataset.visibleRoutes = String(chains.reduce((sum, c) => sum + c.segmentIds.length, 0)); container.current.dataset.routeChains = String(chains.length)
      container.current.dataset.partialRoutes = String(chains.filter(c => c.partialSegmentId).length)
      container.current.dataset.routeEndpoint = chains.find(c => c.armyId === 'central')?.coordinates.at(-1)?.map(n => n.toFixed(6)).join(',') ?? ''
    }
  }, [chains, presented, showReception, styleRevision])
  useEffect(()=>{
    if(!active||!container.current)return
    cancelMotion(container.current)
    const marker=markers.current.find(item=>item.element.dataset.selected==='true')?.element
    animateMotion(marker?.querySelector('.history-node-focus'),'node-focus',[{opacity:.65,transform:'scale(.6)'},{opacity:0,transform:'scale(2.6)'}],{duration:motion.camera})
  },[state.selectedEventId,active,styleRevision])
  useEffect(() => {
    if (active && !document.hidden && map.current) {
      map.current.resize()
      // Returning from another hall only resizes the retained instance. Fit on an explicit new request.
      if (!ready.current || appliedCameraKey.current === camera.key) return
      // 先结束旧跟随，再启动明确的定位/复位，避免后面的取消跟随误停新镜头。
      if (followMoving.current) { map.current.stop(); followMoving.current = false }
      fit(camera.placeIds, motion.camera); appliedCameraKey.current = camera.key
    }
  }, [camera, active, styleRevision])
  useEffect(() => {
    const instance = map.current
    if (container.current) {
      container.current.dataset.followArmy = followed?.army ?? ''
      container.current.dataset.followSegment = followed?.segmentId ?? ''
      container.current.dataset.followCoordinate = followed?.coordinate.join(',') ?? ''
    }
    if (!active || document.hidden || !state.followCamera || !followed) {
      if (followMoving.current) instance?.stop()
      followMoving.current = false
      return
    }
    if (!instance || !ready.current) return
    overviewView.current = false
    followMoving.current = true
    // 只改中心，不fitBounds或指定zoom；播放时短线性追随，暂停拖动日期亦可定位。
    instance.easeTo({ center: followed.coordinate, duration: reduced() ? 0 : state.playing ? 100 : 450, easing: t => t })
  }, [active, state.followCamera, state.playing, followKey, styleRevision])
  const inspected = inspectedId && chains.some(c => c.segmentIds.includes(inspectedId)) ? segmentById.get(inspectedId) : undefined
  const closeInspection = () => { setInspectedId(null); container.current?.querySelector<HTMLElement>('.maplibregl-canvas')?.focus({ preventScroll: true }) }
  return <>
    <div ref={container} className="history-map-canvas" data-map-state={status} data-terrain-state="disabled" data-base-style="china-archive" aria-label="可缩放拖拽的长征地理地图" />
    <div className="map-service-state" role="status">
      {status === 'loading' && '正在加载地理底图…'}
      {status === 'unavailable' && <>地图渲染暂不可用，仍可查阅资料。<button onClick={() => { setStatus('loading'); setReload(r => r + 1) }}>重试地图</button></>}
    </div>
    {inspected && <section className="map-route-inspector" aria-label="路线分段说明" data-segment-id={inspected.id} onKeyDown={e => { if (e.key === 'Escape') { e.stopPropagation(); closeInspection() } }}>
      <button aria-label="关闭路线说明" onClick={closeInspection}>关闭 ×</button>
      <p>{armies.find(a => a.id === inspected.army_id)!.name} · {routePhaseNames[inspected.phase ?? 'march']}</p>
      <h2>{placeById.get(inspected.from_place_id)?.name ?? routeWaypoints.get(inspected.from_place_id)?.referenceName} → {placeById.get(inspected.to_place_id)?.name}</h2>
      <p>{inspected.start_date} — {inspected.reveal_date}</p><p>{inspected.evidence_locator}</p>
      <small>地域方向示意 · 历史确址与完整分路待核验</small>
      {inspected.source_ids.map(id => { const source = sourceById.get(id); return source && <a key={id} href={source.url} target="_blank" rel="noreferrer">依据：{source.title}</a> })}
    </section>}
  </>
}
