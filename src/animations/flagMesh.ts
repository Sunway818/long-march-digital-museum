/** Exact C-grade displacement from the accepted stage-two mesh. Original pixel units. */
export const FLAG_AMPLITUDE = 16
export const FLAG_PERIOD = 8
export const FLAG_TEXTURE = { x: 192, y: 0, width: 636, height: 504 }
export const FLAG_VIEW = { x: 176, y: -16, width: 672, height: 536 }

const hoistPoints = [[30,229],[50,233],[75,239],[100,246],[125,250],[150,257],[175,264],[200,271],[225,278],[250,285],[275,291],[300,297],[325,299]] as const
function hoistX(y: number) {
  if (y <= 30) return 229
  for (let i = 1; i < hoistPoints.length; i++) {
    const [y1, x1] = hoistPoints[i]!
    const [y0, x0] = hoistPoints[i - 1]!
    if (y <= y1) return x0 + (x1 - x0) * (y - y0) / (y1 - y0)
  }
  return 299
}

export function flagDisplacement(x: number, y: number, time: number) {
  const lock = hoistX(y) + 28
  const u = Math.min(1, Math.max(0, (x - lock) / (815 - lock)))
  const weight = (u * u * (3 - 2 * u)) ** 1.35
  const phase = Math.PI * 2 * (1.15 * u - time / FLAG_PERIOD) + 0.22 * (y - 240) / 480
  const d = FLAG_AMPLITUDE * weight * Math.sin(phase)
  return [0.16 * d, Math.sqrt(1 - 0.16 ** 2) * d] as const
}

export function createFlagMesh() {
  const columns = 106, rows = 84, step = 6
  const base = new Float32Array((columns + 1) * (rows + 1) * 4)
  for (let row = 0; row <= rows; row++) for (let col = 0; col <= columns; col++) {
    const x = 192 + col * step, y = row * step
    base.set([x, y, (x - FLAG_TEXTURE.x) / FLAG_TEXTURE.width, y / FLAG_TEXTURE.height], (row * (columns + 1) + col) * 4)
  }
  const indices = new Uint16Array(columns * rows * 6)
  let k = 0
  for (let row = 0; row < rows; row++) for (let col = 0; col < columns; col++) {
    const a = row * (columns + 1) + col, b = a + 1, c = a + columns + 1
    indices.set([a, b, c, b, c + 1, c], k); k += 6
  }
  return { base, vertices: new Float32Array(base), indices }
}

export type FlagMesh = ReturnType<typeof createFlagMesh>
export function deformFlag(mesh: FlagMesh, time: number) {
  for (let i = 0; i < mesh.base.length; i += 4) {
    const x = mesh.base[i]!, y = mesh.base[i + 1]!
    const [dx, dy] = flagDisplacement(x, y, time)
    mesh.vertices[i] = x + dx; mesh.vertices[i + 1] = y + dy
  }
}
