import { Arrow } from './Arrow'
import { loadMapChapter } from '../animations/chapterLoaders'

export function WoodenCta() {
  const prepare=()=>{void loadMapChapter().catch(()=>{})}
  return <a href="#map" className="journey-button" data-intro="controls" onPointerEnter={prepare} onFocus={prepare} onTouchStart={prepare}>
    <span className="wooden-face" aria-hidden="true" />
    <span className="wooden-label">开启征程</span><Arrow />
  </a>
}
