import { useEffect, useRef, useState } from 'react'
import { images, eventById } from './data'
import type { HistoryImage } from './types'
import { campaignAftermath, campaignBindings, campaignImageIds, chishuiDraft, type CampaignSceneId } from './campaignContent'
import { CampaignRouteMap } from './CampaignRouteMap'
import { ExhibitImage, ExhibitionSources } from './ExhibitionPrimitives'
import { archiveImages } from './archiveContent'

export function campaignMedia(previewMode: boolean) {
  return images.filter(i => campaignImageIds.includes(i.id) && i.saved && i.local_preview_url && !i.rejected && (previewMode || (i.publication_status === 'ready' && i.verification_status === 'verified')))
    .sort((a,b) => campaignImageIds.indexOf(a.id) - campaignImageIds.indexOf(b.id))
}
export function ChishuiCampaign({ media, previewMode, reviewMode, onOpen, onMapEvent }: { media: HistoryImage[]; previewMode: boolean; reviewMode: boolean; onOpen: (image: HistoryImage) => void; onMapEvent?: (id: string) => void }) {
  const root = useRef<HTMLElement>(null)
  const [sceneId, setSceneId] = useState<CampaignSceneId>('prologue')
  const hero = media.find(i => i.id === 'AST-0033')
  const refs = [...new Set([...Object.values(campaignBindings).flatMap(b => b.sourceIds), 'SRC-0106'])]
  const related = ['EVT-023','EVT-028','EVT-033','EVT-034','EVT-035','EVT-042'].map(id => eventById.get(id)!)
  const sourceImages = [...new Map(related.flatMap(e => archiveImages(e)).concat(media).map(i => [i.id, i])).values()]
  const go = (id: CampaignSceneId) => {
    setSceneId(id)
    root.current?.querySelector<HTMLElement>(`[data-campaign-scene="${id}"]`)?.scrollIntoView({ block: 'start' })
    root.current?.querySelector<HTMLElement>(`[data-campaign-scene="${id}"] h3`)?.focus({ preventScroll: true })
  }
  useEffect(() => {
    const element = root.current, scroll = element?.closest('.archive-scroll')
    if (!element || !scroll) return
    const observer = new IntersectionObserver(entries => {
      const current = entries.filter(e => e.isIntersecting).sort((a,b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
      if (current) setSceneId((current.target as HTMLElement).dataset.campaignScene as CampaignSceneId)
    }, { root: scroll, rootMargin: '-15% 0px -65% 0px', threshold: 0 })
    element.querySelectorAll('[data-campaign-scene]').forEach(e => observer.observe(e))
    return () => observer.disconnect()
  }, [previewMode])
  return <article ref={root} className="chishui-campaign" aria-label="四渡赤水完整专题" data-active-scene={sceneId}>
    <section className={`exhibit-opening${hero ? '' : ' exhibit-opening-text'}`} aria-labelledby="archive-title">
      {hero && <ExhibitImage image={hero} opening onOpen={() => onOpen(hero)} />}
      <div className="exhibit-opening-copy"><p className="exhibit-date">{chishuiDraft.period}</p><h2 id="archive-title">{chishuiDraft.title}</h2><p className="exhibit-opening-line">赤水河畔，生死之间</p><p className="exhibit-question">{chishuiDraft.scenes[0]!.paragraphs.at(-1)!.text}</p><p className="exhibit-place">土城 · 太平渡 · 茅台 · 二郎滩<span>中央红军</span></p><a href="#campaign-prologue" onClick={e => { e.preventDefault(); go('prologue') }}>阅读完整征程 <span aria-hidden="true">↓</span></a></div>
    </section>
    {previewMode ? <>
      <nav className="campaign-chapter-nav" aria-label="四渡赤水专题章节">{chishuiDraft.scenes.map(s => <button key={s.id} aria-current={sceneId === s.id ? 'step' : undefined} onClick={() => go(s.id)}>{campaignBindings[s.id].label}</button>)}</nav>
      <div className="campaign-reading-layout">
        <div className="campaign-scenes">{chishuiDraft.scenes.map((scene, index) => {
          const binding = campaignBindings[scene.id]
          return <section id={`campaign-${scene.id}`} key={scene.id} data-campaign-scene={scene.id} className={`campaign-scene campaign-scene-${scene.id}`}>
            <div className="campaign-scene-pair" data-has-images={binding.imageIds.some(id => id !== 'AST-0033' && media.some(image => image.id === id))}>
            <div className="campaign-scene-text"><p className="campaign-scene-meta">{scene.metadata || '回望连续机动'}</p><h3 tabIndex={-1}>{scene.title}</h3>
            {binding.eventId && onMapEvent && <button className="exhibit-map-compare" onClick={() => onMapEvent(binding.eventId!)}>在长征地图中查看{binding.label} <span aria-hidden="true">↗</span></button>}
            <div className="exhibit-prose">{scene.paragraphs.map((p,i) => <p key={i}>{p.emphasis ? <strong>{p.text}</strong> : p.text}</p>)}</div>
            </div><div className="campaign-scene-images">{binding.imageIds.filter(id => id !== 'AST-0033').map(id => { const image = media.find(i => i.id === id); return image && <ExhibitImage key={id} image={image} onOpen={() => onOpen(image)} /> })}</div></div>
            {scene.interpretation.length > 0 && <div className="campaign-analysis"><p>本站解读</p><h4>{scene.analysisTitle}</h4><small>分析判断，非史料原文</small><div className="exhibit-prose">{scene.interpretation.map((p,i) => <p key={i}>{p.emphasis ? <strong>{p.text}</strong> : p.text}</p>)}</div></div>}
            {scene.id === 'fourth' && <section className="campaign-aftermath" aria-label="四渡之后的战略行动"><h4>后续战略行动</h4><p>以下事件不计入四次赤水渡河。</p>{campaignAftermath.map(a => <div key={a.eventId}><p>{a.date}</p><h5>{a.label}</h5>{onMapEvent && <button className="exhibit-map-compare" onClick={() => onMapEvent(a.eventId)}>在长征地图中查看{a.label} <span aria-hidden="true">↗</span></button>}{media.find(i => i.id === a.imageId) && <ExhibitImage image={media.find(i => i.id === a.imageId)!} onOpen={() => onOpen(media.find(i => i.id === a.imageId)!)} />}</div>)}</section>}
            <nav className="campaign-scene-navigation" aria-label={`${binding.label}前后阅读`}>{index > 0 && <button onClick={() => go(chishuiDraft.scenes[index - 1]!.id)}>前一章：{campaignBindings[chishuiDraft.scenes[index - 1]!.id].label}</button>}{index < chishuiDraft.scenes.length - 1 && <button onClick={() => go(chishuiDraft.scenes[index + 1]!.id)}>继续阅读：{campaignBindings[chishuiDraft.scenes[index + 1]!.id].label}</button>}</nav>
          </section>
        })}</div>
        <aside className="campaign-map-column"><CampaignRouteMap sceneId={sceneId} onScene={go} /></aside>
      </div>
    </> : <p className="exhibit-public-note">专题内容正在整理，可查阅下方史料目录中的相关资料。</p>}
    <div className="exhibit-story"><ExhibitionSources events={related} images={sourceImages} sourceIds={refs} reviewMode={reviewMode}><p>三渡按1935年3月16日至17日范围理解；不同资料对计划形成与二渡起始日的表述差异，保留在审阅记录中。</p></ExhibitionSources></div>
  </article>
}
