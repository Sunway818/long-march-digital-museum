import { useState } from 'react'
import { siteAssetUrl } from '../../assets/siteAssetUrl'
import type { MemorialPerson } from './types'

/** Original frames are preserved, including inscriptions, watermarks and group portraits. */
export function PortraitImage({ person, priority = false }: { person: MemorialPerson; priority?: boolean }) {
  const [failed, setFailed] = useState(false)
  return failed ? <span className="people-photo-fallback" role="img" aria-label={`${person.name}的历史影像暂未加载`}><span>{person.name}</span><small>历史影像暂未加载<br />仍可阅读人物档案</small></span>
    : <img src={siteAssetUrl(person.portrait.url)} width={person.portrait.width} height={person.portrait.height} alt={`${person.name}：${person.portrait.caption}`} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} decoding="async" onError={() => setFailed(true)} />
}
