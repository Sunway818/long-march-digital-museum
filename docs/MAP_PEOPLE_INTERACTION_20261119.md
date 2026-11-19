# 2026-11-19 地图导航与人物馆交互

本轮沿用现有四章 hash 路由。`App` 隐藏离开的章并保留挂载；地图中心、缩放、日期和图层因此无需通过重建来恢复。人物馆原有的 `introDone` 会跨章保留，导致开场无法重播。这次不改 `App`、历史数据、地图渲染和档案；现有分支已接入 16 位人物（既有回归也断言 16 位），全部保留原有顺序、肖像及桌面和横屏四列。

| 范围 | 修改 |
| --- | --- |
| 地图顶部 | 品牌和地图标题在左；与首页一致的四章链接使用同一组章节标签；当前章为金色细线及 `aria-current`。地图工具作为原生按钮展开图层复选项和使用说明；全屏独立，图标附可访问名称、悬停提示和按下状态。工具支持键盘、触摸、点外关闭与 Escape；说明关闭后焦点回到工具按钮。桌面栏高 50px，横屏仍为 44px，窄视口优先保留导航和控制。 |
| 人物馆开场 | 从章节 `active` 的上升沿开启原约 2.5 秒暗场、环境光、肖像及标题序列。标题动画结束时收尾，2.65 秒作兜底；离开、进入档案、后台或减少动态时结束。使用章内深链阅读档案或关闭档案时不插播肖像墙开场；恢复减少动态偏好不重播当次入场。 |
| 双向渐显 | 以 `.people-scroll` 而非窗口为根；卡片负责观察，照片层在原相框内改变位置和透明度，姓名与原卡片位置稳定。进入实际视口时触发，完全越过上下 22px 缓冲才重新准备，避免边界抖动。以离场方向决定 ±22px，680ms，邻位错开 90ms；沿用项目缓动。无需滚动监听或常驻 RAF。开场、肖像档案转场、后台和减少动态期间不注册观察器；离开时断开观察、取消动效并恢复照片。键盘焦点直接显示照片。 |

实际应用的 Skills：`frontend-design` 用于保留复古展陈配色与梳理章节/工具层级；`cinematic-scroll-storytelling` 用于独立控制入场节奏与随阅读触发的轻量错时；`ui-ux-pro-max` 用于按键和触摸目标、焦点恢复和减少动态，已运行本地 UX 检索；`playwright` 用于真实浏览器截图与流程验证，沿用项目现有测试运行器。本轮参考 MDN 的 Intersection Observer API 观察根和 rootMargin 说明。

修改文件：`src/features/history-map/HistoryMapPage.tsx`、`src/styles/history-map.css`、`src/styles/compact.css`、`src/features/people/PeopleMemorial.tsx`、`src/features/people/usePortraitReveal.ts`（新）、`src/styles/people-memorial.css`；更新原 `tests/history-map.spec.ts`、`tests/home-fullscreen.spec.ts`、`tests/homepage.spec.ts` 中改名或移动的入口定位；新增 `tests/map-people-interaction.spec.ts`。测试覆盖操作后的地图状态、返回/重入、肖像上下方向关键帧、错时、重复滚动后卡片坐标一致及减少动态。未安装依赖。

截图：[前后对照与动效阶段](../output/playwright/map-people/index.html)。修改前用旧生产预览采集，修改后用新生产预览采集，比较 1440×900 与 844×390。

工程校验、严格类型及生产构建通过，原地图大分包警告仍在。[较广回归](../output/playwright/map-people/regression-116.json) Chrome／Edge 116/116，含路线与日期、筛选、缩放、档案、四档横屏及首页导航。目视阶段图发现紧凑横屏照片位移时会压住姓名，收尾将动画限在原相框内；[最终专项复测](../output/playwright/map-people/final-16.json) 16/16、无跳过或不稳定项，正常地图与人物操作未捕获 `console.error` 或 `pageerror`。已对照终态和动效阶段截图。

[短程滚动采样](../output/playwright/map-people/scroll-sample.json)：最终构建、Windows Chrome 无头浏览器，图片解码后分别在 1440×900 和 844×390 平滑往返两轮，每段约 1.2 秒。各段 P95 帧间隔 16.8–16.9ms，最长 17.0ms，未采到超过 34ms 的帧间隔。该结果只描述短程环境；手机为触摸模拟，未测真机或持续帧率。
