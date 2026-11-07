import { modules } from '../data/exhibition'
import type { ExhibitModuleId } from '../data/exhibition'
import { Arrow } from '../components/Arrow'
import { followRegionLink } from '../utils/navigation'

export function Entrance({ selected, onSelect }: { selected: ExhibitModuleId | null; onSelect: (id: ExhibitModuleId | null) => void }) {
  const selectedModule = modules.find(module => module.id === selected)
  return <section id="entrance" tabIndex={-1} className="entrance" aria-labelledby="entrance-heading">
    <div className="entrance-top"><span className="eyebrow">伟大征程 · 数字展馆</span><span className="entrance-status">展馆筹备中</span></div>
    <div className="entrance-body"><div><p className="entrance-index" aria-hidden="true">序</p><h2 id="entrance-heading">展馆入口</h2><p className="entrance-intro">更多展陈章节，正在筹备。</p></div>
      <div className="entrance-detail"><p>此处为展馆入口占位区域。时空长征、英雄人物与精神传承尚未开放。历史时间轴与重要事件资料将整合进时空长征。</p>
        <div className="chapter-links" aria-label="后续展陈章节">{modules.map(module => <button key={module.id} aria-pressed={selected === module.id} onClick={() => onSelect(module.id)}>{module.label}<span>待开放</span></button>)}</div>
        <p className="chapter-status" role="status">{selectedModule ? `${selectedModule.label}正在筹备，当前仅提供首页体验。` : '请选择章节查看开放状态。'}</p>
      </div></div>
    <div className="entrance-bottom"><p>纪念中国工农红军长征胜利九十周年</p><a href="#home" onClick={(event) => followRegionLink(event, 'home', () => onSelect(null))}>返回序章 <Arrow /></a></div>
  </section>
}
