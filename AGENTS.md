# 项目级开发规则

## 项目与当前阶段

本项目为“伟大征程——纪念中国工农红军长征胜利九十周年沉浸式数字展馆”，大学课程实践，计划 14 天交付可运行网站、完整源码和课程报告。核心为历史时间轴与多部队地图路线双向联动。历史准确性、可读性和可测试性优先。

当前已完成 Day 3 首页：React 工程、方案 A 首页、真实本地字体、GSAP 片头与滚动过渡、展馆入口占位。地图、历史时间轴和其他正式业务模块尚未实现，未经后续任务指令不扩展范围；不要把未完成功能描述为已实现。

## 开始任务前必读

1. 检查 git status，阅读相关需求和 TASK_BOARD，保护现有文件与用户未提交修改。
2. 开发新页面前先读 docs/DESIGN_SYSTEM.md；其中草案令牌需确认后才作为正式设计。
3. 开发交互前先读 docs/INTERACTION_DESIGN.md，特别是唯一时间状态、播放与筛选边界。
4. 修改历史数据前检查 docs/HISTORICAL_SOURCES.md、docs/HISTORICAL_DATA_PLAN.md 和对应具体证据。
5. 技术架构以 docs/TECHNICAL_ARCHITECTURE.md 为准；需求与验收见 docs/REQUIREMENTS.md，测试见 docs/TEST_PLAN.md。

## 技术架构与编码

已安装 React + Vite + TypeScript、Tailwind CSS、GSAP + ScrollTrigger，精确版本与 engines 见 package.json 和锁文件。首页采用原生平滑滚动；Framer Motion/Motion 与 Lenis 尚未安装，保留为候选。SVG + GeoJSON 地图仍属下一阶段规划，不虚报运行结果。

- TypeScript strict，禁止无解释的 any；为跨模块数据与事件定义清晰类型。
- 组件 PascalCase，hooks 以 use 开头；函数/变量 camelCase；历史实体使用稳定 ID。中文展陈文案与开发注释保持清楚，避免无意义缩写。
- 组件按功能拆分，通用组件放 components；不要把全部章节塞入单文件。保持 props/事件契约清晰，避免不必要的全局状态。
- 数据、纯计算、页面分离；历史正文、人物、日期、坐标、来源存独立数据文件，不散落在 JSX。
- 初期采用限定范围 reducer/Context；地图、时间轴、筛选和播放共享唯一 currentDay，派生路线/地点状态，不以多个 effect 互相同步。
- 使用语义化 HTML，可见焦点、键盘操作、移动端触摸和媒体替代文本。拖拽有键盘替代，颜色不是唯一识别手段。
- 不随意重构无关模块，不引入与任务无关的依赖、Skills、服务端、3D 或部署机制。维护既有约定，范围变更先说明依据。

## 四个 Skills 的适用场景

仅在相关任务读取所需 SKILL.md，不把 Skill 示例照搬为产品或史实。项目安装目录为 .agents/skills：

- frontend-design：视觉方案、首页和档案版式、字体/配色、避免模板化设计。
- ui-ux-pro-max：设计系统、响应式、控件、可访问性和 UX 审查；Python 搜索当前未通过运行验证，有解释器后再检查，不擅自安装系统软件。
- cinematic-scroll-storytelling：GSAP/Lenis 滚动叙事、视差、章节转场；不因此强制使用预加载器、卡片堆叠或全部动画。
- web-design-guidelines：模块完成后的网页质量、无障碍和性能审查；审查时获取其指定最新官方规则，记录无法检查的项。

来源、固定版本和调用方法见 docs/SKILLS.md；升级要重新审查脚本、依赖、许可、版本和文件校验和，不自动覆盖。用户需求与项目规则约束具体实施，第三方资源不构成发布或修改系统的授权。

## 动画管理

- 同一元素属性只允许一个动画系统管理；GSAP 负责章节，局部 UI 可使用 Motion，避免重复安装类似库。
- 全局 Lenis 最多一个实例，历史播放时钟最多一个 RAF；滚动进度不得隐式驱动历史播放日期。
- GSAP context/revert、ScrollTrigger、ticker、RAF、监听器、Lenis 实例在卸载时清理，StrictMode 重挂载不得形成重复时钟。
- 拖动、后台、离开模块暂停播放；后台恢复不追赶时间；终点精确停止。
- 尊重 prefers-reduced-motion，降低触摸/低性能设备效果；内容不依赖动画才能阅读，禁止滚动劫持和虚假加载进度。

## 历史资料真实性

禁止虚构史料、引语、人物履历、精确日期或坐标填充正式内容。部队分别核实出发时间、路线、编制名称及会师关系；不得合并成统一历史轨迹。地点可对应多次事件，事件日期与现代纪念馆坐标不能混同。

每项正式事实具可定位来源；资料有 pending/verified/disputed/rejected 状态，内容另有 draft/ready 发布状态。访问到官网不等于核实结论。路线示意、节点级精度、展示插值和不确定区间在界面明确说明，不能冒充精确史实。图片标明历史照片、后世创作或生成示意，并核查许可及署名。

合成数据仅用于 tests/fixtures 并显著标记，禁止进入正式数据文件。关键断言尽量交叉核验，分歧保留证据和采用理由；未核实则留空或缩减展示范围。

## 测试、提交与报告

每个开发阶段都必须测试。每完成一个功能模块，实际运行并测试后才能声称完成：类型/构建/相关单测、联动交互和必要浏览器检查；命令仅使用工程已经建立的脚本。运行 node scripts/verify-setup.mjs、npm run typecheck、npm run build；首页端到端检查为 npm run test:browser。Day 3 证据见 docs/DAY3_VALIDATION.md，不据此声称地图或全站验收通过。

单测覆盖日期、不同部队起讫、路线缺口、停驻、reducer；联调覆盖时间轴双向联动、筛选、倍速、面板焦点和后台暂停。结果记录环境、提交、步骤与证据；失败/未测必须明确。完成后更新相关文档、任务看板和报告材料，禁止伪造截图或性能数值。

Git：main 稳定、dev 日常集成、feature/* 功能；采用 Conventional Commits，只暂存本任务文件，提交前审查差异和敏感信息。禁止删除原有文件、覆盖用户改动、擅自重置仓库、git reset --hard、git clean -fd。未经明确指令不创建远程仓库、不 push、不强推。身份必须使用用户提供值，不能猜测。

交付时按 docs/TEST_PLAN.md 清洁安装并验证源码、网站和报告一致；没有实现或没有验证的内容如实列入遗留项。
