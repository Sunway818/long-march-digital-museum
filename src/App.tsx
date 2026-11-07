import { useEffect, useState } from 'react'
import { Navbar } from './components/Navbar'
import { SourceDialog } from './components/SourceDialog'
import { Hero } from './sections/Hero'
import { Entrance } from './sections/Entrance'
import type { ExhibitModuleId } from './data/exhibition'
import { modules } from './data/exhibition'
import { scrollToRegion } from './utils/navigation'

export default function App() {
  const [selected, setSelected] = useState<ExhibitModuleId | null>(() => modules.find(module => location.hash === `#entrance-${module.id}`)?.id ?? null)
  const [sourceOpen, setSourceOpen] = useState(false)
  const selectModule = (id: ExhibitModuleId | null) => {
    setSelected(id)
    history.replaceState(null, '', id ? `#entrance-${id}` : '#home')
  }
  useEffect(() => {
    const restore = () => {
      // Retired standalone entry URLs resolve to the integrated map entrance.
      const hash = ['#entrance-timeline', '#entrance-moments'].includes(location.hash) ? '#entrance-journey' : location.hash
      const module = modules.find(item => hash === `#entrance-${item.id}`)
      if (module) { setSelected(module.id); scrollToRegion('entrance', hash) }
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
