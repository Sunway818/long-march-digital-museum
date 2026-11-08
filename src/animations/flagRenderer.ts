import clothUrl from '../assets/flag/flag-cloth-local.png'
import { createFlagMesh, deformFlag, FLAG_VIEW } from './flagMesh'

export interface FlagRenderer { render(time: number): void; destroy(): void }

/** No clock here: the ambient manager alone advances the cloth, sun and mist. */
export async function createFlagRenderer(canvas: HTMLCanvasElement, signal: AbortSignal, onLost: () => void): Promise<FlagRenderer> {
  const layer = canvas.closest<HTMLElement>('.flag-scene')!
  const cloth = new Image(); cloth.src = clothUrl
  await Promise.all([cloth.decode(), ...Array.from(layer.querySelectorAll('img'), image => image.decode())])
  signal.throwIfAborted()
  const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: true, depth: false, stencil: false, preserveDrawingBuffer: true })
  if (!gl) throw new Error('WebGL2 unavailable')
  const dispose: (() => void)[] = []
  let destroyed = false
  const onContextLost = (event: Event) => { event.preventDefault(); onLost() }
  canvas.addEventListener('webglcontextlost', onContextLost)
  function destroy() {
    if (destroyed) return
    destroyed = true
    canvas.removeEventListener('webglcontextlost', onContextLost)
    resizeObserver.disconnect()
    for (const cleanup of dispose.reverse()) cleanup()
    if (!gl!.isContextLost()) gl!.getExtension('WEBGL_lose_context')?.loseContext()
  }
  // Same cover calculation as the original image; all three layers share a parent.
  let repaint = () => {}
  const resize = () => {
    if (destroyed) return
    const scale = Math.max(layer.clientWidth / 1672, layer.clientHeight / 941)
    const offsetX = (layer.clientWidth - 1672 * scale) / 2, offsetY = (layer.clientHeight - 941 * scale) / 2
    Object.assign(canvas.style, { left: `${offsetX + FLAG_VIEW.x * scale}px`, top: `${offsetY + FLAG_VIEW.y * scale}px`, width: `${FLAG_VIEW.width * scale}px`, height: `${FLAG_VIEW.height * scale}px` })
    repaint()
  }
  const resizeObserver = new ResizeObserver(resize)
  try {
    const shader = (type: number, source: string) => {
      const value = gl.createShader(type)
      if (!value) throw new Error('Shader allocation failed')
      dispose.push(() => gl.deleteShader(value))
      gl.shaderSource(value, source); gl.compileShader(value)
      if (!gl.getShaderParameter(value, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(value) ?? 'Shader compile failed')
      return value
    }
    const program = gl.createProgram()
    if (!program) throw new Error('Program allocation failed')
    dispose.push(() => gl.deleteProgram(program))
    gl.attachShader(program, shader(gl.VERTEX_SHADER, `#version 300 es
      layout(location=0) in vec2 position;layout(location=1) in vec2 uv;out vec2 texUV;
      void main(){vec2 p=position-vec2(${FLAG_VIEW.x}.0,${FLAG_VIEW.y}.0);gl_Position=vec4(p.x/${FLAG_VIEW.width}.0*2.0-1.0,1.0-p.y/${FLAG_VIEW.height}.0*2.0,0,1);texUV=uv;}`))
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, `#version 300 es
      precision highp float;in vec2 texUV;uniform sampler2D image;out vec4 color;
      void main(){color=texture(image,texUV);}`))
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? 'Shader link failed')
    const owned = <T,>(value: T | null, release: (value: T) => void): T => {
      if (value === null) throw new Error('GPU allocation failed')
      dispose.push(() => release(value)); return value
    }
    const mesh = createFlagMesh()
    const vao = owned(gl.createVertexArray(), value => gl.deleteVertexArray(value))
    const vertices = owned(gl.createBuffer(), value => gl.deleteBuffer(value))
    const indices = owned(gl.createBuffer(), value => gl.deleteBuffer(value))
    const texture = owned(gl.createTexture(), value => gl.deleteTexture(value))
    gl.bindVertexArray(vao); gl.bindBuffer(gl.ARRAY_BUFFER, vertices); gl.bufferData(gl.ARRAY_BUFFER, mesh.vertices, gl.DYNAMIC_DRAW)
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0)
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true); gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cloth)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.useProgram(program); gl.uniform1i(gl.getUniformLocation(program, 'image'), 0)
    gl.disable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    canvas.width = FLAG_VIEW.width; canvas.height = FLAG_VIEW.height
    gl.viewport(0, 0, canvas.width, canvas.height); gl.clearColor(0, 0, 0, 0)
    let currentTime = 0
    const render = (time: number) => {
      if (destroyed || gl.isContextLost()) return
      currentTime = time
      deformFlag(mesh, time)
      gl.clear(gl.COLOR_BUFFER_BIT); gl.bindBuffer(gl.ARRAY_BUFFER, vertices); gl.bufferSubData(gl.ARRAY_BUFFER, 0, mesh.vertices)
      gl.drawElements(gl.TRIANGLES, mesh.indices.length, gl.UNSIGNED_SHORT, 0)
      canvas.dataset.flagTime = time.toFixed(5)
    }
    repaint = () => render(currentTime)
    // Repainting on resize keeps a paused canvas visible without advancing its time.
    resizeObserver.disconnect()
    resizeObserver.observe(layer)
    resize(); render(currentTime)
    if (gl.getError() !== gl.NO_ERROR) throw new Error('WebGL initialization failed')
    return { render, destroy }
  } catch (error) { destroy(); throw error }
}
