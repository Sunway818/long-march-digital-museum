import { useEffect } from 'react'
import type { RefObject } from 'react'
import { animateMotion } from '../../animations/motion'

export function usePortraitReveal(scroll: RefObject<HTMLElement | null>, gallery: RefObject<HTMLDivElement | null>, enabled: boolean) {
  useEffect(() => {
    const viewport = scroll.current
    const wall = gallery.current
    if (!enabled || !viewport || !wall || typeof IntersectionObserver !== 'function') return

    const cards = Array.from(wall.querySelectorAll('.people-portrait'))
    const photos = new Map(cards.map(card => [card, card.querySelector<HTMLElement>('.people-portrait-motion')]))
    const armed = new Map<Element, 'above' | 'below'>()
    const animations = new Map<Element, Animation>()
    const cancel = (card: Element) => {
      animations.get(card)?.cancel()
      animations.delete(card)
      photos.get(card)?.parentElement?.removeAttribute('data-reveal-moving')
    }
    const arm = (card: Element, side: 'above' | 'below') => {
      armed.set(card, side)
      photos.get(card)?.setAttribute('data-reveal-armed', '')
    }
    const disarm = (card: Element) => {
      armed.delete(card)
      photos.get(card)?.removeAttribute('data-reveal-armed')
    }
    const viewportBounds = viewport.getBoundingClientRect()
    for (const card of cards) {
      const bounds = card.getBoundingClientRect()
      if (bounds.bottom <= viewportBounds.top) arm(card, 'above')
      else if (bounds.top >= viewportBounds.bottom) arm(card, 'below')
    }
    const exit = new IntersectionObserver(entries => {
      for (const { target: card, rootBounds, boundingClientRect, isIntersecting } of entries) {
        if (rootBounds && !isIntersecting) {
          cancel(card)
          arm(card, boundingClientRect.bottom <= rootBounds.top ? 'above' : 'below')
        }
      }
    }, { root: viewport, rootMargin: '22px 0px' })
    const enter = new IntersectionObserver(entries => {
      const entering: { card: Element; offset: number }[] = []
      for (const { target: card, isIntersecting } of entries) {
        const side = armed.get(card)
        if (!isIntersecting || !side) continue
        disarm(card)
        if (!card.matches(':focus-visible')) entering.push({ card, offset: side === 'above' ? -22 : 22 })
      }
      entering.sort((first, second) => cards.indexOf(first.card) - cards.indexOf(second.card))
      entering.forEach(({ card, offset }, index) => {
        const animation = animateMotion(photos.get(card), 'portrait-reveal', [
          { opacity: 0, transform: `translateY(${offset}px)` },
          { opacity: 1, transform: 'translateY(0)' },
        ], { duration: 680, delay: (index % 4) * 90 })
        if (animation) {
          animations.set(card, animation)
          photos.get(card)?.parentElement?.setAttribute('data-reveal-moving', '')
          const release = () => { if (animations.get(card) === animation) cancel(card) }
          void animation.finished.then(release, release)
        }
      })
    }, { root: viewport })

    const showFocused = (event: Event) => {
      const card = (event.target as HTMLElement).closest('.people-portrait')
      if (card?.matches(':focus-visible')) { cancel(card); disarm(card) }
    }
    cards.forEach(card => { exit.observe(card); enter.observe(card) })
    wall.addEventListener('focusin', showFocused)
    return () => {
      enter.disconnect()
      exit.disconnect()
      wall.removeEventListener('focusin', showFocused)
      cards.forEach(card => { cancel(card); disarm(card) })
    }
  }, [scroll, gallery, enabled])
}
