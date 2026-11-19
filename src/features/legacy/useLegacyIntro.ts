import { useEffectEvent, useLayoutEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { gsap } from 'gsap'

type IntroControls = { finish: () => void; setPaused: (paused: boolean) => void }

export function useLegacyIntro(
  prologue: RefObject<HTMLElement | null>,
  scroll: RefObject<HTMLElement | null>,
  active: boolean,
  atPrologue: boolean,
  paused: boolean,
) {
  const controls = useRef<IntroControls | null>(null)
  const entry = useEffectEvent(() => ({ atPrologue, paused }))

  useLayoutEffect(() => {
    const scene = prologue.current
    const viewport = scroll.current
    if (!active || !scene || !viewport) return
    const initial = entry()
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const state = (value: 'playing' | 'paused' | 'complete') => { scene.dataset.intro = value }
    state('complete')
    if (!initial.atPrologue) return
    viewport.scrollTop = 0
    if (initial.paused || document.hidden || media.matches) return

    const select = (selector: string) => scene.querySelector<HTMLElement>(selector)!
    const mountain = select('.legacy-mountain')
    const campus = select('.legacy-campus-opening')
    const mountainOpacity = Number(getComputedStyle(mountain).opacity)
    const campusOpacity = Number(getComputedStyle(campus).opacity)
    const portrait = matchMedia('(orientation: portrait) and (max-width: 760px)').matches
    const compact = matchMedia('(max-width: 1024px), (any-pointer: coarse)').matches
    let context: gsap.Context | undefined
    let observer: IntersectionObserver | undefined
    const finish = () => {
      controls.current = null
      observer?.disconnect()
      context?.revert()
      context = undefined
      state('complete')
    }
    state('playing')
    context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: 'power2.out' }, paused: true, onComplete: finish })
      const plate = select('.legacy-prologue-plate')
      const wipe = select('.legacy-campus-reveal')
      const dusk = select('.legacy-prologue-dusk')
      const glow = select('.legacy-prologue-glow')
      const index = select('.legacy-prologue-content > .legacy-section-index')
      const glyphs = scene.querySelectorAll('.legacy-title-glyph')
      const lines = scene.querySelectorAll('.legacy-core > span')
      const dates = scene.querySelectorAll('.legacy-anniversaries > p')
      const cue = select('.legacy-read-link')

      gsap.set(plate, { scale: 1.035 })
      gsap.set(wipe, { '--legacy-wipe': portrait ? '72%' : '62%' })
      gsap.set([mountain, campus, index, ...lines, ...dates, cue, glow], { opacity: 0 })
      gsap.set(dusk, { opacity: 1 })
      gsap.set(glyphs, { opacity: 0, y: 8, clipPath: 'inset(-14% -14% 90% -14%)', ...(compact ? {} : { filter: 'blur(1.5px)' }) })
      gsap.set(dates, { y: 7 })
      gsap.set(cue, { y: 4 })

      timeline
        .to(dusk, { opacity: 0, duration: .78 }, 0)
        .to(mountain, { opacity: mountainOpacity, duration: .77 }, .03)
        .to(plate, { scale: 1, duration: 1.8, ease: 'power1.out' }, 0)
        .to(wipe, { '--legacy-wipe': '0%', duration: 1.2, ease: 'power1.inOut' }, .6)
        .to(campus, { opacity: campusOpacity, duration: 1.05, ease: 'power1.inOut' }, .67)
        .to(glow, { opacity: .6, duration: .55 }, .76)
        .to(glow, { opacity: 0, duration: .68 }, 1.31)
        .to(index, { opacity: 1, duration: .5 }, 1.25)
        .to(glyphs, { opacity: 1, y: 0, clipPath: 'inset(-14% -14% -14% -14%)', ...(compact ? {} : { filter: 'blur(0px)' }), duration: .58, stagger: .1 }, 1.42)
        .to(lines, { opacity: 1, duration: .44, stagger: .13 }, 2.03)
        .to(dates, { opacity: 1, y: 0, duration: .64, stagger: .22 }, 2.4)
        .to(cue, { opacity: 1, y: 0, duration: .96 }, 3.24)

      controls.current = {
        finish,
        setPaused: value => { timeline.paused(value); state(value ? 'paused' : 'playing') },
      }
      timeline.play()
    }, scene)

    if (typeof IntersectionObserver === 'function') {
      observer = new IntersectionObserver(entries => {
        if (entries.some(record => !record.isIntersecting)) finish()
      }, { root: viewport })
      observer.observe(scene)
    }
    const onVisibility = () => { if (document.hidden) finish() }
    const onPreference = () => { if (media.matches) finish() }
    document.addEventListener('visibilitychange', onVisibility)
    media.addEventListener('change', onPreference)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      media.removeEventListener('change', onPreference)
      finish()
    }
  }, [active, prologue, scroll])

  useLayoutEffect(() => {
    if (!atPrologue) controls.current?.finish()
    else controls.current?.setPaused(paused)
  }, [atPrologue, paused])
}
