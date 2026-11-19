import type { HistoricalEvent } from './types'

export const campaignAnchors: Record<string, { date: string; note: string }> = {
  'EVT-053': { date: '1935-06-18', note: '以中央红军主力到懋功日定位；6月12日达维先头会合和21日庆祝大会分别理解。' },
  'EVT-115': { date: '1935-11-19', note: '百丈战役整体范围保留；以19日激战展示。16日占领、21日撤离来自雅安记载，其他资料的19—25日口径待复核。' },
  'EVT-127': { date: '1934-11-19', note: '取进入桐柏山区日定位；22日枣阳佯攻为手枪团另一次行动。' },
  'EVT-130': { date: '1934-11-30', note: '11月底入伏牛山以月末作展示锚点，非下汤精确到达日。' },
  'EVT-135': { date: '1935-02-19', note: '郧西曾多次往返，地图选择本记录提及的2月19日会议，原始日期范围保留。' },
  'EVT-136': { date: '1935-03-10', note: '按华阳东南伏击记载定位；现代华阳聚落只为地域参考。' },
  'EVT-061': { date: '1935-08-31', note: '以8月底展示包座战斗阶段；右路军中红四方面军部队参战。' },
  'EVT-085': { date: '1935-11-30', note: '湘中阶段按11月末展示，晚于桑植出发，实际各部行动日不同。' },
  'EVT-112': { date: '1935-09-10', note: '以9月分兵转向阶段展示南返；阿坝各部日程待核。' },
  'EVT-119': { date: '1936-07-27', note: '合列地点按最后梯队抵达时展示。总部梯队7月17日已到阿坝，红二方面军各部22至27日先后抵达，见青海省委党史研究室记录。' },
  'EVT-095': { date: '1936-03-28', note: '据文化和旅游部盘县会议资料，以红二军团进入盘县日定位；红六军团次日进入。' },
  'EVT-096': { date: '1936-04-25', note: '按原文4月25—28日渡江时段首日展示。' },
  'EVT-100': { date: '1936-07-02', note: '采用甘孜庆祝大会日展示，先头接触、集结和7月5日编成分别记述。' },
  'EVT-103': { date: '1936-09-19', note: '以至19日先后占领成徽两康四县的阶段收束展示，不以17日成县单点战报替代四县，也不表示各县同日到达。9月8日基本命令、11日出动及战役至20日结束分别理解；原始月份范围保留。' },
}

export const eventRefinements: Record<string, Partial<HistoricalEvent>> = {
  'EVT-053': { army_text: '红一、红四方面军主力（与达维先头会师分列）', source_ids: ['SRC-0080'] },
  'EVT-061': { army_ids: ['fourth'], army_text: '右路军中的红四方面军第三十军等参战部队', source_ids: ['SRC-0043'] },
  'EVT-100': { army_text: '红二、红六军团与红四方面军；编成红二方面军另见7月5日', source_ids: ['SRC-0090'] },
  'EVT-103': { source_ids: ['SRC-0049', 'SRC-0085', 'SRC-0101', 'SRC-0103'], relation: '分路向成县、徽县、两当、康县等地域展开，不是一队顺走四县。10月北上时，洛门和磐安只代表部分渡渭方向；左纵队也有部队经磐安，不能将两条图线理解为两纵队各自唯一道路。' },
  'EVT-118': { source_ids: ['SRC-0101', 'SRC-0102'], relation: '红四方面军至1936年4月上旬已进至道孚、炉霍、甘孜等地，先期转移、休整接应与7月红二、红六军团会师分开。图线4月10日仅为上旬末的收束锚点，非精确到达日。' },
  'EVT-115': { army_ids: ['fourth'], army_text: '红四方面军第四、九、三十、三十一军等部', source_ids: ['SRC-0093'] },
  'EVT-125': { relation: '何家冲为1934年11月16日出发地域。11月11日花山寨会议属于转移准备，地图分阶段绘制。', source_ids: ['SRC-0095', 'SRC-0096'] },
}

export const formationEvent: HistoricalEvent = {
  id: 'EVT-157', title: '红二方面军编成', start_date: '1936-07-05', end_date: '1936-07-05',
  date_precision: 'day', date_text: '1936年7月5日', anchor_note: '日期为中革军委编成命令日。',
  place_ids: ['PLC-0100'], army_ids: ['second'], army_text: '红二、红六军团及红三十二军',
  kind: 'march', important: true, batch: 6, verification_status: 'pending', publication_status: 'draft',
  summary: '甘孜会师后，中革军委命令红二、红六军团和红三十二军合编为红二方面军。此前桑植出发、乌蒙回旋和丽江渡江均使用当时的军团番号。',
  background: '', significance: '', relation: '甘孜集结和会师庆祝在先，编成后继续北上。',
  disputes: '', gaps: '编成命令原件与签发地点尚待查证；地图采用甘孜集结地域。',
  image_ids: [], document_ids: [], source_ids: ['SRC-0083', 'SRC-0056'],
}

/** Labels identify the action, its participants or the year of a repeat visit. */
export const campaignLabels: Record<string, string> = {
  'EVT-006': '赣南 · 于都—瑞金集结出发区域',
  'EVT-061': '包座 · 1935年红四方面军部队作战',
  'EVT-063': '甘肃迭部 · 俄界（高吉）｜确址待核',
  'EVT-065': '哈达铺 · 1935年中央红军',
  'EVT-066': '榜罗镇 · 中央红军会议',
  'EVT-072': '吴起镇 · 中央红军抵达',
  'EVT-073': '甘泉 · 陕甘支队与红十五军团',
  'EVT-076': '会宁 · 红一、红四会师',
  'EVT-077': '将台堡 · 红一、红二会师',
  'EVT-098': '乡城 · 红六军团分路',
  'EVT-099': '白玉 · 红二军团分路',
  'EVT-102': '哈达铺 · 1936年红二方面军',
  'EVT-096': '石鼓—巨甸 · 红二、六军团渡江',
  'EVT-112': '阿坝 · 1935年南返',
  'EVT-115': '百丈关 · 红四方面军南下',
  'EVT-119': '阿坝 · 1936年再北上',
  'EVT-121': '包座 · 1936年北上集结',
  'EVT-150': '永坪 · 红二十五军与陕甘红军会师',
}

export const crossingLegends: Record<string, string> = {
  'EVT-023': '一渡 · 土城、元厚　1.29',
  'EVT-028': '二渡 · 太平渡、二郎滩　2.18–21',
  'EVT-033': '三渡 · 茅台　3.16–17',
  'EVT-034': '四渡 · 二郎滩、太平渡　3.21–22',
}
