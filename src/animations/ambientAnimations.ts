import { gsap } from 'gsap'

/** One clock for local scenery, gated by intro, visibility and the user's choice. */
export function createAmbientAnimations(scope: HTMLElement) {
  let started = false
  let userPaused = false
  let inView = true
  let available = true
  let reduced = false
  let disposed = false
  let motion: gsap.core.Timeline | null = null
  const media = gsap.matchMedia()

  function sync() {
    if (disposed) return
    const state = !available ? 'unavailable' : reduced ? 'reduced' : !started ? 'waiting' : document.hidden ? 'background' : !inView ? 'offscreen' : userPaused ? 'paused' : 'running'
    scope.dataset.ambientState = state
    motion?.paused(state !== 'running')
  }

  media.add({ motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' }, context => {
    reduced = Boolean(context.conditions?.reduce)
    if (!reduced) {
      motion = gsap.timeline({ paused: true })
        .fromTo('.ambient-scene,.ambient-atmosphere', { opacity: 0 }, { opacity: 1, duration: 1.5 }, 0)
        .fromTo('.ambient-sun', { opacity: 0.08, scale: 1 }, { opacity: 0.40, scale: 1.04, svgOrigin: '1496 440', duration: 3.8, repeat: -1, yoyo: true, ease: 'sine.inOut' }, 0)
        .fromTo('.ambient-sun-halo', { opacity: 0.05, scale: 1 }, { opacity: 0.26, scale: 1.025, svgOrigin: '1496 425', duration: 3.8, repeat: -1, yoyo: true, ease: 'sine.inOut' }, 0)
        .fromTo('.ambient-mist-far', { x: -40, opacity: 0.16 }, { x: 80, opacity: 0.28, duration: 16, repeat: -1, yoyo: true, ease: 'sine.inOut' }, 0)
        .fromTo('.ambient-mist-near', { x: 34, y: 0, opacity: 0.14 }, { x: -80, y: -8, opacity: 0.24, duration: 11, repeat: -1, yoyo: true, ease: 'sine.inOut' }, 0)
        .fromTo('.ambient-mist-local', { x: -12, opacity: 0.06 }, { x: 24, opacity: 0.12, duration: 14, repeat: -1, yoyo: true, ease: 'sine.inOut' }, 0)
        .fromTo('.ambient-flag-ripple', { opacity: 0, x: 0, y: 0 }, { opacity: 0.68, x: 0.65, y: -0.35, duration: 6.7, repeat: -1, yoyo: true, ease: 'sine.inOut' }, 0)
        .fromTo('.ambient-flag-fold', { opacity: 0.03, x: -3 }, { opacity: 0.07, x: 4, duration: 4.3, repeat: -1, yoyo: true, ease: 'sine.inOut' }, 0)
    }
    sync()
    return () => { motion = null }
  }, scope)

  const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting && entry.intersectionRatio > 0.05; sync() }, { threshold: [0, 0.05, 1] })
  observer.observe(scope)
  document.addEventListener('visibilitychange', sync)
  return {
    wait() { started = false; sync() },
    start() { started = true; sync() },
    setPaused(value: boolean) { userPaused = value; sync() },
    setAvailable(value: boolean) { available = value; sync() },
    destroy() {
      disposed = true
      observer.disconnect()
      document.removeEventListener('visibilitychange', sync)
      media.revert()
      delete scope.dataset.ambientState
    },
  }
}
