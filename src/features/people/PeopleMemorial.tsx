import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, MouseEvent } from 'react'
import { memorialPeople, personById } from '../../data/history/people/people'
import { FullscreenButton } from '../../components/FullscreenButton'
import { PersonArchive } from './PersonArchive'
import { PortraitImage } from './PortraitImage'
import { usePortraitTransition } from './usePortraitTransition'
import { usePortraitReveal } from './usePortraitReveal'
import '../../styles/people-memorial.css'

export default function PeopleMemorial({ active, personId }: { active: boolean; personId: string | null }) {
  const [motionReduced, setMotionReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [background, setBackground] = useState(() => document.hidden)
  const [paused, setPaused] = useState(false)
  const [introPlaying, setIntroPlaying] = useState(false)
  const introActive = useRef(false)
  const root = useRef<HTMLElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const gallery = useRef<HTMLDivElement>(null)
  const scroll = useRef<HTMLElement>(null)
  const wallScroll = useRef(0)
  const previousPerson = useRef<string | null>(personId)
  const previousActive = useRef(false)
  const person = personId ? personById.get(personId) : undefined
  const running = active && !person && !background && !paused && !motionReduced
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const reduce = () => setMotionReduced(media.matches)
    const visibility = () => setBackground(document.hidden)
    media.addEventListener('change', reduce); document.addEventListener('visibilitychange', visibility)
    reduce()
    return () => { media.removeEventListener('change', reduce); document.removeEventListener('visibilitychange', visibility) }
  }, [])
  useLayoutEffect(() => {
    const entering = active && !introActive.current
    introActive.current = active
    if (!active || personId || motionReduced || background) setIntroPlaying(false)
    else if (entering) setIntroPlaying(true)
  }, [active, personId, motionReduced, background])
  useEffect(() => {
    if (!introPlaying) return
    const fallback = window.setTimeout(() => setIntroPlaying(false), 2650)
    return () => window.clearTimeout(fallback)
  }, [introPlaying])
  useLayoutEffect(() => {
    if (person && scroll.current) scroll.current.scrollTop = 0
    else if (active) {
      if (scroll.current) scroll.current.scrollTop = wallScroll.current
      if (previousPerson.current) gallery.current?.querySelector<HTMLAnchorElement>(`[data-person="${previousPerson.current}"]`)?.focus({ preventScroll: true })
      else if (!previousActive.current) heading.current?.focus({ preventScroll: true })
    }
    previousPerson.current = person?.id ?? null
    previousActive.current = active
  }, [active, person])
  const { focused, phase, navigate, cancel } = usePortraitTransition(root,personId,active,motionReduced,background)
  usePortraitReveal(scroll, gallery, active && !personId && !introPlaying && !motionReduced && !background && phase === 'idle')
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (!active || event.key !== 'Escape' || document.querySelector('dialog[open]')) return
      if (person) navigate('#people')
      else cancel()
    }
    document.addEventListener('keydown',escape)
    return () => document.removeEventListener('keydown',escape)
  },[active,person,navigate,cancel])
  const followPerson = (event: MouseEvent<HTMLElement>) => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
    const href = (event.target as Element).closest('a')?.getAttribute('href')
    if (!href || !(href === '#people' || href.startsWith('#people/'))) return
    event.preventDefault()
    if (!personId) wallScroll.current = scroll.current?.scrollTop ?? 0
    setIntroPlaying(false)
    navigate(href)
  }
  return <section ref={root} onClick={followPerson} className="people-memorial" aria-label="英雄人物纪念馆" data-active={active} data-background={background} data-transition={phase} data-ambient={running ? 'running' : 'paused'} data-intro={introPlaying ? 'playing' : 'done'} data-focus={focused ?? ''}>
    <a className="skip-link" href={person ? `#people/${person.id}` : '#people'} onClick={event => { event.preventDefault(); scroll.current?.querySelector<HTMLElement>('h1')?.focus() }}>跳到人物展陈正文</a>
    <header className="people-topbar"><a className="people-brand" href="#home" aria-label="伟大征程，返回首页">伟大征程<span>英雄人物纪念馆</span></a><nav aria-label="人物馆导航"><a href="#home">首页</a><a href="#map">时空长征</a><a href="#people" aria-current="page">英雄人物</a><a href="#legacy">精神传承</a>{person ? <button onClick={() => navigate('#people')}>关闭档案 ×</button> : <button aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? '播放环境光' : '暂停环境光'}</button>}<FullscreenButton /></nav></header>
    <main ref={scroll} className="people-scroll" aria-label="人物展陈正文">
      <div hidden={Boolean(personId)} className="people-gallery" ref={gallery} data-focused={Boolean(focused)}>
        <div className="people-environment" aria-hidden="true"><i /><i /><i /></div>
        <div className="people-gallery-heading" onAnimationEnd={event => { if (event.target === event.currentTarget && event.animationName === 'people-title-enter') setIntroPlaying(false) }}><div><p className="people-kicker">英雄人物纪念馆 <span>1934—1936</span></p><h1 ref={heading} tabIndex={-1}>长征中的脊梁</h1></div><div className="people-gallery-preface"><p>信仰 · 抉择 · 担当</p><p>选择一位人物，阅读他的长征档案。<br className="people-wide-break" />照片年代与来源见档案图注。</p></div></div>
        <div className="people-portrait-wall" aria-label="长征人物肖像墙">{memorialPeople.map((item, index) => <a className="people-portrait" key={item.id} href={`#people/${item.id}`} data-person={item.id} data-selected={focused === item.id} style={{ '--portrait-order':index } as CSSProperties} aria-label={`阅读${item.name}人物档案`}>
          <div className="people-portrait-light"><div className="people-portrait-motion"><PortraitImage person={item} priority={index < 8} /></div></div><div className="people-portrait-label"><h2>{item.name}{item.alias && <small>（{item.alias}）</small>}</h2><p>{item.role}</p><span className="people-portrait-note">{item.introduction}</span></div>
        </a>)}</div>
        <footer className="people-wall-footer"><p>从一张面孔，读一段征程。</p><span>照片年代与来源见各人物档案 · 部分影像拍摄于长征之后</span></footer>
      </div>
      {person && <PersonArchive key={person.id} person={person} active={active} />}
      {personId && !person && <div className="people-not-found"><h1>未找到这份人物档案</h1><a href="#people">返回肖像墙 →</a></div>}
    </main>
  </section>
}
