# 技术架构建议

2026-11-18第四章局部扩展：`KeepsakePreview`仅随输入与字体就绪重绘，与PNG导出共用`paintKeepsake`，正文、历史来源、媒体登记仍分离。`YouthAnswer`局部状态管理草稿与已确认快照，修订使旧异步结果失效；无新依赖、远程图像合成、后台服务或历史时钟。新沙洲图原字节登记入public/dist，原地图与人物数据不变。见[最终精修](LEGACY_FINAL_POLISH.md)。

2026-11-15地图层级：routePresentation纯计算从原有连续前缀按权重边界拆显示笔画；不修改顶点、日期和来源。MapCanvas对焦点最后绘制，箭头同步权重；新增接应时期标签/说明及实际绘制诊断。reducer仅扩展routeFocus标记，唯一日期/时钟及地图实例保持；无新依赖。见[地图精修](MAP_REFINEMENT_20261115.md)。

2026-11-14展陈兼容扩展：`exhibitions/`独立JSON底稿/来源/图像尺寸，`exhibitionDefinitions`组织分类叙事，`campaignContent`关联稳定事件与原路线段；阅读外壳、影像、来源和大图查看器共用。专题局部sceneId驱动SVG地域方向图，不引入第二历史日期或额外MapLibre实例。背景仍由原reducer、时间轴和地图管理。见[深化记录](HISTORY_EXHIBITION_DEEPENING.md)。

2026-11-12最新：默认改为长征沿线局部视野，首屏9组关键节点、0个常驻地名，放大后分级展开；1936接应线独立开关。运行时157项事件、81项地域定位、75处未定位、38项精选，81段方向组成17条笔画。七项路线复核、来源限制与最终验证见[沿线视野与七项路线复核](MAP_ROUTE_AUDIT_20261112.md)。下文全国全图/六标签及旧计数保留为阶段沿革，以本条为准。

版本：0.5；2026-11-11更新：MapLibre GL JS 6.17.0平面档案图、窄栏和一条总时间轴保持，无DEM/hillshade。route-enrichment.json独立补充8项地域参考、来源与显示锚点，data.ts合并视图，原七份JSON不改。routeDisplay.ts通过visit ID保留重复经过，按单一currentDay裁剪连续笔画的线长；同一历史RAF最多20Hz发布小数日进度，React不逐显示帧高频更新。MapPaper只管静态做旧和独立全国参照图，DataV几何不进入WGS84路线源。最新实现、数据边界与实测见 [MAP_CHISHUI_ENRICHMENT.md](MAP_CHISHUI_ENRICHMENT.md)。下文Day 3、SVG与未安装地图依赖等仅为早期规划，不作为当前实现。

## 技术选择与边界

| 技术 | 建议职责 | 取舍 |
| --- | --- | --- |
| React + Vite + TypeScript | 单页展馆、组件组合、严格类型、开发构建 | 适合 14 天前端实践；初期静态托管，无后台服务 |
| Tailwind CSS | 基于设计令牌的响应式样式 | 初始化时核对官方 Vite 集成；不预写旧版配置 |
| GSAP + ScrollTrigger | 章节叙事、滚动驱动影像 | 显式创建/销毁；历史模拟时间不受 scroll scrub 控制 |
| Framer Motion / Motion for React | 可选的面板和局部 UI 转场 | 官方现有文档采用 Motion for React；后续确认包名，只装一种，不与 GSAP 写同一属性 |
| Lenis | 可选平滑滚动 | 默认原生滚动可用；低性能、触摸和减少动态效果模式可关闭 |
| SVG + GeoJSON | 地图底图、部队线路、地点 | 轻量、可检查、不依赖在线地图服务；投影和合法底图来源需先验证 |

本机 Node.js v24.21.0、npm 11.19.0；工程 engines 要求 Node >=22.12。已固定 React/React DOM 19.3.1、Vite 8.3.6、TypeScript 7.0.2、Tailwind CSS 4.3.5、GSAP 3.15.1，完整依赖见 package.json/package-lock.json。Tailwind 使用官方 Vite 插件；未安装 Lenis、Motion、地图依赖。

## Day 3 实际结构

`src/App.tsx` 组合 Navbar、Hero、Entrance 与 SourceDialog；`src/animations/heroAnimations.ts` 独立管理片头和 ScrollTrigger、减少动态效果与清理；`src/data/exhibition.ts` 只保存后续章节入口元信息，不包含虚构历史数据。入口通过 hash 保留选择，刷新可恢复。`src/styles/hero.css` 管理桌面优先构图与缩窗降级。

背景通过 `src/assets/resources.ts` 直接导入原始 `pictures/山河壮阔的长征旗帜.png`；未修改原文件。字体为本地 OFL 子集，来源、许可和校验和见 `src/assets/fonts/manifest.json`。图片权利待补充，当前仅本地开发。

## 后续完整展馆目录建议（按需创建，不代表已实现）

```text
src/
  app/                 应用入口、导航、全局配置
  features/
    home/ journey-map/ people/ legacy/
  components/          共享按钮、标题、媒体、引用和面板
  data/                armies、nodes、segments、places、events、people、media、sources
  domain/              日期、路线裁剪、数据校验、来源规则等纯函数
  hooks/               播放时钟、媒体查询、可销毁动画
  styles/              设计令牌、全局样式
  types/               跨模块数据契约
public/                合规静态媒体与基础地图
tests/                 核心逻辑单测和联动端到端测试
```

## 组件和单向数据流

四模块导航共用 exhibition.ts 元信息；不安装路由库、不创建 timeline/events 独立页面。事件、图片和时间数据仍保留在独立 data 层，未来由 journey-map 的时间节点、地点与资料卡使用。2026-11-08 首页改用 FlagScene 与局部 WebGL2 旗面；ambientAnimations.ts 通过单个 GSAP ticker 回调累积有效时间，并以该时间手动采样暂停的光雾时间线及旗面 renderer。renderer 无独立 RAF，不能驱动历史日期。Clean Plate/固定前景为普通图像层，GPU 仅上传 636×504 的无损旗面裁片，672×536 透明画布按原图 cover 变换定位。原始完整图始终作为整体回退。生命周期与测试见 FLAG_INTEGRATION.md。

`JourneyExperience` 持有交互状态；`TimeSlider`、`PlaybackControls`、`ArmyFilter`、`JourneyMap`、`PlaceMarker`、`EventList`、`SourceCitation`、`DetailPanel` 通过参数和事件通信。

唯一状态来源建议 `useReducer` + 限定范围 Context，初期不增加状态库。状态包含 `currentDay`、`playback`、`speed`、`visibleArmyIds`、`selectedEventId`、`selectedPlaceId`、`viewMode`、`viewport`。路线显隐、地点出现和进度由纯选择器派生，不存多份相互同步的副本。跨模块“查看地图”派发同一 `SELECT_EVENT`。

数据保存在独立 JSON/TS 数据文件中，视图不得硬编码历史事实。运行时或构建前校验 ID 引用、日期顺序、坐标系、来源状态。开发夹具只能存于 tests/fixtures 并标记合成，禁止进入正式内容构建。

## 地图计算与路线语义

1. 底图来自可追溯公开来源，记录范围、许可、坐标参考系和处理记录；不随意绘制或改动边界。当前未选择具体底图。
2. GeoJSON 按 [RFC 7946](https://datatracker.ietf.org/doc/html/rfc7946)采用 WGS84 经度、纬度顺序。经纬度投影到 SVG viewBox；投影算法可评估引入 `d3-geo`，须在第 4 天确认成本，不先安装。
3. 预处理每支部队的分段折线、时间区间、累计长度和索引。SVG path 可分段裁剪，不能对所有节点平均分配历史时间。
4. 路线在已知时间节点间仅作“展示插值”，不意味着获知每日位置。停驻区间保持不动；资料缺口中断线段或明确显示概略连接，不能凭空补点。
5. 有分支、往返和会师的路线使用独立 segment；军队改编名称按有效时间显示，避免将后来番号提前套用。
6. 时间先归一为 UTC 日序整数，界面用公历日期字符串；禁止本地时区计算造成前一天/后一天偏移。未知精确日的数据保留原始精度和锚点规则。
7. 地点与日期联动以事件为单位，同一地点多个日期需明确选择事件；不能直接把地点 ID 当唯一日期。

## 动画和性能

历史播放使用一个 requestAnimationFrame 时钟，依真实 elapsed time 推进；暂停/拖动/后台/卸载重置基准。数据计算与装饰动画解耦。GSAP 使用限定作用域 context 并 revert，ScrollTrigger、Lenis、监听器、ticker 和 RAF 全部清理；React StrictMode 重挂载不增加第二个时钟。

首屏静态图片优先，非首屏媒体懒加载；地图模块延迟加载；只更新必要路径属性，避免每帧重建 GeoJSON 或整个应用。资源尺寸、压缩和性能目标见 [测试计划](TEST_PLAN.md)。

## 已建立的首页质量门禁

已建立 dev、build、preview、typecheck、test:browser 脚本；Playwright 调用实际安装的 Chrome/Edge。Day 3 类型检查、构建、24 项桌面浏览器检查通过，详见 DAY3_VALIDATION.md。尚未配置 lint、Vitest 和历史计算测试；后续建立相应纯函数时增加有意义的单测，不把首页验收冒充全站测试。

## 官方依据与后续核对

- [Vite 入门](https://vite.dev/guide/)
- [Tailwind 的 Vite 集成](https://tailwindcss.com/docs/installation/using-vite)
- [GSAP context 生命周期](https://gsap.com/docs/v3/GSAP/gsap.context()/)
- [Motion for React](https://motion.dev/docs/react)
- [Lenis 官方仓库](https://github.com/darkroomengineering/lenis)

上述来源于 2026-11-06 查阅；具体安装版本和第三方许可在工程初始化时再次确认。SVG 方案先满足课程展示，不在本阶段扩大为在线 GIS、三维地球或服务端地图系统。

> 2026-11-16 实施补记：在现有MapLibre地图和展厅容器中增加 `adaptiveExhibitionModel` + `adaptiveExhibitions` + `AdaptiveExhibition`。人工指定六类type，自由组合有证据的模块，过滤空资源与未满足发布门槛的内容；仅EVT-058接入。局部SVG只投影既有两条方向线，不新增地图实例、全局日期、路由或依赖。详见[试点结构与测试](ADAPTIVE_EXHIBITION_PILOT.md)。上述早期方案不代表当前全部实现状态。

> 2026-11-16 冲刺补记：经新任务授权，meetingExhibitions新增EVT-056/057配置，module可选navLabel；EVT-058及其渲染样式保持。cameraFollow纯选择器按followArmyId过滤displayDirections，复用buildRouteChains后读取端点；MapCanvas只easeTo中心，未增加日期状态、播放时钟或地理数据。详见[三项交付记录](DELIVERY_SPRINT_20261116.md)。
# 2026-11-16 人物馆增量

用户已明确授权新增英雄人物纪念馆。`App`继续保留首页及地图实例，懒加载`PeopleMemorial`；`#people`/`#people/:id`为肖像墙/独立档案，`#map?event=EVT-…`复用原事件select契约，不新增时间状态或改动路线。纯人物/来源/影像登记位于`src/data/history/people`，组件位于`src/features/people`。无新运行时依赖；实现与真实验证见[人物馆记录](PEOPLE_MEMORIAL.md)。


## 2026-11-17 精神传承实现

App新增LegacyPage惰性分包，与现有地图/人物页保持挂载；六场景使用原生独立滚动及hash深链接，不新增Router或全局时间。YouthAnswer为有限范围React状态，Canvas绘制本地文字和原创线路并导出Blob，不使用远程图片或第三方服务。Blob URL及可视高度监听有生命周期清理；复用FullscreenButton和OrientationGuide，没有第二套设备识别、动画时钟或历史日期。字体/静态影像随dist发布，完整原始研究目录不公开。见[第四章交付](LEGACY_CHAPTER.md)。

## 2026-11-18 轻量动效层

`animations/motion.ts`管理有限WAAPI动画及全局visibility/reduce状态，`motion.css`给出共用令牌；不新增常驻RAF。首页保留原GSAP/单一环境时间/WebGL2；人物馆复用原FLIP，精神传承新增局部GSAP context及原生IO/单帧滚动更新；地图仍只有原历史RAF、原几何裁切和同一个MapLibre实例。App保留访问后的章节挂载，加入不截获交互的遮幕和ChapterBoundary；本地分包可预取、失败有返回入口。数据、照片、字体与独立Canvas最终绘制保持。见[生命周期及文件](MOTION_UNIFICATION.md)。
