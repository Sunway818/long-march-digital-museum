import raw from '../../data/history/exhibitions/chishui-draft.json' with { type: 'json' }
export type CampaignSceneId = 'prologue' | 'first' | 'second' | 'third' | 'fourth' | 'epilogue'
export interface CampaignParagraph { text: string; emphasis: boolean }
export interface CampaignScene { id: CampaignSceneId; title: string; metadata: string; paragraphs: CampaignParagraph[]; analysisTitle: string; interpretation: CampaignParagraph[] }
export const chishuiDraft = raw as { title: string; period: string; status: 'draft'; reviewStatus: 'pending'; origin: string; sourceSha256: string; scenes: CampaignScene[] }
export const campaignBindings: Record<CampaignSceneId, { eventId: string | null; label: string; direction: string; placeIds: string[]; routeIds: string[]; imageIds: string[]; sourceIds: string[]; locator: string }> = {
  prologue: { eventId: null, label: '序章', direction: '战场态势与战略困境', placeIds: ['PLC-0020','PLC-0022','PLC-0025'], routeIds: ['VIEW-central-20-22'], imageIds: [], sourceIds: ['SRC-0036','SRC-0104'], locator: '长征专题湘江与遵义段；《四渡赤水出奇兵》战前态势与北渡计划' },
  first: { eventId: 'EVT-023', label: '一渡', direction: '向西渡河', placeIds: ['PLC-0022','PLC-0025'], routeIds: ['VIEW-central-20-22','VIEW-central-22-25'], imageIds: ['AST-0033','AST-0017'], sourceIds: ['SRC-0015','SRC-0080','SRC-0104'], locator: '一渡赤水节；猿猴场（今元厚）及土城分路渡河、随后扎西集中' },
  second: { eventId: 'EVT-028', label: '二渡', direction: '向东渡河', placeIds: ['PLC-0025','PLC-0028','PLC-0029','PLC-0020'], routeIds: ['VIEW-central-25-28','VIEW-central-28-20'], imageIds: ['AST-0018','AST-0034'], sourceIds: ['SRC-0015','SRC-0080','SRC-0104'], locator: '二渡赤水节，18—21日；2月25日晚攻占娄山关、随后反扑与再占遵义分别理解' },
  third: { eventId: 'EVT-033', label: '三渡', direction: '向西渡河', placeIds: ['PLC-0020','PLC-0033'], routeIds: ['VIEW-central-20-33'], imageIds: ['AST-0036'], sourceIds: ['SRC-0015','SRC-0080','SRC-0104','SRC-0105'], locator: '鲁班场战斗、3月16—17日三渡与古蔺方向佯动；计划形成解释仍待审核' },
  fourth: { eventId: 'EVT-034', label: '四渡', direction: '向东渡河', placeIds: ['PLC-0034','PLC-0035','PLC-0036'], routeIds: ['VIEW-central-34-36'], imageIds: ['AST-0037'], sourceIds: ['SRC-0015','SRC-0080','SRC-0104'], locator: '21日晚至22日东渡，31日南渡乌江；四渡后方向段不是精确渡河道路' },
  epilogue: { eventId: null, label: '终章', direction: '回顾四渡与后续机动', placeIds: ['PLC-0022','PLC-0028','PLC-0033','PLC-0034','PLC-0035','PLC-0042'], routeIds: ['VIEW-central-20-22','VIEW-central-22-25','VIEW-central-25-28','VIEW-central-28-20','VIEW-central-20-33','VIEW-central-33-34','VIEW-central-34-36','VIEW-central-36-42'], imageIds: [], sourceIds: ['SRC-0015','SRC-0036','SRC-0104','SRC-0105'], locator: '连续机动及乌江、金沙江后续行动；本站分析，非原始引语' },
}
export const campaignAftermath = [
  { eventId: 'EVT-035', label: '南渡乌江', date: '1935年3月31日', imageId: 'AST-0038' },
  { eventId: 'EVT-042', label: '巧渡金沙江', date: '1935年5月上旬', imageId: 'AST-0039' },
]
export const campaignImageIds = [...new Set([...Object.values(campaignBindings).flatMap(b => b.imageIds), ...campaignAftermath.map(a => a.imageId)])]
export const campaignPlaceCaptions: Record<CampaignSceneId, string> = {
  prologue: '遵义之后，向土城、赤水方向寻找北渡机会',
  first: '土城、猿猴场一带西渡，随后转向川南、扎西',
  second: '扎西东返，经太平渡、二郎滩，回师黔北',
  third: '从遵义方向转向茅台，再入川南',
  fourth: '二郎滩、太平渡东渡，随后向乌江方向南进',
  epilogue: '四渡之后，南渡乌江并向云南、金沙江继续机动',
}
