import { lazy, Suspense, useEffect, useState, useRef } from 'react'
import { animateMotion, cancelMotion, installMotionPolicy, motion } from './animations/motion'
import { loadMapChapter } from './animations/chapterLoaders'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Navbar } from './components/Navbar'
import { SourceDialog } from './components/SourceDialog'
import { Hero } from './sections/Hero'
import { Entrance } from './sections/Entrance'
import type { ExhibitModuleId } from './data/exhibition'
import { modules } from './data/exhibition'
import { scrollToRegion } from './utils/navigation'
import { OrientationGuide } from './components/OrientationGuide'
import { ChapterBoundary, ChapterLoading } from './components/ChapterBoundary'

function HomePage() {
  const [selected, setSelected] = useState<ExhibitModuleId | null>(() => modules.find(module => location.hash === `#entrance-${module.id}`)?.id ?? null)
  const [sourceOpen, setSourceOpen] = useState(false)
  const selectModule = (id: ExhibitModuleId | null) => {
    if (id === 'journey') { location.hash = 'map'; return }
    if (id === 'people') { location.hash = 'people'; return }
    if (id === 'legacy') { location.hash = 'legacy'; return }
    setSelected(id)
    history.replaceState(null, '', id ? `#entrance-${id}` : '#home')
  }
  useEffect(() => {
    const restore = () => {
      // Retired standalone entry URLs resolve to the integrated map entrance.
      const hash = location.hash
      const module = modules.find(item => hash === `#entrance-${item.id}`)
      if (module && module.id === 'legacy') { setSelected(module.id); scrollToRegion('entrance', hash) }
      else if (hash === '#home') setSelected(null)
    }
    restore()
    window.addEventListener('hashchange', restore)
    return () => window.removeEventListener('hashchange', restore)
  }, [])
  return <>
    <a className="skip-link" href="#entrance">跳到展馆入口</a>
    <Navbar selected={selected} onSelect={selectModule} />
    <main><Hero onSource={() => setSourceOpen(true)} /><Entrance selected={selected} onSelect={selectModule} /></main>
    <SourceDialog open={sourceOpen} onClose={() => setSourceOpen(false)} />
  </>
}

const HistoryMapPage = lazy(loadMapChapter)
const PeopleMemorial = lazy(() => import('./features/people/PeopleMemorial'))
const LegacyPage = lazy(() => import('./features/legacy/LegacyPage'))
const mapHashes = ['#map', '#entrance-journey', '#entrance-timeline', '#entrance-moments']
const isMapHash = () => mapHashes.includes(location.hash) || location.hash.startsWith('#map?')
const isPeopleHash = () => location.hash === '#people' || location.hash === '#entrance-people' || location.hash.startsWith('#people/')
const isLegacyHash = () => location.hash === '#legacy' || location.hash === '#entrance-legacy' || location.hash.startsWith('#legacy/')
export default function App() {
  const curtain=useRef<HTMLDivElement>(null)
  const previousChapter=useRef('')
  useEffect(installMotionPolicy,[])
  const [mapActive, setMapActive] = useState(isMapHash)
  const [mapVisited, setMapVisited] = useState(isMapHash)
  const [peopleActive, setPeopleActive] = useState(isPeopleHash)
  const [peopleVisited, setPeopleVisited] = useState(isPeopleHash)
  const [legacyActive, setLegacyActive] = useState(isLegacyHash)
  const [legacyVisited, setLegacyVisited] = useState(isLegacyHash)
  const [legacySection, setLegacySection] = useState(() => location.hash.startsWith('#legacy/') ? location.hash.slice(8) : 'prologue')
  const [personId, setPersonId] = useState<string | null>(() => location.hash.startsWith('#people/') ? location.hash.slice(8) : null)
  const [requestedEventId, setRequestedEventId] = useState<string | null>(null)
  const [requestedArchive, setRequestedArchive] = useState<string | null>(null)
  const [requestedCampaign, setRequestedCampaign] = useState(false)
  const chapter=mapActive?'map':peopleActive?'people':legacyActive?'legacy':'home'
  useEffect(()=>{
    const previous=previousChapter.current;previousChapter.current=chapter
    dispatchEvent(new Event('chapterchange'))
    if(!previous||previous===chapter)return
    if(curtain.current){cancelMotion(curtain.current);animateMotion(curtain.current,'chapter',[{opacity:previous==='home'?.42:.28},{opacity:.12,offset:.42},{opacity:0}],{duration:previous==='home'?800:motion.page})}
  },[chapter])
  useEffect(() => {
    const restore = () => {
      const active = isMapHash(); const people = isPeopleHash(); const legacy = isLegacyHash()
      if (active && !location.hash.startsWith('#map')) history.replaceState(null, '', '#map')
      if (location.hash === '#entrance-people') history.replaceState(null, '', '#people')
      if (location.hash === '#entrance-legacy') history.replaceState(null, '', '#legacy')
      setMapActive(active); if (active) setMapVisited(true)
      setPeopleActive(people); if (people) setPeopleVisited(true)
      setLegacyActive(legacy); if (legacy) setLegacyVisited(true)
      setLegacySection(location.hash.startsWith('#legacy/') ? location.hash.slice(8) : 'prologue')
      setPersonId(location.hash.startsWith('#people/') ? location.hash.slice(8) : null)
      const mapQuery = new URLSearchParams(active ? location.hash.split('?')[1] : '')
      setRequestedArchive(mapQuery.get('archive'))
      setRequestedEventId(mapQuery.get('event') ?? mapQuery.get('archive'))
      setRequestedCampaign(mapQuery.get('topic') === 'chishui' && mapQuery.get('archive') === 'EVT-023')
    }
    restore()
    addEventListener('hashchange', restore)
    return () => removeEventListener('hashchange', restore)
  }, [])
  useEffect(() => {
    if (mapActive || peopleActive || legacyActive) return
    const raf = requestAnimationFrame(() => { ScrollTrigger.refresh(); if (location.hash === '#home') scrollToRegion('home', '#home') })
    return () => cancelAnimationFrame(raf)
  }, [mapActive, peopleActive, legacyActive])
  return <>
    <OrientationGuide />
    <div ref={curtain} className="chapter-curtain" aria-hidden="true" data-chapter={chapter}/>
    <div hidden={mapActive || peopleActive || legacyActive}><HomePage /></div>
    {mapVisited && <div hidden={!mapActive}><ChapterBoundary><Suspense fallback={<ChapterLoading>正在载入长征时空地图…</ChapterLoading>}><HistoryMapPage active={mapActive} requestedEventId={requestedEventId} requestedArchive={requestedArchive} requestedCampaign={requestedCampaign} /></Suspense></ChapterBoundary></div>}
    {peopleVisited && <div hidden={!peopleActive}><ChapterBoundary><Suspense fallback={<ChapterLoading>正在进入英雄人物纪念馆…</ChapterLoading>}><PeopleMemorial active={peopleActive} personId={personId} /></Suspense></ChapterBoundary></div>}
    {legacyVisited && <div hidden={!legacyActive}><ChapterBoundary><Suspense fallback={<ChapterLoading>正在进入精神传承…</ChapterLoading>}><LegacyPage active={legacyActive} section={legacySection} /></Suspense></ChapterBoundary></div>}
  </>
}
