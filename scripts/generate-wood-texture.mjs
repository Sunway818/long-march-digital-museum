import { writeFile } from 'node:fs/promises'

// Deterministic vector grain, knots and patina. Original project artwork; no downloads.
let seed = 7319
const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296)
const fixed = value => value.toFixed(2)
const paths = []
for (let row = 0; row < 68; row++) {
  const y = row * 2.2 - 2
  const phase = random() * Math.PI * 2
  const amplitude = .8 + random() * 2.6
  const points = []
  for (let x = -16; x <= 544; x += 16) {
    let bend = Math.sin(x * .017 + phase) * amplitude + Math.sin(x * .041 + row * .27) * .55
    for (const knot of [{ x: 394, y: 111, width: 47, height: 24 }, { x: 83, y: 29, width: 32, height: 13 }]) {
      bend += Math.sign(y - knot.y) * 14 * Math.exp(-(((x - knot.x) / knot.width) ** 2)) * Math.exp(-(((y - knot.y) / knot.height) ** 2))
    }
    points.push([x, y + bend])
  }
  let d = `M${points[0].map(fixed).join(' ')}`
  for (let index = 1; index < points.length - 1; index++) {
    const [x, py] = points[index]; const next = points[index + 1]
    d += `Q${fixed(x)} ${fixed(py)} ${fixed((x + next[0]) / 2)} ${fixed((py + next[1]) / 2)}`
  }
  const light = row % 4 === 0
  paths.push(`<path d="${d}" stroke="${light ? '#e1bc7d' : '#452c18'}" stroke-width="${fixed(.35 + random() * .85)}" opacity="${fixed(.10 + random() * .26)}"/>`)
}
const svg = `<!-- Original deterministic oak grain; regenerate with node scripts/generate-wood-texture.mjs. -->
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="144" viewBox="0 0 512 144">
<defs>
<linearGradient id="wood" x2="0" y2="1"><stop stop-color="#9b7647"/><stop offset=".35" stop-color="#b08a52"/><stop offset=".72" stop-color="#a17b46"/><stop offset="1" stop-color="#805b33"/></linearGradient>
<radialGradient id="wear"><stop stop-color="#d8b47b" stop-opacity=".14"/><stop offset="1" stop-color="#3d2817" stop-opacity=".22"/></radialGradient>
<filter id="patina"><feTurbulence type="fractalNoise" baseFrequency=".025 .12" numOctaves="3" seed="17" stitchTiles="stitch"/><feColorMatrix type="matrix" values="0 0 0 0 .19 0 0 0 0 .105 0 0 0 0 .045 0 0 0 .28 0"/></filter>
</defs>
<rect width="512" height="144" fill="url(#wood)"/>
<g fill="none">${paths.join('\n')}</g>
<g fill="none" stroke="#412a18" opacity=".48"><path d="M365 111C377 98 396 100 409 107S424 118 408 123 376 124 365 111Z" stroke-width="1"/><path d="M374 111C385 105 399 106 407 112S399 118 387 117 376 115 374 111Z" stroke-width="1.2"/><path d="M382 112Q395 107 402 113Q394 119 382 112Z" fill="#49301c"/><path d="M63 27C72 21 85 21 95 27S86 34 74 32 63 27 63 27Z" stroke-width=".6"/></g>
<rect width="512" height="144" fill="url(#wear)"/>
<rect width="512" height="144" filter="url(#patina)" opacity=".6"/>
<g fill="none" stroke="#3e2818" stroke-linecap="round"><path d="M5 4Q82 8 130 4T254 5 392 4 507 5M4 139Q57 135 122 139T255 138 384 139 507 136" stroke-width="2" opacity=".45"/><path d="M1 14L4 39 2 66 4 84 2 122M510 18L508 40 511 59 508 94 510 132" stroke-width="3" opacity=".42"/><path d="M18 12Q68 9 104 13M304 132L356 130M437 12L479 10" stroke-width=".8" opacity=".32"/></g>
<g stroke="#d5af77" stroke-width="1.3" opacity=".35"><path d="M12 6L43 7M69 6L101 6M223 5L252 6M398 6L423 5M25 136L49 137M373 136L392 136M465 136L497 134"/></g>
</svg>\n`
await writeFile(new URL('../src/assets/textures/wood-grain.svg', import.meta.url), svg)
console.log(`Generated original wood texture: ${Buffer.byteLength(svg)} bytes`)
