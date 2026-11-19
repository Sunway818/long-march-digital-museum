import { displayDateText } from './model'

/** 一渡赤水的专题编排；正文继续读取独立草稿，不覆盖原始历史记录。 */
export const chishuiExhibition = {
  eventId: 'EVT-023',
  heroImageId: 'AST-0033',
  routeImageId: 'AST-0017',
  question: '当北渡长江的原定计划受阻，中央红军如何寻找新的出路？',
  opening: '从土城战场，转向赤水西岸',
  placeText: '土城、猿猴场一带',
  armyText: '中央红军',
  narrativeDate: '一九三五年一月',
  backgroundTitle: '原定方向：向长江寻找出路',
  narrativeTitle: '土城之后，渡河向西',
  routeTitle: '在地图上读懂这次转向',
  routeDescription: '这幅纪念馆发布的现代整理示意图，记录的是1935年1月19日至2月7日的行动范围，包含渡河前后的转移。它帮助辨认行动方向，不能当作1935年的原始作战地图或逐日行军记录。',
  analysisTitle: '改变方向，保留行动的可能',
  analysisLabel: '本站解读',
  imageNotes: {
    'AST-0033': { title: '土城一渡赤水渡口', nature: '渡口地域照片', dateNote: '拍摄年代未注明', description: '原网页将此图标注为土城一渡赤水渡口，未注明拍摄时间。本展不将其作为1935年渡河现场实拍展示，也不据黑白外观认定其为现代照片。', credit: '来源：中共中央党史和文献研究院网站', sourcePage: 'https://www.dswxyjy.org.cn/GB/427277/462086/index.html', evidenceLocator: '专题图集“一渡赤水”条，相邻图注及图片直链；2026-11-14再次核对', width: 900, height: 658 },
    'AST-0017': { title: '中央红军一渡赤水河要图', nature: '现代整理示意图', description: '红、蓝线路分别标示图中双方行动；图面日期涵盖渡河前后。', credit: '来源：四渡赤水纪念馆', width: 607, height: 604 },
  } as Record<string, { title: string; nature: string; dateNote?: string; description: string; credit: string; sourcePage?: string; evidenceLocator?: string; width: number; height: number }>,
}

/** All visitors see the same content; review only controls editorial metadata. */
export function archiveDisplayMode(): 'presentation' | 'review' {
  const review = new URLSearchParams(window.location.search).get('review')
  return review === '1' ? 'review' : 'presentation'
}

export const isArchiveReviewMode = () => archiveDisplayMode() === 'review'
export const canPreviewArchive = () => true

/** 只格式化已有日精度日期；区间和模糊日期仍展示原文，不改变时间锚点。 */
export function exhibitionDate(event: { start_date: string | null; date_precision: string; date_text: string }) {
  if (event.date_precision !== 'day' || !event.start_date) return displayDateText(event.date_text)
  const date = new Date(`${event.start_date}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return displayDateText(event.date_text)
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(date)
}
