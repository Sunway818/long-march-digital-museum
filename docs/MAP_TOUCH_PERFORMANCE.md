# 长征时空地图触控性能

原版诊断：实际渲染为 MapLibre GL JS 6.17 的 WebGL。中国各省、区域边界、河流为三份同源 GeoJSON，进入地图时交给 worker 处理。路线、线段命中区和箭头是独立的 WebGL 图层；历史事件是可聚焦的 HTML 按钮，没有大型 SVG 路径树。地图纸面滤镜与大阴影在现有样式中已关闭；操作期间未观察到地理资源重复请求。现有档案影像加载不在双指手势路径中。

在生产预览中，通过 Chrome DevTools Protocol 采集 Performance trace，并用 React DevTools hook 记录提交次数。844×390、DPR 3、Chrome 157、4 倍 CPU 降速，输入同一组四次向内／向外双指缩放加单指拖动。原版同一缩放帧在 `move` 和 `zoom` 各运行一次节点遍历、历史事件关联与标签避碰；`zoom` 又逐帧重新投影和提交箭头 GeoJSON。当时 17,304 次节点事件属性写入、64 次箭头源提交，React 只有 6 次提交：主要瓶颈是地图监听器的同步工作，React 树重渲染是次要开销。三份地理资源分别约 588.8、267.2、19.8 kB，各请求一次，单份约 18–19ms（本机冷缓存）；初始地图可用约 4.06s，含分包、底图和首帧路线。

实现沿用 [MapLibre MapOptions](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/MapOptions/) 和锁定版本的原生触控：保留双指实际中点与连续比例，缩小起手死区，禁用平面地图不需要的双指倾斜。双指缩放结束时只截断引擎的续缩动画；不重写投影与触摸事件。移动设备加宽松区域边界并缩短单指惯性。地图画布交互区域 `touch-action: none`，其他页面和面板滚动沿用原行为。

手势帧只更新地图相机和可见节点的位置；节点通过独立的同层按钮容器定位，仍支持触摸、键盘、历史事件索引和焦点恢复。手势停稳后合并一次层级、标签避碰与箭头布局；重复箭头数据跳过 worker 提交。路线源仅由历史显示状态更新；镜头移动、播放速度、跟随开关和标签开关不再重建路线。播放中的路线继续按原日期裁切；切换部队或关闭路线时即使手指未松开也立即过滤对应箭头。地理、路线原始数据、人物档案与历史时间轴契约未改动。

源码：`src/features/history-map/MapCanvas.tsx`、`src/styles/map-refinement.css`。证据与测试：`scripts/profile-map-touch.mjs`、`tests/map-touch.spec.ts`、本记录及任务看板。

| 同一触摸序列，冷缓存生产预览 | 优化前 | 最终版 |
| --- | ---: | ---: |
| 相机第一次更新信号（从第一个 touchmove 起） | 143 ms | 26 ms |
| P95 / 最长帧间隔（rAF） | 150 / 317 ms | 100 / 217 ms |
| 超过 34ms 的帧间隔 | 74 | 65 |
| 主线程 ≥50ms 的任务 | 63 | 51 |
| 主线程累计任务时长 | 11.75 s | 6.89 s |
| 节点事件属性变更 | 17,304 | 360 |
| 箭头源提交 / 路线源提交 | 64 / 5 | 4 / 0 |
| React 根提交 | 6 | 1 |
| 初始地图可用（含首帧路线） | 4.06 s | 3.66 s |

资源在最终版仍各请求一次，原字节不变、约 22–23ms/份。初始可用时间是单次本机样本，不能据此判断校园网速度。任务时长是固定手势序列的累计工作时间，操作更快会改变总观察区间；rAF 包含手势间短停顿。4 倍 CPU 降速仍可观测到掉帧，数据不代表真机帧率。React 以 DevTools hook 统计整棵根的提交次数，没有把生产构建未启用的 React Profiler 组件耗时写成测量结果。

原始数据：[基线](../output/playwright/map-touch/before.json)、[最终](../output/playwright/map-touch/after.json)；Chrome Performance 可导入[基线 trace](../output/playwright/map-touch/before-trace.json.gz)和[最终 trace](../output/playwright/map-touch/after-trace.json.gz)。复现：构建对应版本后运行 `node scripts/profile-map-touch.mjs before` 或 `node scripts/profile-map-touch.mjs after`，在 Windows Chrome 中通过本机临时生产预览采样。

手机验证采用 Chrome 和 Edge 的真实浏览器、触摸／移动视口及 CDP 触点注入。主机未发现可用的 ADB 或已连接的 Android 调试设备，未进行 Android 真机测量。真机补测时可在同一局域网手机上打开生产预览的 `/#map`，用桌面 Chrome 的远程调试 Performance 面板录制同样的缩放、拖动与播放流程，并分别记录首次触屏响应和掉帧。

生产构建（含 TypeScript）及工程校验通过。Chrome／Edge [较广回归](../output/playwright/map-touch/regression-96.json) 95/96，地图用例均通过；唯一未通过的是未修改的人物馆动效用例在并发运行中错过相框裁切取样窗口。专门的双指触摸检查在两浏览器均通过：四轮放大／缩小、缩放后单指平移、地理点围绕双指中心的偏差小于 4 CSS 像素，松手后 350ms 的缩放差小于 0.02；点击地图节点可开详情，双指未松时注入部队开关操作立即过滤路线，播放日期继续推进，重置恢复总览，页面无误滚动。两浏览器也覆盖桌面鼠标滚轮与拖拽、右侧索引、时间轴、独立接应路线、四渡专题、布局切换及地图返回状态。

[最终构建串行复测](../output/playwright/map-touch/final-20.json) 20/20，包括先前未通过的人物馆用例、两档导航、桌面滚轮和拖拽、时间轴、黄色跟随、四渡专题、档案焦点和移动端触摸。专门的双指用例为另外 2/2，不与回归数量叠加计作独立覆盖数。
