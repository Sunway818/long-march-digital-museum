import type { HistoryImage } from './types'

/** 人工选择叙事类型；不依据标题推断，也不自动迁移旧展厅。 */
export const exhibitionTypes = ['archival', 'battle', 'route', 'immersive', 'portrait', 'composite'] as const
export type ExhibitionType = typeof exhibitionTypes[number]
export interface Evidence {
  sourceIds: string[]; locator: string
  verification: 'pending' | 'verified' | 'disputed' | 'rejected'
  publication: 'draft' | 'ready'
}
interface ModuleBase { id: string; title: string; evidence: Evidence; navLabel?: string }
export type NarrativeModule = ModuleBase & (
  | { type: 'narrative' | 'analysis' | 'decision'; paragraphs: string[]; layout?: 'reading' | 'statement' }
  | { type: 'archive'; documentId: string; description: string }
  | { type: 'image'; imageIds: string[]; layout?: 'exhibit' | 'gallery' }
  | { type: 'route' | 'battle'; routeIds: string[]; description: string; caption?: string; note?: string }
  | { type: 'timeline'; entries: { date: string; title: string; text: string; sourceIds: string[] }[] }
  | { type: 'people'; entries: { name: string; role: string; imageId?: string }[] }
)
export interface AdaptiveExhibition {
  eventId: string; type: ExhibitionType; combines?: Exclude<ExhibitionType, 'composite'>[]
  opening: { period: string; title: string; date: string; place: string; armies: string; lead: string; evidence: Evidence }
  modules: NarrativeModule[]
}
export function canDisplay(evidence: Evidence, preview: boolean) {
  return evidence.verification !== 'rejected' && (preview || evidence.verification === 'verified' && evidence.publication === 'ready')
}
/** 资源缺失时移除整个模块，不生成空展框；长度不决定内容是否有价值。 */
export function visibleModules(definition: AdaptiveExhibition, preview: boolean, media: HistoryImage[], routeIds: ReadonlySet<string>, documentIds: ReadonlySet<string>) {
  return definition.modules.filter(module => {
    if (!canDisplay(module.evidence, preview)) return false
    switch (module.type) {
      case 'image': return module.imageIds.some(id => media.some(image => image.id === id))
      case 'archive': return documentIds.has(module.documentId) && Boolean(module.description.trim())
      case 'route': case 'battle': return module.routeIds.some(id => routeIds.has(id))
      case 'timeline': return module.entries.length > 0
      case 'people': return module.entries.length > 0
      default: return module.paragraphs.some(p => p.trim())
    }
  })
}
