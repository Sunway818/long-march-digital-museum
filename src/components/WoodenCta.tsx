import { followRegionLink } from '../utils/navigation'
import { Arrow } from './Arrow'

export function WoodenCta() {
  return <a href="#entrance" className="journey-button" data-intro="controls" onClick={event => followRegionLink(event, 'entrance')}>
    <span className="wooden-face" aria-hidden="true" />
    <span className="wooden-label">开启征程</span><Arrow />
  </a>
}
