# 历史数据计划

2026-11-12再次查史料：红四西转线不再延迟至7月庆祝时才显现，按4月上旬末显示；红二成徽两康以9月19日作四县阶段收束锚点，原月份精度保留。洛门／磐安只画代表方向，左纵队亦有部队经磐安，未补绘未核完整支路。源码叠加层修正，原七份JSON不改；新增SRC-0101—0103及证据范围见[复核追加记录](MAP_ROUTE_AUDIT_20261112.md)。

2026-11-12最新：默认改为长征沿线局部视野，首屏9组关键节点、0个常驻地名，放大后分级展开；1936接应线独立开关。运行时157项事件、81项地域定位、75处未定位、38项精选，81段方向组成17条笔画。七项路线复核、来源限制与最终验证见[沿线视野与七项路线复核](MAP_ROUTE_AUDIT_20261112.md)。下文全国全图/六标签及旧计数保留为阶段沿革，以本条为准。

本轮分路、地名精度、番号及会师标记的最新口径见[长征时空地图路线勘误](MAP_ROUTE_CORRECTIONS.md)。下列数字和图例为相应阶段的记录。

2026-11-11实施补充：当前已具156项初查事件/地点，正式审核仍未完成。原七份map JSON及v8保留，route-enrichment.json独立记录新增8项现代地域参考、两条来源及一个阶段显示锚点，运行时共48项可定位、108处缺坐标。四渡赤水重复经过用访问ID区分；线长插值仅为展陈，不生成历史位置。新增字段、证据、源文件及待核验边界见 [MAP_CHISHUI_ENRICHMENT.md](MAP_CHISHUI_ENRICHMENT.md)。下文“尚未采集”是原始规划阶段记录。

版本：0.1；日期：2026-11-06。此文件定义数据契约，不包含已审核的历史节点、坐标或事件实录。

## 真实性与粒度

每个实体使用稳定 ID；展示文本、时间、空间和来源分开维护。`reviewStatus` 使用 `pending`（待核验）、`verified`（已核实）、`disputed`（有争议）、`rejected`（不采用）。来源网页能打开，只能说明可访问，不表示其中每一项结论已经完成核实。

日期和地理位置分别核实：事件日期正确不等于经纬度精确；现代纪念馆位置不等于历史事件发生点。`publicationStatus` 单独采用 `draft`/`ready`；正式发布只允许 `ready` 且通过来源、版权和精度规则的条目。争议事实不能作为唯一确定结论发布。

## 实体与字段规划

| 实体 | 字段 | 说明 |
| --- | --- | --- |
| Army 部队 | id、canonicalName、names[]、predecessorIds、successorIds、routeStart、routeEnd、sourceRefs、reviewStatus | names 包含名称、起止有效时间；番号与编制形成时点分别核实 |
| RouteNode 路线节点 | id、armyId、placeId、sequence、arrival、departure、coordinates、locationPrecision、sourceRefs、reviewStatus | 同地点可多次到达，sequence 不能以 placeId 替代 |
| RouteSegment 路线分段 | id、armyId、fromNodeId、toNodeId、branchId、geometry、start、end、movementType、precision、gapReason、sourceRefs | LineString 坐标依行军顺序；行军/停驻/资料缺口区分 |
| Place 历史地点 | id、historicalName、modernName、namePeriods、coordinates、coordinateSourceRefs、locationPrecision、eventIds | 历史名称和现代地名分别存储；未知位置允许 null |
| Event 历史事件 | id、title、date、displayAnchor、placeIds、armyIds、summary、claims[]、peopleIds、mediaIds、reviewStatus | displayAnchor 是交互锚点，必须说明推定规则 |
| Person 人物 | id、name、aliases、lifeDates、roles[]、contributions[]、eventIds、portraitMediaId、sourceRefs | 任职时期、贡献和人物引语逐条引用 |
| Media 图片/影像 | id、title、type、creator、createdAt、sourceUrl、localPath、caption、alt、rights、credit、reviewStatus | type 区分历史照片、文物、后世绘画、影视剧照、生成示意 |
| Source 来源 | id、title、publisher、author、publishedAt、url、accessedAt、locator、sourceType、reviewStatus | locator 为页码、段落、小标题或档案号 |
| Claim 事实断言 | id、subjectId、field、statement、sourceRefs、reviewer、reviewedAt、reviewStatus、notes | 用于日期、路线、引语等关键结论的字段级核验 |

`sourceRefs` 建议为 `{sourceId, locator, supports, notes}`，可精确指出来源支持哪项结论。审核人仅记录实际参与人，不能预填虚构姓名。

## 日期结构

`HistoricalDate` 建议包含 `start`、`end`（ISO 公历 YYYY-MM-DD，可空）、`precision`（day/month/year/range/unknown）、`originalText`、`sourceRefs`、`reviewStatus`。区间是否含端点统一为包含；纯计算转为 UTC 日序。

只知月份时保留月份精度，不擅自生成某日；区间起点可以作为 UI 锚点，但界面必须仍显示原始区间，并明确锚点用途。未知日期不参与精确播放，保留在带说明的资料列表。不得将不确定性在排序或插值中隐去。

## 空间与路线精度

- 坐标一律记录 CRS 和来源，GeoJSON 使用 WGS84 `[longitude, latitude]`；不能将其他坐标系直接混用。
- `locationPrecision`：exact-site/approximate-site/town/county/unknown；有依据时增加误差范围，不能随意填写米级精度。
- `routePrecision`：surveyed/documented-nodes/schematic/unknown。节点级路线不因绘制平滑曲线而提升为精确路线。
- 每一 segment 有独立证据，缺失资料的区间不默认连成精确轨迹；虚线概略连接必须带说明。
- 保留往返、分路、停驻和重新汇合，不能按经度或纬度自动排序。会师关系必须由事件史料支持。
- 地图底图的许可、范围、来源和处理流程加入素材登记，不以网图截图作为可任意修改的底图。

## 部队覆盖与核验拆分

候选覆盖：中央红军/红一方面军、红二方面军及其相关前身、红四方面军、红二十五军。它们是待调研对象，不代表此时已有完整路线。特别核实名称适用期、不同出发阶段和会师对象、时间、地点，不能以一条统一起讫时间代替。

第 3 天建立每支部队资料矩阵；第 4 天冻结一个最小可信节点集；第 5—7 天逐步扩充各自路线。不足以核实的部队保留明确缺口说明，调整覆盖范围须更新需求，不能静默省略或编造。

## 采集、审核、发布流程

采集候选来源 → 提取可引用事实 → 交叉比较权威资料 → 日期/地名/编制/坐标分别审核 → 记录争议 → 媒体授权检查 → 数据校验 → 标记 ready → 页面和地图对照复核。

关键出发/会师与路线断言尽量取得两份可独立核对的权威资料；转载同一原稿不算独立证据。单一官方档案可记录为强证据并解释。保留修订日志、审核时间、实际审核人和证据定位。

## 数据校验门槛（后续实现）

唯一 ID、关联 ID 存在；日期可解析且到达不晚于离开；节点和分段时序一致；相同时间/多分支具有显式语义；坐标范围合理；所有 ready 事实具备已审核引用；素材许可允许当前用途；精度说明完整；路线和来源不存在悬空引用。

自动测试可使用明显标记为合成的测试夹具，正式数据文件不得使用虚构史料或伪造坐标。当前数据计数：正式历史实体 0、正式路线节点 0，尚未开始采集。

> 2026-11-16 数据补记：策展结构与原始历史数据分离。`AdaptiveExhibition`的opening与每个module附sourceIds、locator、verification、publication；正式模式要求verified+ready，图片另过原素材门槛，缺资源模块整体省略。仅EVT-058为组合试点，原七份JSON哈希不变，未提升任何事实或素材状态。实施、六类配置和证据见[试点交付记录](ADAPTIVE_EXHIBITION_PILOT.md)。

## 2026-11-17 人物档案结构增量

16人档案独立于军队路线JSON。`PersonResearch`记录生卒/籍贯/组织及sourceIds、分期appointments、chapters、关键moments、差异reviewNote；瞬间分存背景/行动/结果/时间/地点/sourceIds，可选mapEventId只引用已存在且可靠对应的地图事件。月精度锚点沿用原规则，不据叙事日期补精确坐标。28新来源与7新原图分别登记，不覆盖原8图采用记录；原件、年代和许可仍待人工，人物正文保持draft。见[第二轮数据及核验记录](PEOPLE_MEMORIAL_ROUND2.md)。

## 2026-11-17 第四章数据边界

新增`src/data/history/legacy/`独立正文、来源、事实与媒体登记；五份真实新增影像与五份复用图分类标注，原件与WebP副本分别哈希。未新增历史事件、日期或地理坐标；八个链接引用现有EVT，保留不同会师和日期精度。三年代为主题性解读，路线/电路SVG为原创象征。新稿draft、核验pending、许可permission-required保留，见[交付及证据](LEGACY_CHAPTER.md)。
