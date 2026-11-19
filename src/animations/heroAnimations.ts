import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/** One scoped owner for intro children, image zoom and scroll container transforms. */
export function createHeroAnimations(scope: HTMLElement, callbacks: { onIntroStart?: () => void; onIntroComplete?: () => void } = {}) {
  let disposed = false
  let introSeen=false
  const media = gsap.matchMedia()
  const complete = () => { if (!disposed) callbacks.onIntroComplete?.() }

  media.add({ motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' }, context => {
    if (context.conditions?.reduce) { introSeen=true;complete(); return }
    const skipIntro=introSeen;introSeen=true
    callbacks.onIntroStart?.()
    const title = scope.querySelectorAll('[data-intro="title"]')
    const subtitle = scope.querySelector('[data-intro="subtitle"]')
    const year = scope.querySelector('[data-intro="year"]')
    const controls = scope.querySelectorAll('[data-intro="controls"]')
    const navigation = document.querySelector('[data-intro="navigation"]')
    const intro=gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: complete })
      .fromTo(scope.querySelector('.hero-reveal'), { opacity: 0.5 }, { opacity: 0, duration: 1.25 }, 0)
      .fromTo(scope.querySelector('.hero-image-motion'), { scale: 1.02 }, { scale: 1, duration: 2.2, ease: 'power2.out' }, 0)
      .fromTo(title, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 1.15, stagger: 0.08 }, 0.3)
      .fromTo(subtitle, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.85 }, 1)
      .fromTo(year, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7 }, 1.3)
      .fromTo([navigation, ...controls], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.65 }, 1.55)
    const visibility=()=>{if(document.hidden)intro.pause();else if(scope.closest('[hidden]'))intro.progress(1);else intro.resume()}
    document.addEventListener('visibilitychange',visibility)
    const route=()=>{if(scope.closest('[hidden]'))intro.progress(1)}
    addEventListener('chapterchange',route)
    visibility()
    if(skipIntro)intro.progress(1)

    // Scroll transforms own parent containers; never compete with intro child transforms.
    gsap.to(scope.querySelectorAll('.hero-media,.hero-atmosphere-plane'), {
      yPercent: 5, ease: 'none',
      scrollTrigger: { id: 'hero-parallax', trigger: scope, start: 'top top', end: 'bottom top', scrub: 0.5 },
    })
    gsap.to(scope.querySelector('.hero-content'), {
      opacity: 0, y: -24, ease: 'none',
      scrollTrigger: { id: 'hero-content-exit', trigger: scope, start: 'top top', end: 'bottom 30%', scrub: 0.35 },
    })
    return()=>{document.removeEventListener('visibilitychange',visibility);removeEventListener('chapterchange',route)}
  }, scope)

  const refresh = () => { if (!disposed) ScrollTrigger.refresh() }
  const image = scope.querySelector('img')
  image?.addEventListener('load', refresh)
  document.fonts.ready.then(refresh).catch(() => {})
  return {
    destroy() { disposed = true; image?.removeEventListener('load', refresh); media.revert() },
  }
}
