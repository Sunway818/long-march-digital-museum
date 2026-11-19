import { useEffect, useRef, useState } from 'react'
import { memorialPeople } from '../../data/history/people/people'
import { personSourceById } from '../../data/history/people/sources'
import { PortraitImage } from './PortraitImage'
import type { MemorialPerson } from './types'

export function PersonArchive({ person, active }: { person: MemorialPerson; active: boolean }) {
  const heading = useRef<HTMLHeadingElement>(null)
  const viewer = useRef<HTMLDialogElement>(null)
  const sources = useRef<HTMLDetailsElement>(null)
  const [imageOpen, setImageOpen] = useState(false)
  const research = person.research!
  const usedIds = [...new Set([person.portrait.sourceId, ...research.basicSourceIds, ...person.biographySourceIds, ...research.appointments.flatMap(item=>item.sourceIds), ...person.chapters.flatMap(chapter => chapter.sourceIds), ...research.moments.flatMap(item=>item.sourceIds), ...person.events.map(event => event.sourceId)])]
  const index = memorialPeople.findIndex(item => item.id === person.id)
  const next = memorialPeople[(index + 1) % memorialPeople.length]!
  const previous = memorialPeople[(index + memorialPeople.length - 1) % memorialPeople.length]!
  const photoSource = personSourceById.get(person.portrait.sourceId)!
  useEffect(() => { if (active) heading.current?.focus({ preventScroll: true }) }, [active, person.id])
  useEffect(() => {
    if (imageOpen && active) viewer.current?.showModal()
    else viewer.current?.close()
  }, [imageOpen, active])
  useEffect(() => { if (!active) setImageOpen(false) }, [active])
  const jump = (id: string) => document.getElementById(`person-${person.id}-${id}`)?.scrollIntoView({ behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block:'start' })
  const showSource = (id: string) => {
    if (sources.current) sources.current.open = true
    requestAnimationFrame(()=>{
      const item=document.getElementById(`person-source-${person.id}-${id}`)
      item?.scrollIntoView({behavior:'instant',block:'center'});item?.focus({preventScroll:true})
    })
  }
  const references = (ids:string[]) => <p className="person-citations"><span>史料依据</span>{ids.map(id=><button key={id} onClick={()=>showSource(id)} aria-label={`查看史料${usedIds.indexOf(id)+1}：${personSourceById.get(id)!.title}`}>[{usedIds.indexOf(id)+1}]</button>)}</p>
  return <article className="person-archive" aria-labelledby={`person-name-${person.id}`}>
    <div className="person-archive-layout">
      <aside className="person-archive-aside" aria-label={`${person.name}肖像与基本信息`}><figure className="person-archive-portrait"><button onClick={() => setImageOpen(true)} aria-label={`放大${person.name}历史影像`}><PortraitImage person={person} priority /><span className="people-image-action">查看完整影像 ↗</span></button><figcaption>{person.portrait.date} · <a href={photoSource.url} target="_blank" rel="noreferrer">{photoSource.institution} ↗</a><br /><span>{person.portrait.caption}</span></figcaption></figure><dl className="person-basic-facts"><div><dt>生卒</dt><dd>{research.lifespan}</dd></div><div><dt>籍贯</dt><dd>{research.origin}</dd></div><div><dt>组织</dt><dd>{research.organization}</dd></div><div><dt>摄影地点</dt><dd>{person.portrait.place??'原图注未注明'}</dd></div></dl></aside>
      <div className="person-archive-main">
      <div className="person-archive-heading"><p className="people-kicker">长征人物档案 · 1934—1936</p><h1 id={`person-name-${person.id}`} ref={heading} tabIndex={-1}>{person.name}</h1>{person.alias && <p className="person-alias">{person.alias}</p>}<p className="person-position">{person.role}</p><p className="person-introduction">{person.introduction}</p>
        <div className="person-biography"><p className="people-kicker">生平提要 · 长征前后</p><p>{person.biography}</p></div>
        <dl className="person-appointments" aria-label="长征时期职务变化">{research.appointments.map(item=><div key={item.period}><dt>{item.period}</dt><dd>{item.title}</dd></div>)}</dl>
        <nav className="person-chapter-nav" aria-label="人物档案目录">{person.chapters.filter(item=>item.kind!=='interpretation').map(chapter => <button key={chapter.id} onClick={() => jump(chapter.id)}>{chapter.title}</button>)}<button onClick={()=>jump('moments')}>关键历史瞬间</button>{person.chapters.filter(item=>item.kind==='interpretation').map(chapter=><button key={chapter.id} onClick={()=>jump(chapter.id)}>{chapter.title}</button>)}</nav>
      </div>
    <div className="person-archive-reading">{person.chapters.map(chapter => <div key={chapter.id}>
      <section className={chapter.kind === 'interpretation' ? 'person-chapter person-interpretation' : 'person-chapter'} id={`person-${person.id}-${chapter.id}`} aria-labelledby={`chapter-${person.id}-${chapter.id}`}>
      {chapter.kind==='interpretation'&&<p className="people-kicker">本站解读 · 分析判断</p>}<h2 id={`chapter-${person.id}-${chapter.id}`}>{chapter.title}</h2>{chapter.paragraphs.map(text => <p key={text}>{text}</p>)}{references(chapter.sourceIds)}
      </section>
      {chapter.id==='journey'&&<section className="person-moments" id={`person-${person.id}-moments`} aria-labelledby={`moments-${person.id}`}><h2 id={`moments-${person.id}`}>关键历史瞬间</h2>{research.moments.map(item=><section key={item.id} className="person-moment"><p className="people-kicker">{item.date} · {item.place}</p><h3>{item.title}</h3><p>{item.context}</p><p>{item.action}</p><p>{item.result}</p>{item.mapEventId&&<a className="person-moment-map" href={`#map?event=${encodeURIComponent(item.mapEventId)}`}>在长征地图中查看 <span aria-hidden="true">↗</span></a>}{references(item.sourceIds)}</section>)}</section>}
    </div>)}
      {person.events.length>0&&<section className="person-events" aria-labelledby={`person-events-${person.id}`}><p className="people-kicker">回到历史现场</p><h2 id={`person-events-${person.id}`}>在地图中继续阅读</h2><div>{person.events.map(event => <a key={event.id} href={`#map?event=${encodeURIComponent(event.id)}`}><strong>{event.title} <span aria-hidden="true">↗</span></strong><span>{event.relation}</span></a>)}</div></section>}
      <details ref={sources} className="person-sources"><summary>影像说明与史料目录</summary><div><h3>本页历史影像</h3><p>{person.portrait.caption}</p><p>{person.portrait.date} · <a href={photoSource.url} target="_blank" rel="noreferrer">{photoSource.institution} ↗</a></p>{research.reviewNote&&<p className="person-research-note">阅读提示：{research.reviewNote}</p>}<ol>{usedIds.map(id => { const source = personSourceById.get(id)!; return <li key={id} id={`person-source-${person.id}-${id}`} tabIndex={-1}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title} ↗</a><p>{source.institution} · {source.locator}</p></li> })}</ol></div></details>
      <footer className="person-editorial-nav"><a href={`#people/${previous.id}`}><small>上一人物</small>{previous.name} ←</a><a href="#people">返回肖像墙</a><a href={`#people/${next.id}`}><small>下一人物</small>{next.name} →</a></footer>
    </div>
    </div></div>
    <dialog className="people-image-viewer" ref={viewer} aria-label={`${person.name}完整历史影像`} onCancel={() => setImageOpen(false)} onClick={event => { if (event.target === viewer.current) setImageOpen(false) }}><button className="people-viewer-close" autoFocus onClick={() => setImageOpen(false)}>关闭影像 ×</button><figure><PortraitImage person={person} priority /><figcaption>{person.portrait.caption}<br />{person.portrait.date} · <a href={photoSource.url} target="_blank" rel="noreferrer">{photoSource.institution} ↗</a></figcaption></figure></dialog>
  </article>
}
