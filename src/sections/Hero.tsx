import { useLayoutEffect, useRef, useState } from 'react'
import { resources } from '../assets/resources'
import { followRegionLink } from '../utils/navigation'
import { Arrow } from '../components/Arrow'
import { ScrollIndicator } from '../components/ScrollIndicator'
import { createHeroAnimations } from '../animations/heroAnimations'

export function Hero({ onSource }: { onSource: () => void }) {
  const [imageFailed, setImageFailed] = useState(false)
  const [introComplete, setIntroComplete] = useState(false)
  const root = useRef<HTMLElement>(null)
  const animations = useRef<ReturnType<typeof createHeroAnimations> | null>(null)
  useLayoutEffect(() => {
    if (!root.current) return
    animations.current = createHeroAnimations(root.current, () => setIntroComplete(true))
    return () => { animations.current?.destroy(); animations.current = null }
  }, [])
  return <section ref={root} id="home" tabIndex={-1} className="hero" aria-labelledby="hero-title">
    <div className="hero-media" aria-hidden="true"><div className="hero-image-motion">
      {!imageFailed && <img className="hero-image" src={resources.hero} alt="" width="1672" height="941" fetchPriority="high" onError={() => setImageFailed(true)} />}
    </div></div>
    <div className="hero-shade" aria-hidden="true" />
    <div className="hero-reveal" aria-hidden="true" />
    {!introComplete && <button className="skip-intro" onClick={() => animations.current?.skip()}>跳过片头</button>}
    <div className="hero-content">
      <p className="hero-english" data-intro="title">THE LONG MARCH</p>
      <h1 id="hero-title" data-intro="title">伟大征程</h1>
      <div className="hero-subtitle" data-intro="subtitle"><span className="gold-rule" aria-hidden="true" /><p>纪念中国工农红军<br className="subtitle-break" />长征胜利九十周年</p></div>
      <p className="hero-year" data-intro="year"><span>1936</span><span className="year-line" aria-hidden="true" /><span className="sr-only">—</span><span>2026</span></p>
      <a href="#entrance" className="journey-button" data-intro="controls" onClick={(event) => followRegionLink(event, 'entrance')}><span>开启征程</span><Arrow /></a>
      {imageFailed && <p role="status" className="image-fallback">首页影像暂未加载，仍可进入展馆入口。</p>}
    </div>
    <div className="hero-footer"><p data-intro="controls">NINETY YEARS OF VICTORY</p><ScrollIndicator /><button className="source-button" data-intro="controls" onClick={onSource}>影像说明<span aria-hidden="true"> ↗</span></button></div>
  </section>
}
