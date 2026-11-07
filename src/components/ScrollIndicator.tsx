import { Arrow } from './Arrow'
import { followRegionLink } from '../utils/navigation'

export function ScrollIndicator() {
  return <a href="#entrance" className="scroll-indicator" data-intro="controls" onClick={(event) => followRegionLink(event, 'entrance')}>
    <span className="scroll-line" /><span>向下探索</span><Arrow down />
  </a>
}
