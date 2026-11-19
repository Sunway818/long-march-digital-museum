import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { gsap } from 'gsap'
import { reducedMotion } from '../../animations/motion'

const clamp=(value:number)=>Math.max(0,Math.min(1,value))
/** 原生滚动只驱动展陈装饰，不读取或写入历史日期。 */
export function useLegacyMotion(root:RefObject<HTMLElement|null>,scroll:RefObject<HTMLElement|null>,active:boolean){
 const seen=useRef(new WeakSet<Element>()),circuitPlayed=useRef(false)
 useEffect(()=>{
  const scope=root.current,scroller=scroll.current
  if(!scope||!scroller||!active)return
  const media=matchMedia('(prefers-reduced-motion: reduce)'),ctx=gsap.context(()=>{},scope)
  const running=new Set<gsap.core.Animation>()
  let frame=0,disposed=false
  const rail=scope.querySelector<HTMLElement>('.legacy-road-route'),entries=[...scope.querySelectorAll<HTMLElement>('.legacy-road-entry')]
  const circuit=scope.querySelector<SVGSVGElement>('#legacy-relay .legacy-circuit')
  const finish=()=>{for(const animation of running)animation.progress(1).pause()}
  function update(){
   frame=0;if(disposed||document.hidden)return
   const view=scroller!.getBoundingClientRect(),readingLine=view.top+view.height*.53
   if(rail){
    const box=rail.getBoundingClientRect(),progress=clamp((readingLine-box.top)/box.height)
    rail.style.setProperty('--road-progress',String(progress));scope!.dataset.roadProgress=progress.toFixed(4)
    const positions=entries.map(entry=>entry.querySelector('.legacy-road-node')!.getBoundingClientRect().top)
    const current=positions.reduce((last,top,index)=>top<=readingLine?index:last,0)
    entries.forEach((entry,index)=>{entry.dataset.roadState=index===current?'current':index<current?'passed':'ahead'})
   }
   for(const scene of scope!.querySelectorAll<HTMLElement>('.legacy-prologue,.legacy-epilogue')){
    const box=scene.getBoundingClientRect();scene.dataset.inView=String(box.bottom>view.top&&box.top<view.bottom)
   }
  }
  const schedule=()=>{if(!frame&&!document.hidden)frame=requestAnimationFrame(update)}
  function reveal(element:Element){
   if(seen.current.has(element)||reducedMotion()||document.hidden)return
   seen.current.add(element)
   ctx.add(()=>{
    const words=element.matches('.legacy-entrust-words h2'),isImage=element.matches('.legacy-photo,.legacy-jiang')
    const delay=words?.2:element.matches('.legacy-drone-scene>div')?.16:0
    const tween=gsap.fromTo(element,words?{opacity:.35,clipPath:'inset(0 0 24% 0)'}:isImage?{opacity:.48}:{opacity:.6,x:element.closest('.legacy-road-entry:nth-child(even)')?7:-7},{opacity:1,x:0,clipPath:'inset(0 0 0% 0)',duration:words?.85:isImage?.7:.52,delay,ease:'power2.out',clearProps:'opacity,transform,clipPath'})
    running.add(tween)
   })
  }
  function developCircuit(){
   if(!circuit||circuitPlayed.current)return
   circuitPlayed.current=true
   if(reducedMotion()||document.hidden){circuit.dataset.circuitPhase='complete';return}
   ctx.add(()=>{
    const route=circuit!.querySelector<SVGPathElement>('.legacy-route-path')!,dot=circuit!.querySelector<SVGCircleElement>('.legacy-signal-dot')!
    const terrain=circuit!.querySelector('.legacy-terrain')!,traces=circuit!.querySelectorAll<SVGGeometryElement>('.legacy-circuit-traces path,.legacy-circuit-traces rect')
    const progress={value:0},length=route.getTotalLength()
    const draw=()=>{const point=route.getPointAtLength(length*progress.value);dot.setAttribute('cx',String(point.x));dot.setAttribute('cy',String(point.y));route.style.strokeDashoffset=String(1-progress.value)}
    const timeline=gsap.timeline({onComplete:()=>{circuit!.dataset.circuitPhase='complete';dot.style.opacity='0'}})
    running.add(timeline);circuit!.dataset.circuitPhase='1936'
    gsap.set(route,{strokeDasharray:1,strokeDashoffset:1});gsap.set(dot,{opacity:1,fill:'#8a3c30'});draw()
    gsap.set(circuit!.querySelector('.legacy-route-ghost'),{opacity:.18})
    traces.forEach(trace=>{const size=trace.getTotalLength();gsap.set(trace,{strokeDasharray:size,strokeDashoffset:size})})
    timeline.to(progress,{value:.46,duration:1.25,ease:'none',onUpdate:draw})
      .call(()=>{circuit!.dataset.circuitPhase='1956'})
      .to(progress,{value:.76,duration:1.15,ease:'none',onUpdate:draw})
      .to(terrain,{opacity:.055,duration:.9},1.25)
      .to(circuit!.querySelectorAll('.legacy-march-nodes circle'),{stroke:'#a58b57',strokeWidth:3.2,duration:.65,stagger:.09},1.25)
      .fromTo(circuit!.querySelector('.legacy-pcb-pads'),{opacity:.15},{opacity:1,duration:.7},1.4)
      .to(traces,{strokeDashoffset:0,duration:.9,stagger:.035,ease:'power1.out'},1.6)
      .to(dot,{fill:'#b99a61',duration:.7},1.7)
      .call(()=>{circuit!.dataset.circuitPhase='2026'},[],2.4)
      .to(progress,{value:1,duration:1.05,ease:'none',onUpdate:draw},2.4)
      .fromTo(circuit!.querySelector('.legacy-chip'),{opacity:.2},{opacity:1,duration:.7},2.7)
      .fromTo(scope!.querySelector('.legacy-era-labels p:last-child'),{opacity:.4},{opacity:1,duration:.6},3)
      .to(dot,{opacity:0,duration:.2},3.45)
    if(document.documentElement.dataset.compact==='true')timeline.timeScale(1.18)
   })
  }
  const observer=new IntersectionObserver(records=>{
   for(const record of records){
    if(record.target===circuit){if(record.isIntersecting)developCircuit();else if(circuitPlayed.current)finish();continue}
    if(record.isIntersecting){reveal(record.target);observer.unobserve(record.target)}
   }
  },{root:scroller,threshold:.12})
  for(const item of scope.querySelectorAll('.legacy-road-text,.legacy-road-entry .legacy-photo,.legacy-jiang,.legacy-entrust-words h2,.legacy-drone-scene .legacy-photo,.legacy-drone-scene>div,.legacy-epilogue h2'))observer.observe(item)
  if(circuit&&!circuitPlayed.current)observer.observe(circuit)
  const visibility=()=>{if(document.hidden){finish();if(frame)cancelAnimationFrame(frame);frame=0}else schedule()}
  const reduce=()=>{if(media.matches)finish();schedule()}
  const resize=new ResizeObserver(schedule);resize.observe(scroller);resize.observe(scope)
  scroller.addEventListener('scroll',schedule,{passive:true});scope.addEventListener('load',schedule,true)
  addEventListener('hashchange',schedule);document.addEventListener('visibilitychange',visibility);media.addEventListener('change',reduce)
  void document.fonts.ready.then(()=>{if(!disposed)schedule()});update()
  return()=>{
   disposed=true;if(frame)cancelAnimationFrame(frame)
   observer.disconnect();resize.disconnect();ctx.revert()
   if(circuitPlayed.current&&circuit)circuit.dataset.circuitPhase='complete'
   scroller.removeEventListener('scroll',schedule);scope.removeEventListener('load',schedule,true)
   removeEventListener('hashchange',schedule);document.removeEventListener('visibilitychange',visibility);media.removeEventListener('change',reduce)
  }
 },[root,scroll,active])
}
