import type { AdaptiveExhibition, Evidence } from './adaptiveExhibitionModel'

const evidence = (sourceIds: string[], locator: string): Evidence => ({ sourceIds, locator, verification: 'pending', publication: 'draft' })
/** 经授权推广的两个会议；无登记影像或文献原件，不生成替代展品。 */
export const meetingExhibitions: Record<string, AdaptiveExhibition> = {
  'EVT-056': {
    eventId: 'EVT-056', type: 'archival',
    opening: {
      period: '一九三五年七月 · 两军会合之后', title: '芦花会议及组织安排',
      date: '1935年7月 · 组织安排与后续编组', place: '四川 · 芦花地域', armies: '红一、红四方面军相关部队',
      lead: '两支主力会合，怎样形成共同的指挥？芦花的讨论把组织安排放到北上行动面前。这里既有关乎领导分工的调整，也有需要分别辨认日期的后续编组。',
      evidence: evidence(['SRC-0040', 'SRC-0108'], '石仲泉文章第三节（三）芦花段；军事百科1935年7月18日与21日条。原事件仍为月精度，不合并为一次单日会议'),
    },
    modules: [
      { id: 'luhua-context', type: 'narrative', title: '会合之后，协同仍需落实', paragraphs: [
        '两河口会议确定北上方针后，两个方面军还需要在组织和指挥上协调。芦花会议讨论组织问题，相关安排应放在会师后争取统一行动的背景中理解。',
      ], evidence: evidence(['SRC-0040'], '第三节（三）第一项“黑水芦花会议”段；概述背景，不复写回忆录对话') },
      { id: 'luhua-organization', type: 'decision', navLabel: '看组织安排', title: '调整分工，连接两支部队', paragraphs: [
        '现有文献将7月18日的政治局常委会议与张国焘任红军总政治委员、陈昌浩增为中革军委常委、博古任总政治部主任等安排相联系。领导职务的调整，是这一节点的叙事重点。',
        '前敌指挥机构的形成还有后续部署。不能把整个7月的组织变化都压缩为同一天完成的一项决定。',
      ], evidence: evidence(['SRC-0040', 'SRC-0108'], '芦花会议组织安排段；大事记7月18日、21日分别列事。会议全程与文件原件仍待人工审核') },
      { id: 'luhua-sequence', type: 'timeline', navLabel: '辨时间', title: '会议安排与随后部署，分别看待', entries: [
        { date: '6月下旬', title: '先有北上方针', text: '两河口会议确定继续北上，组织协调围绕共同的行动方向展开。', sourceIds: ['SRC-0108'] },
        { date: '7月18日', title: '领导分工调整', text: '大事记列出总政治委员及军委、政治工作方面的组织安排。', sourceIds: ['SRC-0108'] },
        { date: '7月21日', title: '前敌指挥部署', text: '大事记另列以红四方面军总指挥部为前敌总指挥部，徐向前、陈昌浩、叶剑英分别任总指挥、政治委员、参谋长等安排。', sourceIds: ['SRC-0108'] },
      ], evidence: evidence(['SRC-0040', 'SRC-0108'], '军事百科6月26日、7月18日、21日条；综述将芦花多次讨论连叙，此处保留具体安排的时间区别') },
      { id: 'luhua-reading', type: 'analysis', title: '组织协调，并不等于分歧已经消失', paragraphs: [
        '本站解读：共同的战略方向需要能够落实它的指挥关系。阅读这些组织安排，可以观察两军如何尝试协同；同时，职务调整本身不足以证明后续行动已经完全一致。会议、任职与实际部署，需要相互参照。',
      ], evidence: evidence(['SRC-0040', 'SRC-0108'], '基于会议与后续部署的编辑分析；非历史人物发言，待人工审核') },
    ],
  },
  'EVT-057': {
    eventId: 'EVT-057', type: 'archival',
    opening: {
      period: '一九三五年八月 · 北上准备之中', title: '沙窝会议',
      date: '1935年8月上旬 · 文献记为4—6日', place: '四川 · 沙窝地域', armies: '红一、红四方面军相关部队',
      lead: '北上的方向怎样转化为共同的行动？沙窝会议再次讨论两军面前的任务与团结问题。会议后的左右路编组，又把政治上的协同要求带入具体的军事部署。',
      evidence: evidence(['SRC-0040', 'SRC-0042', 'SRC-0108'], '石仲泉文章第三节（三）沙窝段与军事百科8月4日条均记4—6日；原登记“6日起会议过程待核”保留，不改全局锚点'),
    },
    modules: [
      { id: 'shawo-context', type: 'narrative', title: '继续北上，需要怎样的共同意志？', paragraphs: [
        '松潘计划未能按原部署实现后，北上的路径需要调整。沙窝会议在这一背景下重申建立川陕甘根据地的方针，把两方面军的团结与共同任务联系起来。',
      ], evidence: evidence(['SRC-0040', 'SRC-0042'], '沙窝会议段；甘肃会议文章“俄界会议”第一段，转述背景') },
      { id: 'shawo-task', type: 'decision', navLabel: '读会议任务', title: '共同任务，要求共同承担', paragraphs: [
        '现有综述将会议的重点归纳为坚持北上方针、加强党的领导和维护两军团结。会议还涉及恢复红一方面军总部等组织安排。此处依据文献整理其内容，不作为会议原文展示。',
      ], evidence: evidence(['SRC-0040', 'SRC-0108'], '第三节（三）沙窝会议段；军事百科8月4日条。未登记完整会议文件，不制作仿原件或摘录') },
      { id: 'shawo-sequence', type: 'timeline', navLabel: '看协同部署', title: '从会议到混合编组', entries: [
        { date: '8月4—6日', title: '重申方针与任务', text: '现有机构资料记述会议在这几天内召开，重申北上方针，强调两军团结与共同任务。', sourceIds: ['SRC-0040', 'SRC-0108'] },
        { date: '会后部署', title: '编成左右两路', text: '红一、红四方面军混合编成左、右两路军。左右路是行动编组，不能直接等同于两个方面军。', sourceIds: ['SRC-0040', 'SRC-0108'] },
        { date: '后续进程', title: '方向仍需继续协调', text: '毛儿盖会议继续讨论战略行动方向。沙窝会议与后续会议相衔接，并不意味着一次会议已解决全部分歧。', sourceIds: ['SRC-0040', 'SRC-0042'] },
      ], evidence: evidence(['SRC-0040', 'SRC-0042', 'SRC-0108'], '沙窝会后编组、毛儿盖后续段；8月4日条。原月首展示锚点并非精确开会日') },
      { id: 'shawo-reading', type: 'analysis', title: '把“团结”放回行动关系中理解', paragraphs: [
        '本站解读：沙窝会议的叙事重点，是共同任务如何要求部队协同。混合编组使两方面军的部分部队进入同一行动序列，但编组、统一指挥和战略认识仍是不同层面的问题，不宜用一条简单的因果链代替后续过程。',
      ], evidence: evidence(['SRC-0040', 'SRC-0042', 'SRC-0108'], '基于会议任务与会后混合编组的编辑分析，非会议原文，待人工审核') },
    ],
  },
}
