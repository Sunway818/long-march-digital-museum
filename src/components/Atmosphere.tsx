import { useId } from 'react'
import farMist from '../assets/atmosphere/mist-far.svg'
import nearMist from '../assets/atmosphere/mist-near.svg'
import localMist from '../assets/atmosphere/mist-local.svg'
import valleyMask from '../assets/atmosphere/valley-mask.svg'

/** Cached mist textures move behind a fixed foreground mask; text stays above. */
export function Atmosphere() {
  const id = useId().replaceAll(':', '')
  return <div className="ambient-atmosphere" aria-hidden="true">
    <svg className="ambient-dawn" viewBox="0 0 1672 941" preserveAspectRatio="xMidYMid slice" focusable="false">
      <defs>
        <radialGradient id={`${id}-core`}>
          <stop stopColor="#ffd9a6" stopOpacity=".95" />
          <stop offset=".3" stopColor="#efb979" stopOpacity=".72" />
          <stop offset=".65" stopColor="#d8a06b" stopOpacity=".25" />
          <stop offset="1" stopColor="#c58f60" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-halo`}>
          <stop stopColor="#e9bd86" stopOpacity=".65" />
          <stop offset=".48" stopColor="#c99d70" stopOpacity=".28" />
          <stop offset="1" stopColor="#ba9169" stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}-feather`}><feGaussianBlur stdDeviation="8" /></filter>
        <mask id={`${id}-sky`} maskUnits="userSpaceOnUse" x="900" y="0" width="772" height="600">
          <path d="M900 0H1672V515L1610 485 1570 490 1520 467 1470 475 1410 455 1350 466 1290 450 1230 441 1150 452 1050 430 900 442Z" fill="white" filter={`url(#${id}-feather)`} />
        </mask>
      </defs>
      <g mask={`url(#${id}-sky)`}>
        <ellipse className="ambient-sun-halo" cx="1496" cy="425" rx="430" ry="245" fill={`url(#${id}-halo)`} />
        <ellipse className="ambient-sun" cx="1496" cy="440" rx="225" ry="148" fill={`url(#${id}-core)`} />
      </g>
    </svg>
    <div className="ambient-mist-mask" style={{ maskImage: `url("${valleyMask}")` }}>
      <img className="ambient-mist-far" src={farMist} width="1672" height="941" alt="" />
      <img className="ambient-mist-near" src={nearMist} width="1672" height="941" alt="" />
      <img className="ambient-mist-local" src={localMist} width="1672" height="941" alt="" />
    </div>
  </div>
}
