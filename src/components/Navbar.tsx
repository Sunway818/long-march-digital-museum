import { modules } from '../data/exhibition'
import type { ExhibitModuleId } from '../data/exhibition'
import { followRegionLink } from '../utils/navigation'
import { FullscreenButton } from './FullscreenButton'

export function Navbar({ selected, onSelect }: { selected: ExhibitModuleId | null; onSelect: (id: ExhibitModuleId | null) => void }) {
  return <header className="navbar" data-intro="navigation">
    <a className="brand" href="#home" onClick={(event) => followRegionLink(event, 'home', () => onSelect(null))} aria-label="伟大征程，返回首页">
      <span className="brand-name">伟大征程</span><span className="brand-rule" /><span className="brand-description">长征胜利九十周年</span>
    </a>
    <div className="navbar-controls"><nav aria-label="主导航">
      <a href="#home" onClick={(event) => followRegionLink(event, 'home', () => onSelect(null))} aria-current={!selected ? 'location' : undefined}>首页</a>
      {modules.map(module => <a key={module.id} href={module.id === 'journey' ? '#map' : module.id === 'people' ? '#people' : '#legacy'} aria-current={selected === module.id ? 'location' : undefined}>{module.label}</a>)}
    </nav><FullscreenButton /></div>
  </header>
}
