import { modules } from '../data/exhibition'
import type { ExhibitModuleId } from '../data/exhibition'
import { Arrow } from '../components/Arrow'
import { followRegionLink } from '../utils/navigation'

export function Entrance({ selected, onSelect }: { selected: ExhibitModuleId | null; onSelect: (id: ExhibitModuleId | null) => void }) {
  const selectedModule = modules.find(module => module.id === selected)
  return <section id="entrance" tabIndex={-1} className="entrance" aria-labelledby="entrance-heading">
    <div className="entrance-top"><span className="eyebrow">伟大征程 · 数字展馆</span><span className="entrance-status">杭州电子科技大学 · 学生课程实践作品</span></div>
    <div className="entrance-body"><div><p className="entrance-index" aria-hidden="true">序</p><h2 id="entrance-heading">展馆入口</h2><p className="entrance-intro">循着时间与山河，查阅长征史料。</p></div>
      <div className="entrance-detail"><p>第一次来，可以先从四渡赤水看一段征程，到人物馆读一份档案，再到精神传承写下自己的青春答卷。</p>
        <div className="chapter-links" aria-label="展陈章节">{modules.map(module => <button key={module.id} aria-pressed={selected === module.id} onClick={() => onSelect(module.id)}>{module.label}<span>{module.id === 'journey' ? '进入地图' : module.id === 'people' ? '进入纪念馆' : '进入精神传承'}</span></button>)}</div>
        <p className="chapter-status" role="status">{selectedModule ? `进入${selectedModule.label}，继续阅读征程。` : '请选择章节，继续阅读征程。'}</p>
      </div></div>
    <div className="entrance-bottom"><p>纪念中国工农红军长征胜利九十周年</p><a href="#home" onClick={(event) => followRegionLink(event, 'home', () => onSelect(null))}>返回序章 <Arrow /></a></div>
  </section>
}
