import { mkdir, writeFile } from 'node:fs/promises'

// Original static watercolor mist. Cached image rasterization, no per-frame SVG filter updates.
const folder = new URL('../src/assets/atmosphere/', import.meta.url)
await mkdir(folder, { recursive: true })
const fields = {
  far: [
    'M594 523C672 482 702 516 753 503S821 535 884 519 976 488 1032 519 1101 514 1155 534 1244 514 1315 547 1450 515 1560 548L1594 594C1490 579 1403 623 1297 588S1142 566 1066 581 945 558 870 582 744 565 683 575 615 554 583 566Z',
    'M876 516C953 493 973 536 1046 520S1157 524 1206 550L1200 571C1105 555 1046 561 976 549S910 543 871 548Z',
  ],
  near: [
    'M771 656C844 615 869 657 936 643S1028 685 1103 650 1199 627 1257 655 1328 636 1396 665 1486 675 1557 682 1643 645 1710 661L1710 743C1601 772 1553 710 1477 744S1335 707 1264 724 1137 687 1073 716 914 694 838 714L763 700Z',
    'M1047 678C1126 650 1183 689 1261 669S1392 669 1442 701L1429 719C1349 703 1280 706 1218 700S1101 707 1041 699Z',
  ],
  local: ['M601 549C654 519 675 555 712 542S781 560 825 547 887 563 935 554L944 588C883 579 851 604 805 585S730 593 687 577 631 580 594 569Z'],
}
for (const [name, paths] of Object.entries(fields)) {
  const svg = `<!-- Original procedural mist; scripts/generate-mist-textures.mjs. -->
<svg xmlns="http://www.w3.org/2000/svg" width="1672" height="941" viewBox="0 0 1672 941"><defs>
<linearGradient id="mist" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#d4ceba" stop-opacity="0"/><stop offset=".35" stop-color="#d4ceba" stop-opacity=".95"/><stop offset=".65" stop-color="#bdb8a8" stop-opacity=".65"/><stop offset="1" stop-color="#bdb8a8" stop-opacity="0"/></linearGradient>
<filter id="cloud" x="-12%" y="-55%" width="124%" height="210%"><feTurbulence type="fractalNoise" baseFrequency=".014 .035" numOctaves="2" seed="23" result="edge"/><feDisplacementMap in="SourceGraphic" in2="edge" scale="22" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur stdDeviation="5"/></filter>
</defs><g fill="url(#mist)" filter="url(#cloud)">${paths.map((path, index) => `<path d="${path}" opacity="${index ? '.6' : '1'}"/>`).join('')}</g></svg>\n`
  await writeFile(new URL(`mist-${name}.svg`, folder), svg)
}
await writeFile(new URL('valley-mask.svg', folder), `<svg xmlns="http://www.w3.org/2000/svg" width="1672" height="941" viewBox="0 0 1672 941"><defs><filter id="feather"><feGaussianBlur stdDeviation="8"/></filter></defs><rect width="1672" height="941" fill="white"/><path d="M0 380H210L245 340 390 340 465 480 540 560 620 592 714 632 824 680 935 737 1140 941H0Z" fill="black" filter="url(#feather)"/></svg>\n`)
console.log('Generated three original mist fields and a foreground-protection mask.')
