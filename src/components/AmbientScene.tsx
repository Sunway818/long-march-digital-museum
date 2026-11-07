import { useId } from 'react'
import { resources } from '../assets/resources'

/** Runtime overlays share the artwork's coordinate system; no raster derivative is saved. */
export function AmbientScene() {
  const id = useId().replaceAll(':', '')
  return <svg className="ambient-scene" viewBox="0 0 1672 941" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id={`${id}-fold`}>
        <stop stopColor="#f1c593" stopOpacity="0" />
        <stop offset=".36" stopColor="#f1c593" stopOpacity=".32" />
        <stop offset=".58" stopColor="#270c08" stopOpacity=".25" />
        <stop offset="1" stopColor="#270c08" stopOpacity="0" />
      </linearGradient>
      <filter id={`${id}-feather`}><feGaussianBlur stdDeviation="5" /></filter>
      <filter id={`${id}-ripple`} x="230" y="65" width="570" height="385" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency=".009 .027" numOctaves="1" seed="8" result="folds" />
        <feDisplacementMap in="SourceGraphic" in2="folds" scale="1.25" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <mask id={`${id}-cloth`} maskUnits="userSpaceOnUse" x="220" y="60" width="590" height="400">
        <path d="M251 92C350 133 453 174 554 212L649 253 695 296 724 334 749 377 776 430 718 399 650 373 573 351 487 330 398 319 299 305 282 243Z" fill="white" filter={`url(#${id}-feather)`} />
      </mask>
    </defs>
    <g mask={`url(#${id}-cloth)`}>
      <g className="ambient-flag-ripple"><image href={resources.hero} width="1672" height="941" filter={`url(#${id}-ripple)`} /></g>
      <rect className="ambient-flag-fold" x="288" y="75" width="472" height="380" fill={`url(#${id}-fold)`} />
    </g>
  </svg>
}
