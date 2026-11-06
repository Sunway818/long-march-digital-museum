# 技术架构建议

版本：0.1；状态：待工程初始化验证；本阶段没有安装网站依赖。

## 技术选择与边界

| 技术 | 建议职责 | 取舍 |
| --- | --- | --- |
| React + Vite + TypeScript | 单页展馆、组件组合、严格类型、开发构建 | 适合 14 天前端实践；初期静态托管，无后台服务 |
| Tailwind CSS | 基于设计令牌的响应式样式 | 初始化时核对官方 Vite 集成；不预写旧版配置 |
| GSAP + ScrollTrigger | 章节叙事、滚动驱动影像 | 显式创建/销毁；历史模拟时间不受 scroll scrub 控制 |
| Framer Motion / Motion for React | 可选的面板和局部 UI 转场 | 官方现有文档采用 Motion for React；后续确认包名，只装一种，不与 GSAP 写同一属性 |
| Lenis | 可选平滑滚动 | 默认原生滚动可用；低性能、触摸和减少动态效果模式可关闭 |
| SVG + GeoJSON | 地图底图、部队线路、地点 | 轻量、可检查、不依赖在线地图服务；投影和合法底图来源需先验证 |

本机 Node.js v24.21.0、npm 11.19.0；正式初始化时再次核对 Vite/插件 engines，精确版本写入 package.json 和锁文件。当前不创建空业务脚手架，不承诺未经安装的兼容性。

## 计划目录（尚未创建）

```text
src/
  app/                 应用入口、导航、全局配置
  features/
    home/ timeline/ journey-map/ events/ people/ legacy/
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

## 初始化时的质量门禁（待建立）

选定版本后再配置 dev、build、preview、typecheck、lint、test 脚本；核心纯函数考虑 Vitest，关键流程考虑 Playwright。每个阶段实际运行相应检查并记录结果；当前不可伪称 `npm run build` 通过。

## 官方依据与后续核对

- [Vite 入门](https://vite.dev/guide/)
- [Tailwind 的 Vite 集成](https://tailwindcss.com/docs/installation/using-vite)
- [GSAP context 生命周期](https://gsap.com/docs/v3/GSAP/gsap.context()/)
- [Motion for React](https://motion.dev/docs/react)
- [Lenis 官方仓库](https://github.com/darkroomengineering/lenis)

上述来源于 2026-11-06 查阅；具体安装版本和第三方许可在工程初始化时再次确认。SVG 方案先满足课程展示，不在本阶段扩大为在线 GIS、三维地球或服务端地图系统。
