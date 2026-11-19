# 历史素材管理初始化审查

审查日期：2026-11-09，Asia/Shanghai。工作目录：E:/长征2；分支 feature/continuous-flag-motion，当前提交 f481923。仅本地审查及管理目录初始化，不下载/生成素材，不开发页面、地图或导入器，不提交 Git。

## 检查前实际状态

已有 `docs/`、`src/assets/`、`src/data/`、`pictures/`、`artifacts/`；`src/data` 只有 exhibition.ts，用于三个待开放章节的入口元信息，没有事件、人物、来源、部队或路线数据。没有发现 GeoJSON、路线节点、地图组件或历史时间 reducer。

`docs/sources.md` 不存在；实际可复用规范是上级 HISTORICAL_SOURCES.md 和 HISTORICAL_DATA_PLAN.md，均保留未改，没有另建同用途 sources.md。前者已有三个候选门户入口和核验方法，后者已有 Army/Place/Event/Media/Source/Claim 等数据契约规划，但不是已实现的 TypeScript 数据结构。

首页已在 f481923 完成16px旗帜正式集成及环境统一控制，不只是“正在进行正式集成”。本次不变动这些实现。

检查前工作区已有修改：AGENTS.md、docs/SETUP_VALIDATION.md、docs/SKILLS.md、docs/TASK_BOARD.md、scripts/verify-setup.mjs；已有未跟踪 artifacts/ 和 docs/FLAG_WEBGL_STAGE2.md。本次保留这些内容，只有任务看板追加本次初始化记录，未勾选既有 DATA-01/02/03。

## 新建清单

用户要求的11个目录此前均不存在，本次创建：

```text
docs/history/
public/assets/history/photos/
public/assets/history/documents/
public/assets/history/maps/
public/assets/history/portraits/
public/assets/history/artifacts/
public/assets/history/modern-sites/
research/originals/
research/contact-sheets/
src/data/history/
src/data/history/routes/
```

同时按层级补建4个父目录 public/、public/assets/、public/assets/history/、research/，共15个新目录。没有移动既有文件。

新文件：docs/history/ 下 README.md、asset-manifest.csv、source-register.csv、event-register.csv、本 AUDIT.md；research/.gitignore；其余10个目标目录各有一个空 .gitkeep，用于保留目录结构，共16个新文件。不是下载的16份历史素材。

research/.gitignore 仅作用于该研究目录：默认忽略 originals 与 contact-sheets 内未审核文件，但保留 .gitkeep。并未改变根 .gitignore、既有 Git 跟踪状态或网站构建配置。此规则不代替授权审核，也不阻止用户以后明确选择跟踪已获准资料。

## 现有可复用资源

| 位置 | 可复用用途与限制 |
| --- | --- |
| pictures/山河壮阔的长征旗帜.png | 用户提供的艺术化场景，可用于现有首页展陈；作者、创作方式及公开使用授权仍待补充，不能登记为真实历史照片或事件证据 |
| artifacts/flag-separation-draft/ | 旗面、蒙版、Clean Plate、固定前景、静态合成及处理记录；可复用技术分层和来源处理链，不是新增独立史料 |
| src/assets/flag/ | 正式集成使用的背景/前景副本、无损局部旗面和哈希 manifest；保留现有位置，不复制到 history/photos |
| src/assets/fonts/、textures/、atmosphere/ | 可复用字体、许可、原创木纹与光雾，属界面资源，不是历史图像证据 |
| docs/HISTORICAL_SOURCES.md | 复用来源优先级、三个候选门户入口、定位和核验规则；尚无 verified 具体史实条目 |
| docs/HISTORICAL_DATA_PLAN.md | 复用实体关系、精度、分部队路线、Claim/sourceRefs 设计；正式历史实体及路线节点仍为0 |

未发现可直接发布的真实历史照片、人物档案、历史文献扫描或已审核路线；因此三张新表保持零记录，未擅自为首页艺术图补作者/年代/许可或分配正式证据。

## 后续接入判断

现有“数据、纯计算、视图分离”和 sourceRefs/Claim/审核状态规划适合承接新登记表；当前代码层面尚无实际地图或历史数据读取链路，不能称为已经可直接导入。后续需独立实现 CSV/JSON 校验与 snake_case→camelCase 映射、正式 TS 契约、稳定实体引用和日期/坐标/部队有效期检查。

routes/ 只预留目录。未来每支部队分别维护有证据的节点/分段/停驻/缺口，不把整图图像、现代场馆位置或展示插值当作准确路线。地图底图的来源、边界、许可和投影仍须核验。本次没有新造节点、坐标或路线。

## 检查与交接

执行模板结构检查：三份 CSV 均为 UTF-8、唯一表头且只有1行（零记录），字段分别28/21/30列，字段说明在 README 中可定位；所需目录及10个占位文件存在。检查研究目录忽略规则与占位文件可跟踪，检查新文档相对链接和未改动业务源码。

工程检查实际通过：node scripts/verify-setup.mjs、npm run typecheck、npm run build、git diff --check。模板列数/零记录检查、新文档链接、研究目录忽略规则、占位文件可跟踪检查也通过；git diff 确认业务 src 与 pictures 没有变化。仅文档/空目录初始化，未重新运行浏览器测试，不据此宣称地图或全站验收通过。

下一步由用户先收集具体来源条目、完整书目/馆藏号/证据位置、允许保存的原图、作者/年代、权利条款或书面授权，再填 SRC 与 AST；EVT 的日期、地名、部队关系及坐标分别据证填写。缺失项保留空白、pending/draft，不能为凑齐表格猜测。详见 README 的逐字段说明与交接步骤。
