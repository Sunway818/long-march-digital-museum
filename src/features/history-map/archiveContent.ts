import { images } from './data'
import type { HistoricalEvent } from './types'
import { chishuiExhibition } from './exhibitionContent'
import { exhibitionDefinitions } from './exhibitionDefinitions'
import { adaptiveExhibitions } from './adaptiveExhibitions'

export interface ArchiveSection { title: string; paragraphs: string[]; sourceIds: string[]; locator: string; interpretation?: boolean }
export interface ArchiveDraft { eventId: string; status: 'draft'; reviewStatus: 'pending'; lead: string; imageIds: string[]; sections: ArchiveSection[] }
/** Editorial drafts are separate from the original, potentially reviewed records. */
const previousArchiveDrafts: Record<string, ArchiveDraft> = {
  'EVT-023': {
    eventId: 'EVT-023', status: 'draft', reviewStatus: 'pending', imageIds: ['AST-0033', 'AST-0017'],
    lead: '渡过赤水，首先是一次改变行进方向的选择。1935年1月29日，中央红军从土城、猿猴场一带西渡，进入川南。一渡赤水由此成为此后反复机动作战的起点。',
    sections: [
      { title: '历史背景', sourceIds: ['SRC-0015', 'SRC-0080'], locator: '纪念馆正文“一渡赤水”节；1935大事记1月19日条', paragraphs: ['遵义会议之后，中央红军继续寻找战略转移的出路。原定行动指向长江：计划在宜宾、泸州之间寻机北渡，向四川发展。1月19日起，部队逐次向赤水、土城地区集中。', '行动并非发生在一张静止的地图上。川军在红军前进方向部署兵力，北渡通道受到阻碍。原定计划能否继续，取决于不断变化的敌情与战场条件。'] },
      { title: '事件经过', sourceIds: ['SRC-0015', 'SRC-0080'], locator: '纪念馆“一渡赤水”及“二渡赤水”前两段；大事记1月19日条', paragraphs: ['1月28日，红军在土城、青杠坡地区与川军激战。战斗未取得预期结果，继续作战面临其他敌军靠拢的压力。中央红军随即调整行动，脱离接触之敌，准备西渡赤水。', '1月29日，部队从土城及猿猴场等地域分路渡河，进入川南，继而向古蔺、叙永方向转移。图上土城标记只代表渡河地域，不能等同于全军经过同一座渡口。', '西渡之后，北渡长江的计划并没有立即实现。长江沿岸防御加强，红军随后转向川滇黔边境，集结扎西，再寻找新的行动机会。一渡与此后的二渡相衔接，却不是同一天的一条直线行程。'] },
      { title: '本站解读', interpretation: true, sourceIds: ['SRC-0015', 'SRC-0080'], locator: '基于上述战场变化与方向调整的编辑分析，不是历史人物原话', paragraphs: ['理解一渡赤水，可以先把目光从“渡河成功”移向“为什么改变方向”。当战场条件不再支持既定行动时，脱离不利战斗、保存继续机动的能力，本身就是一项关键决策。', '一渡并未直接完成整个战略转移，它的意义更适合放在连续行动中理解：部队离开土城战场后，仍需根据新的封锁与追击调整计划。地图上的往返不是无目的的折返，而是观察决策如何回应现实条件的线索。', '这也是本站采用地域示意而非精确行军道路的原因：线条帮助读者辨认方向与先后，不能替代各军团的实际道路、渡口与行军日程。上述为编辑解读初稿，需经人工审核。'] },
    ],
  },
}

export const archiveDrafts: Record<string, ArchiveDraft> = {
  ...previousArchiveDrafts,
  ...Object.fromEntries(Object.entries(exhibitionDefinitions).map(([eventId, definition]) => [eventId, { eventId, status: 'draft', reviewStatus: 'pending', lead: definition.lead, imageIds: definition.imageIds, sections: definition.sections }])),
}

/** Accept explicit event links in either registry; additions never rewrite source JSON. */
export function archiveImages(event: HistoricalEvent) {
  const adaptiveIds = adaptiveExhibitions[event.id]?.modules.flatMap(module => module.type === 'image' ? module.imageIds : module.type === 'people' ? module.entries.flatMap(entry => entry.imageId ? [entry.imageId] : []) : []) ?? []
  const ids = new Set([...event.image_ids, ...(archiveDrafts[event.id]?.imageIds ?? []), ...adaptiveIds])
  return images.filter(image => (ids.has(image.id) || image.event_ids.includes(event.id)) && image.saved && image.local_preview_url && !image.rejected)
}

/** 仅样板使用审核门槛和策展顺序；其他事件维持既有本机研究资料入口。 */
export function exhibitionImages(event: HistoricalEvent, previewMode: boolean) {
  const media = archiveImages(event)
  const definition = exhibitionDefinitions[event.id]
  const adaptive = adaptiveExhibitions[event.id]
  if (adaptive) {
    const ids = adaptive.modules.flatMap(module => module.type === 'image' ? module.imageIds : module.type === 'people' ? module.entries.flatMap(entry => entry.imageId ? [entry.imageId] : []) : [])
    return media.filter(image => ids.includes(image.id) && (previewMode || image.publication_status === 'ready' && image.verification_status === 'verified'))
  }
  if (!definition && event.id !== chishuiExhibition.eventId) return media
  const rank = (id: string) => id === chishuiExhibition.heroImageId ? 0 : id === chishuiExhibition.routeImageId ? 1 : 2
  return media.filter(i => (!definition || definition.imageIds.includes(i.id)) && (previewMode || (i.publication_status === 'ready' && i.verification_status === 'verified')))
    .sort((a, b) => definition ? definition.imageIds.indexOf(a.id) - definition.imageIds.indexOf(b.id) : rank(a.id) - rank(b.id))
}
