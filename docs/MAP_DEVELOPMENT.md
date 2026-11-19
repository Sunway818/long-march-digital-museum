# 长征时空地图第一版开发说明

2026-11-12最新：默认改为长征沿线局部视野，首屏9组关键节点、0个常驻地名，放大后分级展开；1936接应线独立开关。运行时157项事件、81项地域定位、75处未定位、38项精选，81段方向组成17条笔画。七项路线复核、来源限制与最终验证见[沿线视野与七项路线复核](MAP_ROUTE_AUDIT_20261112.md)。下文全国全图/六标签及旧计数保留为阶段沿革，以本条为准。

2026-11-12更新采用中国整幅排版、暖红边界、六个关键地名及缩放分级标注。规则折线改为浅淡不规则皱痕，详见[中国整幅地图](MAP_CHINA_SHEET.md)。

本轮分路、地名精度、番号及会师标记的最新口径见[长征时空地图路线勘误](MAP_ROUTE_CORRECTIONS.md)。下列数字和图例为相应阶段的记录。

2026-11-11关键节点与渐进路线更新：四渡赤水四次行动、二次遵义访问、湘江等8项地域参考已进入展示层，原七份JSON、v8和原图不变。当前48项地域参考、108处未定位、24项精选，40段方向串为5条笔画；红四方面军缺口保留。拖动即进入时间演进；同一历史RAF以小数日、最多20Hz更新连续前缀的线长，驻留段不插值，不冒充逐日位置。底图增加泛黄、折痕、局部破边、强化国界及独立全国轮廓小图，仍无DEM/hillshade。底部92px、窄侧栏和四军勾选保持。最新来源、字段、文件、复现与实测见 [MAP_CHISHUI_ENRICHMENT.md](MAP_CHISHUI_ENRICHMENT.md)；下文地形/四泳道/全部事件索引仅为第一版沿革，数据与媒体发布边界保持。

日期：2026-11-10。此版本为可交互的资料工作版；内容与历史确址尚待逐项审核。最新实际测试见 [MAP_VALIDATION.md](MAP_VALIDATION.md)，数据范围见 [核验报告](history/MAP_DATA_AUDIT.md)。

## 启动与入口

沿用现有 React + Vite + TypeScript + GSAP，不重建工程。新增地图依赖固定为 MapLibre GL JS 6.17.0。无需 API key。

```powershell
npm ci
npm run dev
```

打开终端显示的地址。首页“开启征程”、导航“时空长征”、展馆入口“进入地图”均进入 `/#map`。旧 `#entrance-journey`、`#entrance-timeline`、`#entrance-moments` 规范化为同一个地图入口。`npm run build` 后可用 `npm run preview` 运行生产预览。

首页组件保持挂载，地图首次进入时懒加载，返回后保留日期、筛选与选中事件，历史播放保持暂停；首页环境动效的手动暂停选择也保留。未调整首页旗帜16px参数、光雾时钟、原始图片、字体和主体构图。

## 模块职责

| 文件/目录 | 职责 |
| --- | --- |
| src/features/history-map/HistoryMapPage.tsx | 页面、共享 reducer、模式与镜头请求、导航 |
| MapCanvas.tsx | MapLibre生命周期、地形、方向示意、真实位置标记、屏幕聚合与标签避让 |
| ParallelTimeline.tsx | 四条并行泳道、共享日期刻度、事件选择、滑块、速度与播放控件 |
| MapControls.tsx | 部队可见性、高亮、历史阶段、图例 |
| HistoryPanel.tsx | 原文日期、经过、精度、差异、图片、文献、来源及非模态资料索引 |
| model.ts / useHistoryClock.ts | 纯状态转换与选择器 / 唯一历史 RAF |
| src/data/history/map/ | 从 v8 只读生成的7个结构化 JSON，使用原有PLC/EVT/AST/DOC/SRC编号 |
| scripts/convert-history-map.py | openpyxl只读转换工作簿、保留差异、显式区域参考和方向依据 |
| scripts/audit-history-map.mjs | 文件哈希、关联引用、日期、坐标及方向数据结构审计 |
| scripts/fetch-map-geography.py | 地理来源获取及可追溯记录，不下载历史照片 |
| scripts/historyMediaPlugin.ts | 仅本机、按AST编号且经过哈希验证的研究图片预览 |
| public/assets/map/ | 合法底图样式与 Natural Earth 本地地理降级资源 |

## 单一历史时间与交互

`currentDay` 是 UTC 整数日序，唯一保存在页面 reducer。四军节点、方向段、当前参考点、时间泳道与资料选择均从该状态派生，不另设地图日期。选择事件一次 action 同时暂停、调时与选择，不靠相互同步的 effect。

历史播放只有一个 RAF，1×每秒7历史日，另有2×和4×。暂停、拖动、pointercancel、后台、离开模块均停止；返回前台不追赶、不自动续播。终点精确钳制并显示“重播”。全部隐藏时停止播放并提供恢复按钮，隐藏当前事件所属部队会关闭详情而不改变日期。

全程总览显示有坐标的地域资料与17段方向示意；时间演进按显示锚点撤销未来节点与方向段。没有精确几何时不做沿直线移动的军队光点，也不推断无记录期间的真实位置。当前高亮代表最近可用记录，不代表已掌握当天确址。

四条泳道按同一日期轴布局；密集事件以可选列表聚合，完整日期在提示与详情中保留。方向键逐日、PageUp/PageDown调整30日、Home/End到边界。事件索引涵盖未定位资料，隐藏部队的条目会明确提示“显示相关部队并定位”。

地图支持滚轮、双击、拖拽、按钮缩放、事件/阶段定位、总览复位。镜头跟随默认关闭，手动操作后取消跟随。相同地域及近距离标记提供列表，缩放后重新分开，不移动历史坐标。详情关闭恢复触发控件或索引搜索焦点，图片和帮助使用原生 dialog，可 Escape 关闭。

## 底图、Worker与降级

- [MapLibre官方Vite接入说明](https://maplibre.org/maplibre-gl-js/docs/)：v6使用分离的ESM Worker，必须通过 `maplibre-gl-worker.mjs?worker&url` 打包后 setWorkerUrl；默认自动探测在本工程会失败，已修复并验证生产构建。
- [OpenFreeMap](https://openfreemap.org/quick_start/) 的 Liberty矢量底图样式，使用 OpenMapTiles / OpenStreetMap 地名、河流和行政区划。调整为米灰、灰绿、灰蓝；远景隐藏现代公路，避免混入历史路线语义。
- 地形采用 [Mapzen Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) Terrarium DEM hillshade，署名 Mapzen / USGS / NOAA 并链接[完整来源说明](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)。只做克制的阴影，不开启复杂3D场景。
- [Natural Earth许可说明](https://www.naturalearthdata.com/about/terms-of-use/)：本地 land/rivers 为公开地理数据；网络底图失败或25秒内未取得矢量瓦片时降级，明确提示无在线地形/完整地名。冷启动联网复核发现14秒过短，已放宽；持续显示加载提示，不能把元数据当成成功。不是假地图或静态背景图。
- [GeoNames CC BY 4.0](https://www.geonames.org/export/)：仅为现代地域参考点。页脚始终保留所用来源署名。

只有实际收到矢量源内容后才标在线成功，不能以样式JSON加载作为底图成功依据。WebGL不支持、Context Lost时显示明确错误，保留资料和时间轴；可重试重建实例。StrictMode卸载清理地图、DOM标记、ResizeObserver、事件监听、计时器、GPU资源；不重复创建历史时钟。reduce取消镜头飞行与节点呼吸，用户仍可主动播放历史。

## 本机影像与发布边界

94条图片元信息全部保留。92张实际原件不改变，剔除已淘汰条目后91条可作本机研究预览。页面根据事件 AST 编号解析媒体，不在组件里手写原文件路径。

`/__research-media/AST-####` 只允许 loopback 请求与已有清单ID；检查真实路径位于 research、文件大小及SHA-256，通过后流式读取。无任意文件路径接口；未授权原件不复制进 public/dist。通过 Vite dev/preview 在本机可查看。单纯把 dist 交给静态托管时这些图片不会加载，页面保留原始来源和明确说明；公开部署前必须取得许可并生成获准展示资源，不能把本机代理当成正式媒体服务。

## 数据复现与验证

需要现有 v8、研究清单及地理来源文件，使用已具备 openpyxl 的 Python 运行；不向系统安装软件。

```powershell
python -B scripts/convert-history-map.py
node scripts/audit-history-map.mjs
node scripts/verify-setup.mjs
npm run typecheck
npm run build
npm run test:browser
```

Python命令应指向本机可用的Python解释器；本轮使用Codex捆绑解释器，未假设系统 python 已配置。转换输出与原始工作簿分开，不改变用户审核结果。联网截图检查可在预览运行后执行 `node scripts/review-history-map.mjs`，或设置 `MAP_PREVIEW_URL` 指向实际地址。

## 当前未完成

116处坐标、全部历史确址、完整精确路线、分路逐日几何、媒体公开展示许可及正式史实ready审核仍未完成。SVG旧架构已按本次用户指令改为MapLibre；底部Parallel四泳道与1/2/4倍速取代旧文档布局/速度建议。人物、精神传承独立章节和单部队进出保存视野的P2模式仍未开发。本版面向桌面；手机、800px地图专用布局和200%缩放的完整可用性尚未验收。
