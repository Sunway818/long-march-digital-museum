import { useLayoutEffect, useRef, useState } from 'react'
import { resources } from '../assets/resources'
import { WoodenCta } from '../components/WoodenCta'
import { ScrollIndicator } from '../components/ScrollIndicator'
import { createHeroAnimations } from '../animations/heroAnimations'
import { createAmbientAnimations } from '../animations/ambientAnimations'
import { AmbientScene } from '../components/AmbientScene'
import { Atmosphere } from '../components/Atmosphere'

export function Hero({ onSource }: { onSource: () => void }) {
  const [imageFailed, setImageFailed] = useState(false)
  const [ambientPaused, setAmbientPaused] = useState(false)
  const root = useRef<HTMLElement>(null)
  const ambient = useRef<ReturnType<typeof createAmbientAnimations> | null>(null)
  useLayoutEffect(() => {
    if (!root.current) return
    const environment = createAmbientAnimations(root.current)
    ambient.current = environment
    const intro = createHeroAnimations(root.current, { onIntroStart: environment.wait, onIntroComplete: environment.start })
    return () => { intro.destroy(); environment.destroy(); ambient.current = null }
  }, [])
  return <section ref={root} id="home" tabIndex={-1} className="hero" aria-labelledby="hero-title">
    <div className="hero-media" aria-hidden="true"><div className="hero-image-motion">
      {!imageFailed && <><img className="hero-image" src={resources.hero} alt="" width="1672" height="941" fetchPriority="high" onError={() => { ambient.current?.setAvailable(false); setImageFailed(true) }} /><AmbientScene /></>}
    </div></div>
    <div className="hero-shade" aria-hidden="true" />
    {!imageFailed && <div className="hero-atmosphere-plane"><Atmosphere /></div>}
    <div className="hero-reveal" aria-hidden="true" />
    <div className="hero-content">
      <p className="hero-english" data-intro="title">THE LONG MARCH</p>
      <h1 id="hero-title" data-intro="title">伟大征程</h1>
      <div className="hero-subtitle" data-intro="subtitle"><span className="gold-rule" aria-hidden="true" /><p>纪念中国工农红军<br className="subtitle-break" />长征胜利九十周年</p></div>
      <p className="hero-year" data-intro="year"><span>1936</span><span className="year-line" aria-hidden="true" /><span className="sr-only">—</span><span>2026</span></p>
      <WoodenCta />
      {imageFailed && <p role="status" className="image-fallback">首页影像暂未加载，仍可进入展馆入口。</p>}
    </div>
    <div className="hero-footer"><p data-intro="controls">NINETY YEARS OF VICTORY</p><ScrollIndicator /><div className="hero-tools" data-intro="controls">
      {!imageFailed && <button className="ambient-toggle" aria-pressed={ambientPaused} onClick={() => { const paused = !ambientPaused; setAmbientPaused(paused); ambient.current?.setPaused(paused) }}>{ambientPaused ? '播放环境动效' : '暂停环境动效'}</button>}
      <button className="source-button" onClick={onSource}>影像说明<span aria-hidden="true"> ↗</span></button>
    </div></div>
  </section>
}
