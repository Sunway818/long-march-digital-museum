import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { animateMotion, motion } from '../../animations/motion'

interface PictureBounds { x: number; y: number; width: number; height: number }
/** Measure the contained photograph, rather than stretching the surrounding display frame. */
function pictureBounds(image: HTMLImageElement): PictureBounds {
  const box = image.getBoundingClientRect()
  const ratio = (image.naturalWidth || Number(image.getAttribute('width'))) / (image.naturalHeight || Number(image.getAttribute('height')))
  const width = Math.min(box.width, box.height * ratio), height = width / ratio
  return { x:box.x + (box.width - width) / 2, y:box.y + (box.height - height) / 2, width, height }
}
const wallImage = (root: HTMLElement | null, id: string) => root?.querySelector<HTMLImageElement>(`[data-person="${CSS.escape(id)}"] img`) ?? null
interface Flight { id: string; href: string; token: number; navigated: boolean; closing: boolean; clone: HTMLImageElement | null; from: PictureBounds | null }

export function usePortraitTransition(root: RefObject<HTMLElement | null>, personId: string | null, active: boolean, reduced: boolean, background: boolean) {
  const [phase, setPhase] = useState<'idle' | 'focus' | 'travel' | 'reveal'>('idle')
  const [focused, setFocused] = useState<string | null>(null)
  const pending = useRef<Flight | null>(null)
  const animations = useRef<Animation[]>([])
  const timeout = useRef<number | null>(null)
  const frame = useRef<number | null>(null)
  const sequence = useRef(0)
  const clear = useCallback(() => {
    sequence.current++
    if (timeout.current !== null) clearTimeout(timeout.current)
    if (frame.current !== null) cancelAnimationFrame(frame.current)
    timeout.current = null; frame.current = null
    animations.current.forEach(animation => animation.cancel()); animations.current = []
    pending.current?.clone?.remove(); pending.current = null
  }, [])
  const cancel = useCallback(() => { clear(); setPhase('idle'); setFocused(null) }, [clear])
  useEffect(() => clear, [clear])
  useEffect(() => { if (!active || background || reduced) cancel() }, [active, background, reduced, cancel])
  useEffect(() => { addEventListener('resize',cancel); return () => removeEventListener('resize',cancel) }, [cancel])

  const navigate = useCallback((href: string, fromHistory=false) => {
    const nextId = href.startsWith('#people/') ? href.slice(8) : null
    const id = nextId ?? personId
    if ((!fromHistory&&href === location.hash) || !id) return
    // A different person has a different photograph: use the reading fade, never fly one face into another.
    if (personId && nextId) { cancel(); location.hash = href.slice(1); return }
    const image = personId ? root.current?.querySelector<HTMLImageElement>('.person-archive-portrait img') : wallImage(root.current,id)
    const previous = pending.current
    const from = previous?.id === id && previous.clone ? pictureBounds(previous.clone) : image ? pictureBounds(image) : null
    const src = image?.currentSrc || image?.src
    clear()
    if (reduced || background || !active || !image || !from?.width || !src || typeof image.animate !== 'function') { location.hash = href.slice(1); return }
    const clone = document.createElement('img')
    clone.src = src; clone.alt = ''; clone.setAttribute('aria-hidden','true'); clone.className = 'people-flight-image'
    clone.style.filter=getComputedStyle(image).filter
    Object.assign(clone.style,{ left:`${from.x}px`, top:`${from.y}px`, width:`${from.width}px`, height:`${from.height}px` })
    root.current?.append(clone)
    const token = sequence.current,originHref=location.hash
    const closing = nextId === null
    pending.current = { id, href, token, navigated:fromHistory, closing, clone, from }
    setFocused(id); setPhase('focus')
    if(fromHistory)return
    const focus = clone.animate([{transform:'scale(1)'},{transform:closing ? 'scale(1)' : 'translate(-1.25%, -1.25%) scale(1.025)'}],{duration:closing ? 90 : 160,fill:'forwards',easing:motion.ease})
    animations.current.push(focus)
    const outgoing = closing ? root.current?.querySelector<HTMLElement>('.person-archive-main') : null
    if (outgoing) animations.current.push(outgoing.animate([{opacity:1},{opacity:0}],{duration:80,fill:'forwards',easing:'ease-out'}))
    timeout.current = window.setTimeout(() => {
      const flight = pending.current
      if (!flight || flight.token !== token) return
      if(location.hash!==originHref){cancel();return}
      flight.navigated = true
      location.hash = href.slice(1)
    },closing ? 90 : 160)
  },[personId, root, clear, cancel, reduced, background, active])

  useEffect(()=>{
    const historyNavigation=()=>{
      const href=location.hash
      if(!active)return
      const flight=pending.current
      if(flight){
        if(flight.href===href){
          // 浏览器比短聚焦计时器更早抵达目标时，直接接续，不能等待第二次hashchange。
          if(!flight.navigated){flight.navigated=true;if(timeout.current!==null)clearTimeout(timeout.current);timeout.current=null}
          return
        }
        cancel()
      }
      if(!(href==='#people'||href.startsWith('#people/')))return
      const next=href.startsWith('#people/')?href.slice(8):null
      if(next!==personId)navigate(href,true)
    }
    addEventListener('hashchange',historyNavigation)
    return()=>removeEventListener('hashchange',historyNavigation)
  },[active,personId,navigate,cancel])

  useLayoutEffect(() => {
    const flight = pending.current
    // 路由先于原生hash监听器完成提交时，也必须在布局阶段仲裁最新地址。
    if(flight&&location.hash!==flight.href){cancel();return}
    if(flight&&!flight.navigated&&location.hash===flight.href){
      flight.navigated=true;if(timeout.current!==null)clearTimeout(timeout.current);timeout.current=null
    }
    if (!flight?.navigated) {
      if(active&&personId&&!reduced&&!background){
        const reading=animateMotion(root.current?.querySelector('.person-archive-layout'),'portrait-reading',[{opacity:.55},{opacity:1}],{duration:motion.reveal})
        if(reading)animations.current.push(reading)
      }
      return
    }
    if (location.hash !== flight.href || !active) { cancel(); return }
    frame.current = requestAnimationFrame(() => {
      if (pending.current !== flight) return
      const target = personId ? root.current?.querySelector<HTMLImageElement>('.person-archive-portrait img') : wallImage(root.current,flight.id)
      if (!target || !flight.clone || !flight.from) { cancel(); return }
      const to = pictureBounds(target), from = flight.from
      if (!to.width) { cancel(); return }
      const startTransform=getComputedStyle(flight.clone).transform
      animations.current.forEach(animation => animation.cancel()); animations.current = []
      setPhase('travel')
      const travel = flight.clone.animate([
        { transform:startTransform==='none'?'scale(1)':startTransform, opacity:1 },
        { transform:`translate(${to.x-from.x}px, ${to.y-from.y}px) scale(${to.width/from.width})`, opacity:1 },
      ],{duration:flight.closing ? 520 : motion.portrait,fill:'forwards',easing:motion.ease})
      animations.current.push(travel)
      const content = root.current?.querySelector<HTMLElement>(personId ? '.person-archive-main' : '.people-portrait-wall')
      if (content) animations.current.push(content.animate([{opacity:.18,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:motion.reveal,delay:flight.closing ? 70 : 220,easing:motion.ease,fill:'backwards'}))
      void travel.finished.then(() => {
        if (pending.current !== flight) return
        setPhase('reveal')
        if(flight.clone)animations.current.push(flight.clone.animate([{opacity:1},{opacity:0}],{duration:120,fill:'forwards'}))
        timeout.current = window.setTimeout(() => {
          if (pending.current !== flight) return
          const focus = !personId ? root.current?.querySelector<HTMLElement>(`[data-person="${CSS.escape(flight.id)}"]`) : root.current?.querySelector<HTMLElement>('.person-archive h1')
          cancel(); focus?.focus({preventScroll:true})
        },120)
      }).catch(() => {})
    })
  },[personId,active,root,cancel])
  return { focused, phase, navigate, cancel }
}
