import { useEffect, useRef, useState } from 'react'
import { FullscreenButton } from '../../components/FullscreenButton'
import { resources } from '../../assets/resources'
import { siteAssetUrl } from '../../assets/siteAssetUrl'
import historicalImages from '../../data/history/map/images.json'
import { entrustSections, legacyChapters, legacyNarrative, legacySources, schoolMilestones, spiritDimensions } from '../../data/history/legacy/content'
import { RouteCircuit } from './RouteCircuit'
import { YouthAnswer } from './YouthAnswer'
import { useLegacyMotion } from './useLegacyMotion'
import { useLegacyIntro } from './useLegacyIntro'
import '../../styles/legacy.css'

interface Photo { src:string;title:string;caption:string;source:string }
const photoSizes:Record<string,readonly [number,number]>={
 '/history-media/AST-0027.jpg':[1080,721],'/history-media/AST-0080.jpg':[1280,726],'/history-media/AST-0002.jpg':[550,403],'/history-media/AST-0072.jpg':[883,705],'/history-media/AST-0029.jpg':[800,1010],
 '/legacy-media/shazhou-old-house.jpg':[1024,683],'/legacy-media/jiang-baozeng.jpg':[339,489],'/legacy-media/hdu-computer-1980.jpg':[439,443],'/legacy-media/hdu-wending-square.webp':[1920,1440],'/legacy-media/hdu-drone-2026.webp':[1920,1026],'/legacy-media/hdu-south-gate.webp':[1920,1080],
}
function LegacyPhoto({photo,onOpen,className='',priority=false}:{photo:Photo;onOpen:(photo:Photo)=>void;className?:string;priority?:boolean}) {
 const [failed,setFailed]=useState(false)
 const size=photoSizes[photo.src]
 return <figure className={`legacy-photo ${className}`}>
  {failed?<p className="legacy-photo-fallback">{photo.title}暂未加载。正文和来源仍可阅读。</p>:<button type="button" onClick={()=>onOpen(photo)} aria-label={`查看完整影像：${photo.title}`}><img src={siteAssetUrl(photo.src)} alt={photo.title} width={size?.[0]} height={size?.[1]} loading={priority?'eager':'lazy'} onError={()=>setFailed(true)}/><span className="legacy-photo-expand" aria-hidden="true">＋</span></button>}
  <figcaption>{photo.caption} <a href={photo.source} target="_blank" rel="noreferrer">来源</a></figcaption>
 </figure>
}
const square:Photo={src:'/legacy-media/hdu-wending-square.webp',title:'杭州电子科技大学下沙校区问鼎广场',caption:'真实校园影像 · 官网2017年刊载，拍摄日未注明',source:'https://www.hdu.edu.cn/2017/0817/c773a34778/page.htm'}
const portrait:Photo={src:'/legacy-media/jiang-baozeng.jpg',title:'蒋葆增先生历史肖像',caption:'电子科技大学成电新闻网 · 摄影年月、地点未注明',source:'https://news.uestc.edu.cn/info/1003/7275.htm'}
const drone:Photo={src:'/legacy-media/hdu-drone-2026.webp',title:'2026年杭电七十周年无人机表演中的蒋葆增头像与遗训',caption:'2026年10月16日晚 · 下沙校区问鼎广场 · 杭电官网现场图',source:'https://www.hdu.edu.cn/2026/1019/c720a301651/page.htm'}

export default function LegacyPage({active,section}:{active:boolean;section:string}) {
 const root=useRef<HTMLElement>(null),scroll=useRef<HTMLElement>(null),dialog=useRef<HTMLDialogElement>(null),prologue=useRef<HTMLElement>(null)
 const trigger=useRef<HTMLElement|null>(null),lastSection=useRef('')
 const [photo,setPhoto]=useState<Photo|null>(null)
 const [motionPaused,setMotionPaused]=useState(false)
 const target=section==='intro'||legacyChapters.some(item=>item.id===section)?section:'prologue'
 useLegacyIntro(prologue,scroll,active,target==='prologue',motionPaused)
 useLegacyMotion(root,scroll,active)
 useEffect(()=>{
  // 复用既有方向引导；这里只跟踪可视高度，覆盖软键盘仅缩小visual viewport的浏览器。
  if(!active||!window.visualViewport)return
  const viewport=window.visualViewport
  const update=()=>{
   if(viewport.scale!==1)return
   root.current?.style.setProperty('--legacy-view-height',`${viewport.height}px`)
   root.current?.style.setProperty('--legacy-view-top',`${viewport.offsetTop}px`)
  }
  update();viewport.addEventListener('resize',update);viewport.addEventListener('scroll',update)
  return()=>{viewport.removeEventListener('resize',update);viewport.removeEventListener('scroll',update)}
 },[active])
 useEffect(()=>{
  if(!active){setPhoto(null);return}
  if(lastSection.current!==target){
   const scene=scroll.current?.querySelector<HTMLElement>(`#legacy-${target}`)
   if(scene&&scroll.current)scroll.current.scrollTop+=scene.getBoundingClientRect().top-scroll.current.getBoundingClientRect().top
   lastSection.current=target
  }
  const heading=scroll.current?.querySelector<HTMLElement>(`#legacy-${target} h1, #legacy-${target} h2`)
  heading?.focus({preventScroll:true})
 },[active,target])
 useEffect(()=>{if(photo)dialog.current?.showModal();else dialog.current?.close()},[photo])
 const open=(item:Photo)=>{trigger.current=document.activeElement instanceof HTMLElement?document.activeElement:null;setPhoto(item)}
 const close=()=>{setPhoto(null);trigger.current?.focus({preventScroll:true})}
 return <section className="legacy-page" ref={root} aria-label="精神传承" data-active={active} data-legacy-ambient={active&&!motionPaused?'running':'paused'}>
  <a className="skip-link" href="#legacy/answer">跳到我的青春答卷</a>
  <header className="legacy-topbar"><a className="legacy-brand" href="#home">伟大征程<span>第四章 · 精神传承</span></a><nav aria-label="精神传承导航"><a href="#home">首页</a><a href="#map">时空长征</a><a href="#people">英雄人物</a><a href="#legacy" aria-current="page">精神传承</a><FullscreenButton/></nav></header>
  <main className="legacy-scroll" ref={scroll}>
   <section ref={prologue} id="legacy-prologue" className="legacy-prologue legacy-scene" data-legacy-scene="prologue" aria-labelledby="legacy-title" data-motion-slot="prologue">
    <div className="legacy-prologue-art">
     <div className="legacy-prologue-plate">
      <img className="legacy-mountain" width="1672" height="941" src={resources.hero} alt="长征主题山河艺术化场景，非历史照片"/>
      <div className="legacy-campus-reveal"><img className="legacy-campus-opening" width="1920" height="1440" fetchPriority="high" src={siteAssetUrl(square.src)} alt={square.title}/></div>
     </div>
     <div className="legacy-prologue-glow" aria-hidden="true"/>
    </div>
    <div className="legacy-prologue-dusk" aria-hidden="true"/>
    <div className="legacy-prologue-content legacy-wrap"><p className="legacy-section-index">精神传承</p><h1 id="legacy-title" tabIndex={-1} aria-label="征途未止">{[...'征途未止'].map(glyph=><span className="legacy-title-glyph" key={glyph} aria-hidden="true">{glyph}</span>)}</h1><p className="legacy-core"><span>从先辈的足迹，到前辈的嘱托，</span><br/><span>再到我们的答卷。</span></p><div className="legacy-anniversaries"><p><span>1936—2026</span>长征胜利九十周年</p><p><span>1956—2026</span>杭电建校七十周年</p></div><a className="legacy-read-link" href="#legacy/intro">沿着精神之路，继续阅读 <span aria-hidden="true">↓</span></a><button type="button" className="legacy-text-link legacy-motion-toggle" aria-pressed={motionPaused} onClick={()=>setMotionPaused(value=>!value)}>{motionPaused?'播放光影':'暂停光影'}</button></div>
    <p className="legacy-opening-credit">山河为艺术示意 · <a href={square.source} target="_blank" rel="noreferrer">问鼎广场照片来源</a></p>
   </section>
   <div id="legacy-intro" className="legacy-introduction legacy-wrap"><h2 tabIndex={-1} aria-label={legacyNarrative.introHeading}><span>一代人</span><span>有一代人的长征</span></h2><div>{legacyNarrative.introParagraphs.map(text=><p key={text}>{text}</p>)}</div></div>
   <nav className="legacy-chapter-nav legacy-wrap" aria-label="本章阅读目录">{legacyChapters.map((item,index)=><a key={item.id} href={`#legacy/${item.id}`}><span>{String(index).padStart(2,'0')}</span>{item.label}</a>)}</nav>
   <section id="legacy-road" className="legacy-spirit-road legacy-scene" data-legacy-scene="road" aria-labelledby="legacy-road-title" data-motion-slot="spirit-road">
    <header className="legacy-wrap legacy-section-heading"><p className="legacy-section-index">第一章</p><h2 id="legacy-road-title" tabIndex={-1}>精神之路</h2><p>{legacyNarrative.roadLead}</p></header>
    <div className="legacy-road-entries legacy-wrap" data-motion-slot="spirit-route"><div className="legacy-road-route" aria-hidden="true"/>{spiritDimensions.map(item=><article key={item.id} className={`legacy-road-entry legacy-road-${item.id}`}>
     <div className="legacy-road-station" data-route-node={item.id}><span className="legacy-road-node" aria-hidden="true"/><h3>{item.word}</h3></div>
     <div className="legacy-road-text"><p className="legacy-road-lead">{item.lead}</p><p>{item.body}</p><div className="legacy-event-links" aria-label={`${item.word}相关历史事件`}><a href={`#map?event=${item.eventId}`}>回到历史 · {item.eventLabel} <span aria-hidden="true">↗</span></a>{'extraEventId' in item&&<a href={`#map?event=${item.extraEventId}`}>{item.extraEventLabel} <span aria-hidden="true">↗</span></a>}</div></div>
     <LegacyPhoto photo={{src:item.image,title:item.caption.split(' · ')[0]!,caption:item.caption,source:'sourceUrl' in item?item.sourceUrl:historicalImages.find(image=>image.id===item.assetId)!.source_url}} onOpen={open}/>
    </article>)}</div>
   </section>
   <section id="legacy-relay" className="legacy-relay legacy-scene" data-legacy-scene="relay" aria-labelledby="legacy-relay-title" data-motion-slot="route-circuit">
    <div className="legacy-wrap"><header className="legacy-relay-heading"><div><p className="legacy-section-index">第二章</p><h2 id="legacy-relay-title" tabIndex={-1}>薪火相传</h2></div><p>{legacyNarrative.relayLead.map(text=><span key={text}>{text}</span>)}</p></header><RouteCircuit/><div className="legacy-era-labels"><p>革命征途</p><p>电子报国</p><p>青年担当</p></div><p className="legacy-small legacy-symbol-note">{legacyNarrative.relayNote}</p>
    <div className="legacy-school-story"><div><h3>{legacyNarrative.schoolHeading}</h3><p>{legacyNarrative.schoolParagraph}</p><LegacyPhoto photo={{src:'/legacy-media/hdu-computer-1980.jpg',title:'1980年杭电DJS-130计算机房',caption:'1980年，学校生活侧面：DJS-130计算机房 · 杭电档案馆',source:'https://dangan.hdu.edu.cn/2025/0619/c13300a280393/page.htm'}} onOpen={open}/></div><ol className="legacy-school-timeline">{schoolMilestones.map(item=><li key={item.year}><span>{item.year}</span><div><h4>{item.title}</h4><p>{item.text}</p></div></li>)}</ol></div></div>
   </section>
   <section id="legacy-entrust" className="legacy-entrust legacy-scene" data-legacy-scene="entrust" aria-labelledby="legacy-entrust-title" data-motion-slot="entrust">
    <div className="legacy-wrap"><p className="legacy-section-index">第三章 · 前辈的嘱托</p><div className="legacy-entrust-composition"><div className="legacy-jiang"><LegacyPhoto photo={portrait} onOpen={open}/><h3>蒋葆增</h3><p>杭州电子工业学院首任院长</p></div><div className="legacy-entrust-words"><h2 id="legacy-entrust-title" tabIndex={-1}>国家大事<br/>千万尽力</h2><p className="legacy-small">蒋葆增先生遗训 · 本站书法字体排印，非本人手迹</p><p>{legacyNarrative.entrustLead}</p></div></div>
    <div className="legacy-jiang-reading">{entrustSections.map(item=><div key={item.title}><h3>{item.title}</h3><p>{item.body}</p></div>)}</div><p className="legacy-entrust-closing">{legacyNarrative.entrustClosing}</p>
    <div className="legacy-drone-scene"><LegacyPhoto photo={drone} onOpen={open}/><div><h3>{legacyNarrative.droneHeading}</h3>{legacyNarrative.droneParagraphs.map(text=><p key={text}>{text}</p>)}</div></div></div>
   </section>
   <section id="legacy-answer" className="legacy-answer legacy-scene" data-legacy-scene="answer" aria-labelledby="legacy-answer-title" data-motion-slot="keepsake"><div className="legacy-wrap"><YouthAnswer/></div></section>
   <section id="legacy-epilogue" className="legacy-epilogue legacy-scene" data-legacy-scene="epilogue" aria-labelledby="legacy-end-title" data-motion-slot="epilogue"><img className="legacy-ending-photo" width="1920" height="1080" src={siteAssetUrl('/legacy-media/hdu-south-gate.webp')} alt="杭州电子科技大学下沙校区学校南大门，真实校园照片" loading="lazy"/><div className="legacy-wrap legacy-ending-copy"><p className="legacy-section-index">尾声</p><h2 id="legacy-end-title" tabIndex={-1}>山河已新<br/>征途未止</h2><p>{legacyNarrative.endingParagraphs.map(text=><span key={text}>{text}</span>)}</p><p className="legacy-ending-entrust">国家大事，千万尽力。</p><a className="legacy-button" href="#home">重温伟大征程</a><p className="legacy-small">下沙校区学校南大门 · <a href="https://www.hdu.edu.cn/2017/0817/c773a34788/page.htm" target="_blank" rel="noreferrer">杭电官网2017年刊载 ↗</a>，拍摄日未注明</p></div></section>
   <footer className="legacy-footer legacy-wrap"><p>杭州电子科技大学 · 学生课程实践作品</p><details><summary>创作与史料说明</summary><p>{legacyNarrative.introNote}</p><p>信念、坚韧、求实、团结、人民，是本站依据2016年纪念讲话组织的五个展示标题；正文为原创解读，非讲话原文。路线与电路图为艺术示意。夹金山照片仅展示雪山环境，会宁照片仅对应会宁，不作草地或将台堡影像。</p><p>徐解秀旧居照片为现代遗址与陈设，不将画面中的被褥认定为1934年原物。遗训为本站字体排印，非蒋葆增本人手迹。本章不代表学校官方发布。</p></details><details><summary>本章史料与影像来源</summary><ol>{legacySources.map(source=><li key={source.id}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a><p>{source.institution} · {source.locator}</p></li>)}</ol><p>照片年代与来源随图注明，图片权利归原权利人所有；独立转载请联系原权利人。</p></details><a className="legacy-text-link" href="#legacy/prologue">回到本章开篇 ↑</a></footer>
  </main>
  <dialog ref={dialog} className="legacy-image-dialog" aria-label="完整影像" onCancel={close}><button className="legacy-secondary" autoFocus onClick={close}>关闭影像 ×</button>{photo&&<><img src={siteAssetUrl(photo.src)} alt={photo.title}/><p>{photo.caption}</p><a href={photo.source} target="_blank" rel="noreferrer">查看图片来源</a></>}</dialog>
 </section>
}
