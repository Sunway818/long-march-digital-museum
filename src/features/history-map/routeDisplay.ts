import { events, placeById, routeWaypoints, routes } from './data'
import { toDay } from './model'
import type { ArmyId, HistoryState, RoutePhase, RouteSegment } from './types'

/** Explicit source-reviewed regional transitions, NEVER an adjacent-row connector.
 * Each vertex has a named geographic reference. The omitted journeys,
 * branches and manoeuvres are not reconstructed. Raw route geometry is not edited.
 */
interface DirectionReference { phase?: RoutePhase; branch?: string; army: ArmyId; from: number; to: number; via?: number[]; sources: string[]; locator: string; start?: string; end?: string; fromVisit?: string; toVisit?: string; hold?: boolean }
export const additionalDirections: DirectionReference[] = [
  { army: 'central', from: 1, to: 4, start: '1934-10-01', end: '1934-10-17', sources: ['SRC-0025'], locator: '于都集结出发段；10月17日渡河起始作为显示锚点，不代表全军同时抵达。' },
  { army: 'central', from: 4, to: 13, start: '1934-10-20', end: '1934-11-27', sources: ['SRC-0025', 'SRC-0036'], locator: '出发及湘江战役段。中间多道封锁线未逐点复原；只是地域方向。' },
  { army: 'central', from: 13, to: 16, start: '1934-12-01', end: '1934-12-12', sources: ['SRC-0036', 'SRC-0033'], locator: '湘江战役结束后、通道会议前；越城岭等中间地点未逐点绘制。' },
  { army: 'central', from: 20, to: 22, start: '1935-01-19', end: '1935-01-29', sources: ['SRC-0080', 'SRC-0015'], locator: '1935大事记：离开遵义，经土城、猿猴场一渡赤水。渡口用土城地域参考。' },
  { army: 'central', from: 22, to: 25, start: '1935-01-29', end: '1935-02-05', sources: ['SRC-0080', 'SRC-0041'], locator: '一渡后向川南、扎西转移；终点沿用EVT-026既有锚点，扎西系列会议差异仍保留。' },
  { army: 'central', from: 25, to: 28, start: '1935-02-09', end: '1935-02-18', sources: ['SRC-0080', 'SRC-0041'], locator: '扎西后东返，2月18—21日从太平渡、二郎滩二渡赤水。起端为系列会议后显示锚点，非逐日行程。' },
  { army: 'central', from: 28, to: 20, via: [29], start: '1935-02-21', end: '1935-02-28', toVisit: 'VISIT-central-zunyi-return', sources: ['SRC-0080', 'SRC-0041'], locator: '二渡后经娄山关地域回师遵义，2月28日重入遵义。仅在整个阶段内展开线长，不另猜娄山关某日的部队位置。此为第二次经过遵义，非1月会议。' },
  { army: 'central', from: 20, to: 33, start: '1935-02-28', end: '1935-03-16', fromVisit: 'VISIT-central-zunyi-return', sources: ['SRC-0080', 'SRC-0015'], locator: '重返遵义后转向茅台，3月16—17日三渡；中间苟坝、鲁班场等未逐点复原。' },
  { army: 'central', from: 33, to: 34, start: '1935-03-17', end: '1935-03-21', sources: ['SRC-0080', 'SRC-0015'], locator: '三渡再次入川后折返，3月21—22日四渡；连接渡河地域，不表示一条直达道路或同一渡口。' },
  { army: 'central', from: 34, to: 36, start: '1935-03-22', end: '1935-04-01', sources: ['SRC-0080', 'SRC-0036'], locator: '四渡后南渡乌江、佯攻贵阳；4月1日沿用EVT-036月度展示锚点，非实际进入贵阳市区。' },
  { army: 'central', from: 36, to: 42, start: '1935-04-01', end: '1935-05-01', sources: ['SRC-0080', 'SRC-0035'], locator: '贵阳方向后转入云南、巧渡金沙江；月度起点只作展示，不代表实际到达或匀速行军。' },
  { army: 'central', from: 42, to: 44, start: '1935-05-09', end: '1935-05-12', sources: ['SRC-0035', 'SRC-0033'], locator: '金沙江主力渡毕后继续向会理，5月12日会理会议；各军团渡江道路不合并。' },
  { army: 'central', from: 44, to: 47, sources: ['SRC-0041'], start: '1935-05-12', end: '1935-05-24', locator: '会理至石棉安顺场地域。' },
  { army: 'central', from: 47, to: 49, sources: ['SRC-0037'], start: '1935-05-25', end: '1935-05-29', locator: '强渡大渡河后沿两岸向泸定桥推进。' },
  { army: 'central', from: 49, to: 53, via: [51], sources: ['SRC-0041', 'SRC-0056'], start: '1935-05-29', end: '1935-06-18', locator: '经夹金山地域至懋功，采用主力会合的近似时间锚点。' },
  { army: 'central', from: 53, to: 58, sources: ['SRC-0042'], locator: '经两河口会议、松潘计划至毛儿盖。' },
  { army: 'central', from: 58, to: 62, sources: ['SRC-0043', 'SRC-0086'], start: '1935-08-20', end: '1935-09-09', locator: '右路军过草地至巴西。包座战斗由红四方面军部队担负，另设战斗点。' },
  { army: 'central', from: 62, to: 63, sources: ['SRC-0086', 'SRC-0042'], start: '1935-09-10', end: '1935-09-12', locator: '中央率部从巴西单独北上，进入甘肃迭部高吉。' },
  { army: 'central', from: 63, to: 64, sources: ['SRC-0046'], start: '1935-09-12', end: '1935-09-16', locator: '俄界后向腊子口进军。' },
  { army: 'central', from: 64, to: 65, sources: ['SRC-0046'], start: '1935-09-17', end: '1935-09-18', locator: '突破腊子口，进至哈达铺。' },
  { army: 'central', from: 72, to: 73, sources: ['SRC-0046'], start: '1935-10-22', end: '1935-11-01', locator: '吴起抵达、甘泉会合两件事。11月初取月初为展陈锚点。' },
  { phase: 'reception', army: 'central', from: 161, to: 77, sources: ['SRC-0085'], start: '1936-09-14', end: '1936-09-14', hold: true, locator: '红一军团特别支队经硝河向南，9月14日占领将台堡，10月另有会师。' },
  { phase: 'reception', army: 'central', from: 162, to: 76, sources: ['SRC-0085'], start: '1936-09-30', end: '1936-10-02', locator: '红十五军团西征部队出郭城驿方向，先头支队10月2日袭占会宁。此接应线独立于1935年长征。' },
  { phase: 'preparation', army: 'twentyfive', from: 124, to: 125, start: '1934-11-11', end: '1934-11-16', sources: ['SRC-0061'], locator: '花山寨会议后转移准备，何家冲才是长征出发点。' },
  { army: 'twentyfive', from: 125, to: 126, start: '1934-11-16', end: '1934-11-17', sources: ['SRC-0061'], locator: '何家冲出发后越过东双河—柳林间铁路地域。' },
  { army: 'twentyfive', from: 126, to: 127, start: '1934-11-17', end: '1934-11-19', sources: ['SRC-0061'], locator: '11月19日进入桐柏山区。' },
  { army: 'twentyfive', from: 127, to: 128, start: '1934-11-23', end: '1934-11-26', sources: ['SRC-0061'], locator: '桐柏调整建根据地计划，经泌阳方向转至独树镇，不把手枪团枣阳佯攻串成全军道路。' },
  { army: 'twentyfive', from: 128, to: 130, start: '1934-11-27', end: '1934-11-30', sources: ['SRC-0061'], locator: '独树镇突围后由下汤等地进入伏牛山区，月末仅为区间展示。' },
  { army: 'twentyfive', from: 130, to: 132, start: '1934-11-30', end: '1934-12-09', sources: ['SRC-0061'], locator: '经卢氏、绕朱阳关入陕至庾家河，中间地名未全部定位。' },
  { army: 'twentyfive', from: 132, to: 134, start: '1934-12-19', end: '1935-01-09', sources: ['SRC-0061'], locator: '庾家河后在鄂陕边回旋，再攻镇安。并非一条直达道路。' },
  { army: 'twentyfive', from: 134, to: 135, start: '1935-01-09', end: '1935-02-19', sources: ['SRC-0061'], locator: '镇安战斗后再次南下郧西，以2月19日会议收束。' },
  { army: 'twentyfive', from: 135, to: 136, start: '1935-02-19', end: '1935-03-10', sources: ['SRC-0061'], locator: '从郧西转入洋县华阳地域。' },
  { army: 'twentyfive', from: 136, to: 137, start: '1935-03-10', end: '1935-04-01', sources: ['SRC-0061'], locator: '华阳根据地后东返，4月初到葛牌。月初仅为显示锚点。' },
  { army: 'twentyfive', from: 137, to: 141, hold: true, start: '1935-04-01', end: '1935-07-15', sources: ['SRC-0061'], locator: '根据地反围剿、往返后到子午镇决定西征。期间不模拟匀速移动。' },
  { army: 'twentyfive', from: 141, to: 142, start: '1935-07-16', end: '1935-07-27', sources: ['SRC-0061'], locator: '16日出发西征，江口25/27日记载差异保留，以范围末端展示。' },
  { army: 'twentyfive', from: 142, to: 143, start: '1935-07-27', end: '1935-07-31', sources: ['SRC-0061'], locator: '会师节：27日到江口休整，31日占领双石铺。' },
  { army: 'twentyfive', from: 143, to: 144, start: '1935-07-31', end: '1935-08-09', sources: ['SRC-0061'], locator: '经两当、麦积山直逼天水，8月9日攻占北关，非占领全城。' },
  { army: 'twentyfive', from: 144, to: 146, start: '1935-08-09', end: '1935-08-21', sources: ['SRC-0061'], locator: '经静宁、兴隆镇方向到泾川四坡战斗地域，中间道路未逐点复原。' },
  { army: 'twentyfive', from: 146, to: 150, start: '1935-08-31', end: '1935-09-15', sources: ['SRC-0061'], locator: '8月21日战后在灵台、崇信回旋，31日渡泾河北上至9月15日永坪；会师与到达日差异保留。' },
  { army: 'second', from: 84, to: 87, via: [85], sources: ['SRC-0052', 'SRC-0053'], start: '1935-11-19', end: '1935-12-28', locator: '桑植出发，经湘中新化地域转向芷江。' },
  { army: 'second', from: 87, to: 89, via: [88], sources: ['SRC-0049'], start: '1936-01-07', end: '1936-02-29', locator: '入黔、经石阡地域至黔大毕。' },
  { army: 'second', from: 89, to: 90, sources: ['SRC-0050'], end: '1936-03-02', locator: '毕节后进入乌蒙回旋阶段，以野马川为地域点。' },
  { army: 'second', from: 90, to: 95, via: [159], sources: ['SRC-0082','SRC-0089'], start: '1936-03-02', end: '1936-03-28', locator: '乌蒙山回旋后转至滇东宣威、贵州盘县。' },
  { army: 'second', from: 95, to: 96, via: [160], sources: ['SRC-0082','SRC-0089'], start: '1936-03-30', end: '1936-04-25', locator: '盘县调整部署后取道滇中，富民代表一段行动，石鼓代表石鼓—巨甸渡江地域。' },
  { army: 'second', from: 96, to: 97, sources: ['SRC-0082'], start: '1936-04-28', end: '1936-05-01', locator: '渡江后至中甸，五月上旬使用月初展示锚点。' },
  { army: 'second', from: 97, to: 100, via: [99], sources: ['SRC-0049','SRC-0056'], start: '1936-05-01', end: '1936-07-02', locator: '红二军团经白玉到甘孜，终点以会师庆祝大会展示。' },
  { army: 'second', from: 97, to: 100, via: [98], branch: 'sixth', fromVisit: 'VISIT-sixth-zhongdian', toVisit: 'VISIT-sixth-ganzi', sources: ['SRC-0049','SRC-0056'], start: '1936-05-01', end: '1936-07-02', locator: '红六军团经乡城、理化方向会合，单列分路，不串经白玉。' },
  { army: 'second', from: 100, to: 119, via: [164], sources: ['SRC-0043','SRC-0090'], start: '1936-07-05', end: '1936-07-27', locator: '红二方面军随左纵队分批经班玛前往阿坝，以总部7月下旬到达为收束。' },
  { army: 'second', from: 119, to: 165, sources: ['SRC-0091','SRC-0043'], start: '1936-07-27', end: '1936-08-12', locator: '阿坝出草地向包座—求吉集结，以8月12日包座出动命令为阶段锚点。' },
  { army: 'second', from: 165, to: 102, via: [171, 172], sources: ['SRC-0091'], start: '1936-08-12', end: '1936-09-06', locator: '包座经俄界、腊子口向哈达铺；红六军8月25日先到，总部9月1日、红二军及红三十二军9月6日到齐。不绕经岷县城，也不把梯队合为逐日道路。' },
  { army: 'second', from: 102, to: 103, sources: ['SRC-0049','SRC-0085','SRC-0092'], start: '1936-09-11', end: '1936-09-19', locator: '9月8日基本命令、11日出动、至19日先后占领成徽两康四县分别理解；17日成县战报不能代表四县完成。战役整体至20日结束的口径另见SRC-0101，不作为各县同日抵达。' },
  { army: 'second', from: 103, to: 166, start: '1936-10-03', end: '1936-10-09', sources: ['SRC-0091','SRC-0099','SRC-0103'], locator: '左纵队部分部队经武山洛门方向渡渭；《甘谷县志》另载左纵队亦分路经磐安，未逐路绘出。9日仅为阶段锚点，非左纵队全军同日同路。' },
  { army: 'second', from: 103, to: 167, branch: 'sixth-north', fromVisit: 'VISIT-sixth-chenghui', toVisit: 'VISIT-sixth-panan', start: '1936-10-03', end: '1936-10-09', sources: ['SRC-0091','SRC-0099','SRC-0103'], locator: '右纵队红六军经礼县到甘谷磐安，9日晚渡渭；左纵队部分部队也经磐安，图线不表示磐安仅属右纵队。' },
  { army: 'second', from: 166, to: 168, start: '1936-10-09', end: '1936-10-13', sources: ['SRC-0091','SRC-0099'], locator: '左纵队渡渭后向通渭地域发展，以命令要求期限作为展示锚点，非全军到达日。' },
  { army: 'second', from: 167, to: 168, branch: 'sixth-north', fromVisit: 'VISIT-sixth-panan', toVisit: 'VISIT-sixth-tongwei', start: '1936-10-09', end: '1936-10-13', sources: ['SRC-0099'], locator: '红六军渡渭后，经武山、甘谷交界于12—13日进入通渭。' },
  { army: 'second', from: 168, to: 77, start: '1936-10-13', end: '1936-10-22', sources: ['SRC-0091','SRC-0094'], locator: '红二方面军总部及红二军等经会宁、静宁地域至将台堡，22日会师。红六军次日兴隆镇会合等行动未合并为同日。' },
  { phase: 'first-north', army: 'fourth', from: 109, to: 111, via: [157], sources: ['SRC-0088'], start: '1935-04-30', end: '1935-05-31', locator: '江油后西进北川、茂县地域，非逐军同路。' },
  { phase: 'first-north', army: 'fourth', from: 111, to: 53, via: [158], sources: ['SRC-0088','SRC-0056'], start: '1935-05-31', end: '1935-06-18', locator: '西进部队经理番、懋功，同中央红军会合。' },
  { phase: 'first-north', army: 'fourth', from: 53, to: 56, via: [54], start: '1935-06-18', end: '1935-07-18', sources: ['SRC-0042','SRC-0056'], locator: '会师及两河口会议后向芦花集中。会议旧址坐标仍为地域参考。' },
  { phase: 'first-north', army: 'fourth', from: 56, to: 112, via: [170], start: '1935-08-15', end: '1935-09-01', sources: ['SRC-0100','SRC-0056'], locator: '左路军从卓克基地域向阿坝推进。原定北上阶段，不与俄界路线连接。' },
  { phase: 'first-north', army: 'fourth', from: 56, to: 58, branch: 'right-1935', fromVisit: 'VISIT-fourth-luhua-right', start: '1935-07-18', end: '1935-08-20', sources: ['SRC-0100','SRC-0043'], locator: '右路军集结毛儿盖，随后过草地。' },
  { phase: 'first-north', army: 'fourth', from: 58, to: 61, start: '1935-08-21', end: '1935-08-31', sources: ['SRC-0100','SRC-0043'], locator: '红四方面军第四、三十军等随右路军越草地并在包座作战。非中央红军单独北上纵队。' },
  { phase: 'south', army: 'fourth', from: 112, to: 114, start: '1935-09-10', end: '1935-10-20', sources: ['SRC-0098','SRC-0084'], locator: '阿坝左路部队南返，绥崇丹懋战役地域以丹巴代表。' },
  { phase: 'south', army: 'fourth', from: 61, to: 53, via: [58], branch: 'right-return', fromVisit: 'VISIT-fourth-baozuo-return', toVisit: 'VISIT-fourth-maogong-return', start: '1935-09-10', end: '1935-10-20', sources: ['SRC-0098','SRC-0043'], locator: '右路中的红四方面军部队也南返，经毛儿盖、懋功方向参与南下，不能接到俄界—腊子口。' },
  { phase: 'south', army: 'fourth', from: 53, to: 115, fromVisit: 'VISIT-fourth-maogong-return', toVisit: 'VISIT-fourth-baizhang-right', start: '1935-10-20', end: '1935-11-19', sources: ['SRC-0093','SRC-0098'], locator: '南下部队经理县、小金等川康地域向百丈作战，图上只保留阶段方向。' },
  { phase: 'south', army: 'fourth', from: 114, to: 115, start: '1935-10-20', end: '1935-11-19', sources: ['SRC-0093'], locator: '南下川康至百丈关；16日占百丈，19日激战，21日撤退。战役其他日期口径保留。' },
  { phase: 'south', army: 'fourth', from: 115, to: 116, hold: true, start: '1935-11-21', end: '1936-01-31', sources: ['SRC-0093','SRC-0084'], locator: '百丈受挫后在天全、芦山、宝兴一带休整，仅在冬季结束时显现地域方向。' },
  { phase: 'west', army: 'fourth', from: 116, to: 117, start: '1936-02-01', end: '1936-03-31', sources: ['SRC-0084'], locator: '1936年2月下旬分纵队西转丹巴、党岭。月份边界仅为展示区间。' },
  { phase: 'west', army: 'fourth', from: 117, to: 100, via: [118], hold: true, start: '1936-03-31', end: '1936-04-10', sources: ['SRC-0101','SRC-0102','SRC-0084'], locator: '1936年2月撤离天芦宝，至4月上旬进至道孚、炉霍、甘孜等地；4月10日仅取上旬末作为示意线收束锚点，非实际到达日。各部不同路，不模拟逐日移动。7月2日是红二、六军团与红四方面军会师庆祝日，不能用来延迟红四西转线。' },
  { phase: 'north', army: 'fourth', from: 100, to: 119, via: [164], fromVisit: 'VISIT-fourth-north-ganzi', sources: ['SRC-0090','SRC-0043'], start: '1936-07-02', end: '1936-07-17', locator: '左纵队甘孜北出经班玛进入阿坝；7月17日为总部梯队的到达记录，各部并非同日行军。' },
  { phase: 'north', army: 'fourth', from: 119, to: 121, sources: ['SRC-0043'], start: '1936-07-17', end: '1936-08-05', locator: '左纵队阿坝以东过草地趋包座，与炉霍出发的中纵队分别表示。' },
  { phase: 'north', army: 'fourth', from: 118, to: 121, via: [163], sources: ['SRC-0043'], start: '1936-07-02', end: '1936-08-05', locator: '1936再北上单列中纵队，自炉霍经壤塘向包座；甘孜另有左纵队。' },
  { phase: 'north', army: 'fourth', from: 114, to: 121, via: [170, 58], branch: 'right-1936', sources: ['SRC-0043'], start: '1936-07-02', end: '1936-08-05', locator: '1936年右纵队从丹巴经卓克基、毛儿盖方向出草地至包座。起讫是7月初至8月初的展示区间，不推定各军到达日。' },
  { phase: 'north', army: 'fourth', from: 121, to: 122, sources: ['SRC-0043','SRC-0055'], start: '1936-08-05', end: '1936-08-31', locator: '出草地后向岷州地域展开岷洮西战役。' },
  { phase: 'north', army: 'fourth', from: 122, to: 76, sources: ['SRC-0055','SRC-0045'], start: '1936-09-01', end: '1936-10-09', locator: '甘南向会宁，与红一方面军会师。' },
]
function expandDirection(row: typeof additionalDirections[number]): RouteSegment {
  const placeId = (n: number) => 'PLC-' + String(n).padStart(4, '0')
  const from = placeId(row.from), to = placeId(row.to)
  const coordinates = [row.from, ...(row.via ?? []), row.to].map(n => {
    const id = placeId(n)
    const place = placeById.get(id) ?? routeWaypoints.get(id)
    if (!place || place.longitude === null || place.latitude === null ||
        !('army_ids' in place ? place.army_ids.includes(row.army) : place.armyIds.includes(row.army))) {
      throw Error('Invalid regional reference: ' + id + ' / ' + row.army)
    }
    return [place.longitude, place.latitude] as [number, number]
  })
  const start = events.find(e => e.place_ids.includes(from)), end = events.find(e => e.place_ids.includes(to))
  return { id: `VIEW-${row.army}-${row.from}-${row.to}${row.branch ? '-' + row.branch : ''}`, army_id: row.army, from_place_id: from, to_place_id: to,
    phase: row.phase, from_visit_id: row.fromVisit, to_visit_id: row.toVisit, reveal_policy: row.hold ? 'hold' : 'interpolate',
    geometry: { type: 'LineString', coordinates },
    geometry_confidence: 'regional-direction-only', display_style: 'dashed', source_ids: row.sources, evidence_locator: row.locator,
    start_date: row.start ?? start?.start_date ?? null, reveal_date: row.end ?? end?.end_date ?? end?.start_date ?? null, verification_status: 'pending',
    note: '地域参考之间的阶段方向；延伸仅是展陈时间插值，非逐日位置或精确行军道路。' }
}
// Superseded workbook shortcuts stay in the source register for audit.
const superseded = new Set(['DIR-twentyfive-125-128', 'DIR-central-49-53', 'DIR-central-63-65', 'DIR-second-84-87',
  'DIR-second-87-89', 'DIR-second-89-95', 'DIR-fourth-109-111', 'DIR-fourth-111-53',
  'DIR-twentyfive-142-143', 'DIR-twentyfive-143-144', 'DIR-twentyfive-144-146'])
const retained = routes.segments.filter(s => !superseded.has(s.id)).map(segment => {
  const coordinates = segment.geometry.coordinates.map((original, i, line) => {
    const id = i === 0 ? segment.from_place_id : i === line.length - 1 ? segment.to_place_id : null
    const place = id ? placeById.get(id) : null
    return place && place.longitude !== null && place.latitude !== null ? [place.longitude, place.latitude] as [number, number] : original
  })
  return { ...segment, phase: segment.army_id === 'fourth' ? 'first-north' as const : 'march' as const, geometry: { ...segment.geometry, coordinates } }
})
export const displayDirections = [...retained, ...additionalDirections.map(expandDirection)]

export interface RouteChain { phase: RoutePhase; armyId: ArmyId; segmentIds: string[]; coordinates: [number, number][]; partialSegmentId?: string }
export const fromVisit = (edge: RouteSegment) => edge.from_visit_id ?? edge.from_place_id
export const toVisit = (edge: RouteSegment) => edge.to_visit_id ?? edge.to_place_id

/** Clip by projected line length, matching the flat Mercator map. This reveals a
 * diagram, NEVER estimates the army's actual location. No curves/road points added.
 */
export function clipDirection(coordinates: [number, number][], fraction: number): [number, number][] {
  if (fraction <= 0 || coordinates.length < 2) return []
  if (fraction >= 1) return coordinates.map(p => [...p])
  const project = ([lng, lat]: [number, number]) => [lng * Math.PI / 180, Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360))]
  const projected = coordinates.map(project)
  const lengths = projected.slice(1).map((point, i) => Math.hypot(point[0]! - projected[i]![0]!, point[1]! - projected[i]![1]!))
  let remaining = lengths.reduce((a, b) => a + b, 0) * fraction
  const result: [number, number][] = [[...coordinates[0]!]]
  for (let i = 0; i < lengths.length; i++) {
    if (remaining >= lengths[i]!) { result.push([...coordinates[i + 1]!]); remaining -= lengths[i]!; continue }
    const t = lengths[i]! ? remaining / lengths[i]! : 0, a = projected[i]!, b = projected[i + 1]!
    const x = a[0]! + (b[0]! - a[0]!) * t, y = a[1]! + (b[1]! - a[1]!) * t
    result.push([x * 180 / Math.PI, (2 * Math.atan(Math.exp(y)) - Math.PI / 2) * 180 / Math.PI]); break
  }
  return result
}
/** Join ONLY endpoint-identical, unbranched edges of the same army. This changes
 * stroke continuity, never evidence, geography, dates or the order of route visits.
 */
export function buildRouteChains(segments: RouteSegment[], state: HistoryState): RouteChain[] {
  const visible = segments.filter(s => state.visibleArmies.includes(s.army_id) && (state.showReception !== false || s.phase !== 'reception'))
  const unvisited = new Set(visible)
  const result: RouteChain[] = []
  while (unvisited.size) {
    let edge = [...unvisited].find(s => ![...unvisited].some(p => p !== s && p.army_id === s.army_id && (p.phase ?? 'march') === (s.phase ?? 'march') && toVisit(p) === fromVisit(s))) ?? [...unvisited][0]!
    const chain: RouteChain = { phase: edge.phase ?? 'march', armyId: edge.army_id, segmentIds: [], coordinates: [...edge.geometry.coordinates] }
    while (true) {
      unvisited.delete(edge); chain.segmentIds.push(edge.id)
      const next = [...unvisited].filter(s => s.army_id === edge.army_id && (s.phase ?? 'march') === (edge.phase ?? 'march') && fromVisit(s) === toVisit(edge))
      if (next.length !== 1) break
      const incoming = visible.filter(s => s.army_id === edge.army_id && (s.phase ?? 'march') === (edge.phase ?? 'march') && toVisit(s) === fromVisit(next[0]!))
      if (incoming.length !== 1) break
      edge = next[0]!; chain.coordinates.push(...edge.geometry.coordinates.slice(1))
    }
    result.push(chain)
  }
  if (state.mode === 'overview') return result
  // Reveal a continuous PREFIX, rather than multiple independent moving fragments.
  // Overlapping/uncertain source intervals preserve order with monotonic display
  // anchors; original event dates and all original route rows remain untouched.
  return result.flatMap(chain => {
    const shown: RouteChain = { phase: chain.phase, armyId: chain.armyId, segmentIds: [], coordinates: [] }
    let previousEnd = -Infinity
    for (const id of chain.segmentIds) {
      const segment = segments.find(s => s.id === id)!
      if (!segment.start_date || !segment.reveal_date) break
      const start = Math.max(previousEnd, toDay(segment.start_date)), end = Math.max(start, toDay(segment.reveal_date))
      previousEnd = end
      const fraction = segment.reveal_policy === 'hold' || start === end ? Number(state.currentDay >= end) : Math.max(0, Math.min(1, (state.currentDay - start) / (end - start)))
      if (fraction <= 0) break
      const clipped = clipDirection(segment.geometry.coordinates, fraction)
      shown.segmentIds.push(id); shown.coordinates.push(...(shown.coordinates.length ? clipped.slice(1) : clipped))
      if (fraction < 1) { shown.partialSegmentId = id; break }
    }
    return shown.coordinates.length > 1 ? [shown] : []
  })
}
