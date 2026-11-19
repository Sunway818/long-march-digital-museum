# 历史事件自适应展陈：毛儿盖试点交付记录

2026-11-16；基于 `f481923` 的既有未提交工作区继续开发。只迁移 EVT-058。首页、四渡赤水已认可的视觉结构、全局地图坐标/日期、时间轴及路由未改；无新增依赖、生成图片、远程提交或发布。

> 后续同日冲刺任务已明确授权推广EVT-056/057，见[新增会议与核心交互交付记录](DELIVERY_SPRINT_20261116.md)。本文保留原EVT-058试点的范围与当时测试结果，不把新增任务倒写为上一阶段已完成。

## 实际结果与查看方式

长征时空地图右侧检索 `EVT-058`，选择“毛儿盖会议与右路军出发”后点击“深入了解”。本机默认进入干净设计预览；`?review=1#map` 显示证据定位与内部审核记录；`?review=0#map` 及远程域名执行正式发布门槛。

试点由“会议档案 + 行军地图”组成：

1. 舒展开篇：事件编号、时期、类型、书法标题、中文日期/地点/部队和导语，不预留右侧图片位置。
2. 一段战略问题叙事，连接暗红决策展段与浅色文献名称/内容概述；不制作仿原件，不伪造会议照片或历史人物引语。
3. 地域方向图复用现有两条 VIEW 线，可强调不同部队；显示精度、缺失节点及阶段显示锚点限制。只改变本图强调，不改变后台历史日期。
4. 五节点时间关系，明确区分先头部队18日出动、20日会议与下旬分批行军。
5. 一张独立地域照片展品，随后是明确标注的本站解读及折叠来源目录。

返回地图、Escape、图片放大/关闭/焦点恢复、前后事件导航均复用原容器。展内导览聚焦目标章节，采用即时滚动，无新增自动动画或时钟。关闭不会销毁 MapLibre 实例或改写中心、缩放、筛选、日期。

## 系统结构与配置方式

`adaptiveExhibitionModel.ts` 定义六类人工配置和具证据的模块联合类型；`adaptiveExhibitions.ts` 是独立策展数据，当前只有 EVT-058。不是按标题关键词猜测类型。旧 `exhibitionDefinitions`、一渡和四渡专用组件保持原分支。

| 人工 type | 建议配置的叙事模块 | 本轮边界 |
| --- | --- | --- |
| archival | narrative、decision、archive、analysis | 文献与决策优先 |
| battle | battle、timeline、image、analysis | 接受现有路线 ID；没有核验的敌军部署不补画 |
| route | route、timeline、narrative | 地域方向图为核心，可回原地图对照 |
| immersive | image、narrative、analysis | 图像可连续大幅陈列，无图即省略 |
| portrait | people、image、timeline | 有依据的人物角色与关系文字；无肖像也可阅读 |
| composite | 人工 `combines` + 自选有序 modules | 本试点为 `['archival','route']` |

`opening` 是独立结构；正文 `modules` 自由排序。支持 narrative、decision、archive、image、route、battle、timeline、people、analysis；来源目录统一收尾，不另建第二套来源系统。单图采用独立展品排版，多图采用随数量换列的画廊，正文自然伸展而不设固定最低高度。不存在的图片、路线、文献、空文字或空时间列表会移除整个模块，不留下空展框。

每个开篇/模块都有 `evidence: {sourceIds, locator, verification, publication}`。新内容保持 `pending / draft`；只有 `verified + ready` 才能进入正式模式。图片还必须通过原素材自身的发布/核验状态、已保存、有本地路径、未拒绝等检查。模块与素材是两道门槛，不以“可预览”替代许可。原事件、图片、文献登记不被策展草稿覆盖。

本机预览是沿用的开发展示机制，不是后台身份认证。此轮未建设CMS、权限服务或六个正式专题样板；后续每个事件仍须人工策展和审核。

## 核验依据与采用口径

本轮先读现有 events/images/documents/routes、资料计划、来源登记和已有展厅记录，再访问原始机构页面。新增来源独立存入 `adaptive-sources.json`，保留原两条事件来源及全部有效目录入口。

| 事项 | 证据定位 | 处理 |
| --- | --- | --- |
| 两河口方针、松潘计划与转道草地 | 既有 SRC-0042，[《长征时期党中央在甘肃召开的重要会议》](https://www.dswxyjy.org.cn/BIG5/n1/2021/1126/c244516-32292961.html)“俄界会议”首段 | 简洁转述背景，不复制原文 |
| 8月20日会议、毛泽东报告及北上东进方向 | 新增 SRC-0107，[石仲泉文章](https://www.dswxyjy.org.cn/n1/2025/0307/c423726-40433382.html)第三节（三）“8月20日”段；SRC-0109，[天天读8月20日](https://www.dswxyjy.org.cn/BIG5/434461/434469/434623/index.html)重要论述/历史瞬间 | 有交叉支持，作为待人工审核的策展转述；原日期状态不升级 |
| 右路军编组及毛儿盖—班佑、巴西方向 | SRC-0107 同节沙窝会后编组段 | 说明红一与红四相关部队混合编组，不把两方面军等同于一支纵队；沿用该来源的军团称谓 |
| 先头部队8月18日出动 | 新增 SRC-0108，[军事百科1935大事记](https://js.bkzx.cn/events?year=1935)8月15日条中的“18日” | 单列在20日会议之前；该精确日仍待人工交叉审查，不倒改全局路线显示锚点 |
| 8月下旬行军与包座后续战斗 | SRC-0107 下旬行军段；SRC-0108 8月15日、29日条 | 五节点时间线；不说全军20日同时出发，不把后续全部归因于单次会议 |
| 决定的文献题名与内容方向 | 既有 DOC-0016 / SRC-0036；SRC-0109同日条 | 只展示文献线索与原创概述；无原件、无影印件、无伪造摘录 |

本站解读单列，属于基于前述时间差与部署关系的编辑分析，不作为史料原文。来源支持不等于人工审核完成；上述新正文全部仍为草稿。

## 图片、文献与地图使用情况

- **复用1张图片**：AST-0047“毛儿盖地域”，529×705；原事件关联、源页面、直链、素材本体及版权登记不改。标注“地域照片 · 拍摄年代未注明”，不把黑白外观当作1935年实拍证据，也不无依据地断定现代拍摄。独立大图浏览沿用原组件。公开许可未确认，正式模式图片数量为 **0**。
- **复用1项文献线索**：DOC-0016；收录的是题名/日期/来源登记，不是原件或原文全文。无影印件就不预留影印件框。
- **复用2条地域方向**：`VIEW-central-58-62`（毛儿盖—巴西）、`VIEW-fourth-58-61`（毛儿盖—包座）。只进行SVG投影和文字避让，不改坐标，不增加班佑位置、河流、实际道路或敌军部署。
- 原线分别以8月20日、21日作阶段显示锚点，不能当成先头部队8月18日出发的证据。图中及正文明确区分。阅读本图不驱动全局时间状态，回图对照恢复原选择的地域焦点。
- 新增3条机构文献页面登记；新增下载图片 **0**、AI生成素材 **0**、公开授权升级 **0**。

## 新增和修改文件

| 文件 | 职责 |
| --- | --- |
| `src/features/history-map/adaptiveExhibitionModel.ts` | 六类类型、证据与模块结构、空资源及发布门槛纯函数 |
| `src/features/history-map/adaptiveExhibitions.ts` | 唯一试点的人工配置、历史正文、证据定位、图片/文献/线路ID |
| `src/features/history-map/AdaptiveExhibition.tsx` | 模块渲染、独立开篇、章节导览、原史料目录复用 |
| `src/features/history-map/AdaptiveRouteMap.tsx` | 只读派生方向图、部队强调、地名避让与返回对照 |
| `src/styles/adaptive-exhibition.css` | 仅新展厅生效的档案/决策/地图/时间/影像版式 |
| `src/data/history/exhibitions/adaptive-sources.json` | SRC-0107—0109，不覆盖原来源 |
| `src/features/history-map/HistoryArchive.tsx` | 在既有弹层容器接入新分支，保留旧展厅和前后导航 |
| `src/features/history-map/HistoryPanel.tsx` | 可检索试点，预览导语与正式发布区分，隐藏试点内部备注 |
| `src/features/history-map/archiveContent.ts` | 显式配置的图片ID纳入关联与审核筛选 |
| `src/features/history-map/data.ts` | 合并新增来源，不改原始七份JSON |
| `scripts/prepare-exhibit-font.py`、`src/assets/fonts/exhibit-title.woff2`、`exhibit-font-manifest.json` | 在现有OFL字体子集中补齐试点六个缺字，保留全部旧字形；Python Brotli扩展不匹配时用Node内置压缩，不安装软件 |
| `tests/adaptive-exhibition.spec.ts` | 数据、六类配置、真实渲染、正式门槛、浏览器短长文与状态恢复 |
| 本文件、TASK_BOARD及设计/架构/交互/资料文档补记 | 实施进度、证据与后续边界 |

## 构建、测试与证据

环境：Windows，Node 24.21.0 / npm 11.19.0；本机Chrome与Edge，1920×1080、1366×768；测试另切1440×900并启用减少动态效果。基线为 `f481923` 上的已有未提交工作区，未创建提交。

| 检查 | 实际结果 |
| --- | --- |
| `npm run build`（包含 `npm run typecheck`） | 最终通过；保留既有大包体积警告，未在本轮扩大为拆包重构 |
| `node scripts/verify-setup.mjs` | 文件/既有素材检查通过；文档补记后再执行一次，不当作浏览器证据 |
| `npm run test:browser -- tests/adaptive-exhibition.spec.ts tests/history-archive.spec.ts tests/history-exhibitions.spec.ts tests/map-refinement.spec.ts` | **80/80通过**，覆盖当时5项新测试及旧展厅/地图精修；[结果](../output/playwright/adaptive/regression-80-results.json) |
| 收尾：`npm run test:browser -- tests/adaptive-exhibition.spec.ts` | **24/24通过**，最终6项×4项目，补充浏览器真实CSS短/长文夹具与章节焦点；[最终结果](../output/playwright/adaptive/final-24-results.json) |
| 原始资料完整性 | 七份JSON SHA256与上一轮留存值逐项一致；[校验记录](../output/playwright/adaptive/integrity.json) |
| 差异检查 | `git diff --check`通过；原工作区已有多处未提交文件，本轮未重置、暂存或覆盖其成果 |

具体覆盖：0图/1图无空框、20段长文与单段短文自然伸展、六类手动配置的实际渲染、引用ID和线路ID存在、正式模式不请求AST-0047/不显示草稿正文或内部审核、审阅模式保留locator、原生dialog/Escape和图像焦点恢复、前后阅读不改日期、局部强调不改几何、同一地图画布/中心/缩放/日期/筛选保持、左右滚动边界、减少动态效果。四渡64段内容、四渡地图联动与12个旧节点继续通过原回归。

80项回归后只补了新展厅章节焦点、滚动边界及最终夹具测试，随后重新构建并跑完24项试点测试。本轮没有再次跑首页或完整全站测试，不将此报告当作首页、全站性能或史实发布验收。实体触摸屏、读屏软件、200%系统文字缩放尚未实测。新样式按当前[界面规则](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md)复核按钮、焦点、图像尺寸、原生滚动、空内容和动效边界；无新增持续动画。

## 修改后截图

以下均为本机浏览器实际截图；正文/照片处于设计预览，不代表发布许可。`fixture`图仅用于测试排版，含显式测试文字，不是史料展陈。

| 视口与展段 | 截图 |
| --- | --- |
| 1920×1080 开篇 | [开篇](../output/playwright/adaptive/chrome-1920-opening.png) |
| 1440×900 开篇 | [开篇](../output/playwright/adaptive/chrome-1920-1440-opening.png) |
| 1920 地域方向图 | [方向图](../output/playwright/adaptive/chrome-1920-route.png) |
| 1920 时间关系 | [时间线](../output/playwright/adaptive/chrome-1920-chronology.png) |
| 1920 地域影像与图注 | [影像](../output/playwright/adaptive/chrome-1920-image.png) |
| 正式模式（待审正文及图片隐藏） | [正式模式](../output/playwright/adaptive/chrome-1920-public.png) |
| 1366×768 开篇 | [开篇](../output/playwright/adaptive/chrome-1366-opening.png) |
| 真实CSS零图短文/长文夹具 | [短文](../output/playwright/adaptive/chrome-1920-fixture-short.png)、[长文](../output/playwright/adaptive/chrome-1920-fixture-long.png) |

同目录保存Edge同视口结果与其余展段。本轮未留存可比较的旧EVT-058页面截图，不用旧事件或修改后图冒充改造前证据。

## 人工审核与下一步

1. 审查本试点版式及原创转述/本站解读，确认后才考虑其他事件迁移。
2. 交叉审查“18日先头出动”与下旬主力行军的记载对象；核对编制改称时期、各梯队具体日程与人物实际角色，不能把登记日当全军出发日。
3. 获得会议确址、班佑等途经点与精确道路证据后再另立地理修订任务；现有线仍是待核验的地域方向。
4. DOC-0016原件/影印件、完整出版信息、可引用原文及其许可仍缺。AST-0047年代、摄影者、原片和公开使用许可未齐；不因代码完成就升级ready。
5. 无真实会议现场照片或已核验人物肖像可供本事件使用；本轮保留缺项，不伪造素材填版。

没有批量迁移其他事件，没有将新草稿变为正式展陈。
