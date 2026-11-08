import { gsap } from 'gsap'
import { createFlagRenderer, type FlagRenderer } from './flagRenderer'

/** One accumulated time for cloth, mist and sunlight; independent from scroll/history. */
export function createAmbientAnimations(scope: HTMLElement) {
  let started = false
  let ambientMotionEnabled = true
  let inView = true
  let available = true
  let reduced = false
  let disposed = false
  let elapsed = 0
  let previous: number | null = null
  let ticking = false
  let flagPending = false
  let flagAttempted = false
  let flag: FlagRenderer | null = null
  let motion: gsap.core.Timeline | null = null
  const abort = new AbortController()
  const media = gsap.matchMedia()
  scope.dataset.flagState = 'waiting'

  const tick = (now: number) => {
    if (previous !== null) elapsed += Math.min(Math.max(now - previous, 0), 0.1)
    previous = now
    motion?.totalTime(elapsed, false)
    flag?.render(elapsed)
    scope.dataset.ambientTime = elapsed.toFixed(5)
  }
  function sync() {
    if (disposed) return
    const state = !available ? 'unavailable' : reduced ? 'reduced' : !started || flagPending ? 'waiting' : document.hidden ? 'background' : !inView ? 'offscreen' : !ambientMotionEnabled ? 'paused' : 'running'
    scope.dataset.ambientState = state
    const shouldTick = state === 'running'
    if (shouldTick === ticking) return
    ticking = shouldTick
    previous = null
    if (shouldTick) gsap.ticker.add(tick)
    else gsap.ticker.remove(tick)
  }
  function failFlag() {
    scope.dataset.flagState = 'fallback'
    flag?.destroy(); flag = null
  }
  function initializeFlag() {
    if (flagAttempted || disposed) return
    flagAttempted = true; flagPending = true
    const canvas = scope.querySelector<HTMLCanvasElement>('.flag-canvas')
    if (!canvas) { flagPending = false; failFlag(); return }
    void createFlagRenderer(canvas, abort.signal, failFlag).then(renderer => {
      if (disposed) { renderer.destroy(); return }
      flag = renderer
      renderer.render(elapsed)
      scope.dataset.flagState = 'ready'
    }).catch(() => { if (!disposed) failFlag() }).finally(() => { flagPending = false; sync() })
  }
  media.add({ motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' }, context => {
    reduced = Boolean(context.conditions?.reduce)
    if (!reduced) {
      motion = gsap.timeline({ paused: true })
        .fromTo('.ambient-atmosphere', { opacity: 0 }, { opacity: 1, duration: 1.5 }, 0)
        .fromTo('.ambient-sun', { opacity: 0.08, scale: 1 }, { opacity: 0.40, scale: 1.04, svgOrigin: '1496 440', duration: 3.8, repeat: -1, yoyo: true, ease: 'sine.inOut' }, 0)
        .fromTo('.ambient-sun-halo', { opacity: 0.05, scale: 1 }, { opacity: 0.26, scale: 1.025, svgOrigin: '1496 425', duration: 3.8, repeat: -1, yoyo: true, ease: 'sine.inOut' }, 0)
        .fromTo('.ambient-mist-far', { x: -40, opacity: 0.16 }, { x: 80, opacity: 0.28, duration: 16, repeat: -1, yoyo: true, ease: 'sine.inOut' }, 0)
        .fromTo('.ambient-mist-near', { x: 34, y: 0, opacity: 0.14 }, { x: -80, y: -8, opacity: 0.24, duration: 11, repeat: -1, yoyo: true, ease: 'sine.inOut' }, 0)
        .fromTo('.ambient-mist-local', { x: -12, opacity: 0.06 }, { x: 24, opacity: 0.12, duration: 14, repeat: -1, yoyo: true, ease: 'sine.inOut' }, 0)
      motion.totalTime(elapsed, false)
      initializeFlag()
    }
    sync()
    return () => { motion = null }
  }, scope)

  // Only a fully hidden hero stops scenery; ordinary partial scroll never does.
  const observer = new IntersectionObserver(([entry]) => { inView = entry!.isIntersecting && entry!.intersectionRatio > 0; sync() }, { threshold: [0, 0.000001] })
  observer.observe(scope)
  document.addEventListener('visibilitychange', sync)
  return {
    wait() { started = false; sync() },
    start() { started = true; sync() },
    setEnabled(value: boolean) { ambientMotionEnabled = value; sync() },
    setAvailable(value: boolean) { available = value; sync() },
    destroy() {
      disposed = true
      abort.abort()
      gsap.ticker.remove(tick)
      observer.disconnect()
      document.removeEventListener('visibilitychange', sync)
      media.revert()
      flag?.destroy(); flag = null
      delete scope.dataset.ambientState
      delete scope.dataset.ambientTime
      delete scope.dataset.flagState
    },
  }
}
