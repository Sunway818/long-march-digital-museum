import { useId } from 'react'
import { resources } from '../assets/resources'

/** Runtime overlays share the artwork's coordinate system; no raster derivative is saved. */
export function AmbientScene() {
  const id = useId().replaceAll(':', '')
  return <svg className="ambient-scene" viewBox="0 0 1672 941" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id={`${id}-dawn`}>
        <stop offset="0" stopColor="#f8d9a0" stopOpacity=".8" />
        <stop offset=".35" stopColor="#dbb27c" stopOpacity=".38" />
        <stop offset=".72" stopColor="#c49a67" stopOpacity=".12" />
        <stop offset="1" stopColor="#c49a67" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${id}-mist`} x1="0" y1="0" x2="0" y2="1">
        <stop stopColor="#d8d0ba" stopOpacity="0" />
        <stop offset=".45" stopColor="#d8d0ba" stopOpacity=".85" />
        <stop offset="1" stopColor="#bfb7a4" stopOpacity="0" />
      </linearGradient>
      <linearGradient id={`${id}-fold`}>
        <stop stopColor="#f1c593" stopOpacity="0" />
        <stop offset=".36" stopColor="#f1c593" stopOpacity=".32" />
        <stop offset=".58" stopColor="#270c08" stopOpacity=".25" />
        <stop offset="1" stopColor="#270c08" stopOpacity="0" />
      </linearGradient>
      <filter id={`${id}-soft`} x="-12%" y="-40%" width="124%" height="180%"><feGaussianBlur stdDeviation="8" /></filter>
      <filter id={`${id}-feather`}><feGaussianBlur stdDeviation="5" /></filter>
      <filter id={`${id}-ripple`} x="230" y="65" width="570" height="385" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency=".009 .027" numOctaves="1" seed="8" result="folds" />
        <feDisplacementMap in="SourceGraphic" in2="folds" scale="1.25" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <mask id={`${id}-valleys`} maskUnits="userSpaceOnUse" x="0" y="0" width="1672" height="941">
        <rect width="1672" height="941" fill="white" />
        <path d="M0 380H210L245 340 390 340 465 480 540 560 620 592 714 632 824 680 935 737 1140 941H0Z" fill="black" filter={`url(#${id}-feather)`} />
      </mask>
      <mask id={`${id}-cloth`} maskUnits="userSpaceOnUse" x="220" y="60" width="590" height="400">
        <path d="M251 92C350 133 453 174 554 212L649 253 695 296 724 334 749 377 776 430 718 399 650 373 573 351 487 330 398 319 299 305 282 243Z" fill="white" filter={`url(#${id}-feather)`} />
      </mask>
    </defs>
    <ellipse className="ambient-sun" cx="1496" cy="414" rx="310" ry="188" fill={`url(#${id}-dawn)`} />
    <g mask={`url(#${id}-valleys)`} fill={`url(#${id}-mist)`}>
      <g className="ambient-mist-far" filter={`url(#${id}-soft)`}>
        <path d="M605 515C739 465 789 550 928 523S1154 504 1290 551 1512 535 1620 543L1635 604C1477 593 1392 642 1246 603S1034 578 914 590 713 571 595 572Z" />
      </g>
      <g className="ambient-mist-near" filter={`url(#${id}-soft)`}>
        <path d="M777 653C907 604 1007 681 1122 648S1292 617 1399 664 1557 695 1700 651L1700 749C1561 769 1474 735 1380 742S1212 693 1105 718 909 716 768 707Z" />
      </g>
    </g>
    <g mask={`url(#${id}-cloth)`}>
      <g className="ambient-flag-ripple"><image href={resources.hero} width="1672" height="941" filter={`url(#${id}-ripple)`} /></g>
      <rect className="ambient-flag-fold" x="288" y="75" width="472" height="380" fill={`url(#${id}-fold)`} />
    </g>
  </svg>
}
