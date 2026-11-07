import type { MouseEvent } from 'react'

export function scrollToRegion(id: string, hash = `#${id}`) {
  const region = document.getElementById(id)
  if (!region) return
  history.replaceState(null, '', hash)
  region.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  region.focus({ preventScroll: true })
}

/** Keep modifier clicks and opening links in another tab native. */
export function followRegionLink(event: MouseEvent<HTMLAnchorElement>, id: string, beforeNavigate?: () => void) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  beforeNavigate?.()
  scrollToRegion(id, event.currentTarget.hash)
}
