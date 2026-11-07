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
        .fromTo('.ambient-scene', { opacity: 0 }, { opacity: 1, duration: 1.5 }, 0)
        .fromTo('.ambient-sun', { opacity: 0.10 }, { opacity: 0.22, duration: 5, repeat: -1, yoyo: true, ease: 'sine.inOut' }, 0)
        .fromTo('.ambient-mist-far', { x: -6, opacity: 0.045 }, { x: 10, opacity: 0.085, duration: 18, repeat: -1, yoyo: true, ease: 'sine.inOut' }, 0)
        .fromTo('.ambient-mist-near', { x: 7, y: 0, opacity: 0.035 }, { x: -12, y: -2, opacity: 0.075, duration: 13, repeat: -1, yoyo: true, ease: 'sine.inOut' }, 0)
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
