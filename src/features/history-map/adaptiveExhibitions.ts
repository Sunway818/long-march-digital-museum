import type { AdaptiveExhibition, Evidence } from './adaptiveExhibitionModel'
import { meetingExhibitions } from './meetingExhibitions'

// 独立策展草稿，不覆盖原始 EVT-058、图片、文献或路线的审核状态。
const evidence = (sourceIds: string[], locator: string): Evidence => ({ sourceIds, locator, verification: 'pending', publication: 'draft' })
export const adaptiveExhibitions: Partial<Record<string, AdaptiveExhibition>> = {
  ...meetingExhibitions,
  'EVT-058': {
    eventId: 'EVT-058', type: 'composite', combines: ['archival', 'route'],
    opening: {
      period: '一九三五年 · 雪山草地之间', title: '毛儿盖会议与右路军出发',
      date: '1935年8月20日 · 会议 / 8月中下旬 · 分批行军', place: '四川 · 毛儿盖地域',
      armies: '红一、红四方面军相关部队',
      lead: '从毛儿盖走向草地，既是行军方向的选择，也是战略方针的延续。会议讨论向何处发展，部队则已在分批行动。读懂这一节点，需要把决策的时间与行军的时间放在一起。',
      evidence: evidence(['SRC-0042', 'SRC-0107', 'SRC-0108', 'SRC-0109'], '两河口与松潘背景；第三节（三）；1935年8月15日条中的18日；1935年8月20日条'),
    },
    modules: [
      { id: 'question', type: 'narrative', title: '两军会合之后，向何处去？', paragraphs: [
        '红一、红四方面军在懋功地区会合后，两河口会议确定北上建立川陕甘根据地的方针。原拟通过松潘打开北上通道，计划因敌情和行动变化未能实现，部队转向草地。毛儿盖会议面对的，是原有战略方向如何继续落实的问题。',
      ], evidence: evidence(['SRC-0042'], '“俄界会议”第一段：两河口方针、松潘计划与转道草地') },
      { id: 'decision', type: 'decision', layout: 'statement', title: '继续北上，向东发展', paragraphs: [
        '8月20日，中共中央政治局在毛儿盖召开扩大会议。毛泽东作报告，讨论夏洮战役后的行动方向，主张红军主力向陕甘边界发展，不应以主力西渡黄河、深入青海等地作为当时的行动方针。',
        '会议要求左路军向右路军靠拢，以集中力量实现北上东进的方针。这里讨论的是战略部署，不能据此认定所有部队在同一天、沿同一条道路出发。',
      ], evidence: evidence(['SRC-0107', 'SRC-0109'], '第三节（三）“8月20日”段；天天读同日条。正文为整理转述，不是文献原文') },
      { id: 'document', type: 'archive', title: '把决定放回文献中', documentId: 'DOC-0016',
        description: '《关于目前战略方针之补充决定》承接两河口会议的北上方针，进一步明确以洮河流域为基础、向东发展的行动方向。此处展示文献名称与内容概述；现有登记只有文献线索，未收录原件或影印件。',
        evidence: evidence(['SRC-0036', 'SRC-0109'], 'DOC-0016登记；天天读1935年8月20日条及历史瞬间。无影印件，不制作仿原件或引语') },
      { id: 'march', type: 'route', title: '从毛儿盖，向草地北侧',
        routeIds: ['VIEW-central-58-62', 'VIEW-fourth-58-61'],
        description: '右路军由红一方面军的一、三军团与红四方面军的第四军、第三十军等组成，以毛儿盖为集结地域，向班佑、巴西方向开进。此处沿用史料的军团称谓，不把不同编制时期的番号混作新单位。',
        caption: '虚线复用全局地图的地域参考点和阶段方向，不复原逐日道路。班佑尚无可用节点，本图不补坐标。巴西与包座分别对应后续地域和战斗节点，不表示全部右路军走同一路线。',
        note: '原地图以8月20日、21日作为两条阶段线的显示锚点；它们不是先头部队的出发日，不能替代上文8月18日的行军记载。线路和确址仍待核验。',
        evidence: evidence(['SRC-0107', 'SRC-0108', 'SRC-0043', 'SRC-0086', 'SRC-0100'], '第三节（三）沙窝会后编组段；沿用既有VIEW方向线及其依据，不新增班佑坐标') },
      { id: 'sequence', type: 'timeline', title: '会议与行军，两条交织的时间线', entries: [
        { date: '8月上旬', title: '编组与准备', text: '沙窝会议后，两方面军混合编成左、右两路军，准备继续北上。', sourceIds: ['SRC-0107', 'SRC-0108'] },
        { date: '8月18日', title: '先头部队已出动', text: '军事百科大事记记载，右路军先头部队自毛儿盖向班佑开进。这一时间早于8月20日会议。', sourceIds: ['SRC-0108'] },
        { date: '8月20日', title: '会议明确发展方向', text: '毛儿盖会议讨论战略行动方向，通过补充决定，强调北上东进。', sourceIds: ['SRC-0109'] },
        { date: '8月下旬', title: '分批穿越草地', text: '部队经草地向班佑、巴西地区推进。先头出动、主力行军和各部抵达，不能压缩成一个共同日期。', sourceIds: ['SRC-0107', 'SRC-0108'] },
        { date: '8月29—31日', title: '后续：包座战斗', text: '右路军第三十军和第四军一部参加包座战斗。这是后续战斗节点，另有独立事件记录。', sourceIds: ['SRC-0108'] },
      ], evidence: evidence(['SRC-0107', 'SRC-0108', 'SRC-0109'], '编组、先头18日、会议20日、下旬行军、包座29—31日；不同记载对象不合并成全军同日出发') },
      { id: 'landscape', type: 'image', title: '地域影像：毛儿盖', imageIds: ['AST-0047'], layout: 'exhibit',
        evidence: evidence(['SRC-0036'], '既有AST-0047关联，529×705；原网页相邻图注。拍摄年代及许可未定，不认定为会议现场') },
      { id: 'reading', type: 'analysis', title: '决策不是一声同时出发的号令', paragraphs: [
        '本站解读：将“会议—出发”理解成一次整齐的先后接力，会遮蔽先头部队已经行动的事实。会议是在持续变化的行军与部署中再次明确方向；决定怎样发展，与各部何时离开、何时抵达，是相互关联而又需要分别核对的问题。',
        '因此，本展用文献说明战略选择，用方向图辨认地域关系，再用时间线区分会议与分批行动。两种路线颜色表示部队来源，不表示两条已经复原的实际道路；后续进程也不能仅归因于这一场会议。',
      ], evidence: evidence(['SRC-0107', 'SRC-0108', 'SRC-0109'], '基于上述先头与主力时间差、会议部署的编辑分析，非历史人物引语，待人工审核') },
    ],
  },
}
