import cleanPlate from '../assets/flag/flag-clean-plate.png'
import foreground from '../assets/flag/flag-foreground.png'

/** Hidden until all layers and WebGL are ready; the full original stays underneath. */
export function FlagScene() {
  return <div className="flag-scene" aria-hidden="true">
    <img className="flag-clean-plate" src={cleanPlate} alt="" width="1672" height="941" />
    <canvas className="flag-canvas" data-flag-amplitude="16" width="672" height="536" />
    <img className="flag-foreground" src={foreground} alt="" width="1672" height="941" />
  </div>
}
