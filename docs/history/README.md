# 历史素材管理规范

建立日期：2026-11-09。范围：采集、登记、证据定位、版权核对与发布交接。当前仅初始化目录及空表，不代表已取得历史素材、完成事实核实、取得版权或实现数据加载器。

## 复用现有资料体系

来源优先级、候选机构入口及核验原则继续以 [HISTORICAL_SOURCES.md](../HISTORICAL_SOURCES.md) 为准；实体、日期、路线与逐字段证据契约继续以 [HISTORICAL_DATA_PLAN.md](../HISTORICAL_DATA_PLAN.md) 为准，不在此另建一套事实标准。

本次检查未发现 `docs/sources.md`，因此未创建同用途替代文件，也未更名、移动既有文件。若以后引入该文件，先核对用途并保留，不再复制维护同一份来源记录。现有 `SRC-PORTAL-*` 为候选入口编号，不等同正式资料或事件证据；仅找到官网首页时不能标记 verified。

本目录三张 CSV 是供人工填写的结构化登记入口，当前均只有表头、零条资料记录。它们不被首页或构建自动读取；未来经审核导入数据文件，不能将研究草稿直接作为正式展陈数据。

## 目录与文件的关系

| 位置 | 内容与边界 |
| --- | --- |
| `research/originals/` | 在有权保存的前提下，保存未经编辑的原始扫描、照片、馆藏说明和授权凭证；保留原扩展名与 SHA-256，不覆盖原件。默认不纳入 Git |
| `research/contact-sheets/` | 内部选图用联系表，可带 AST 编号；不替代原件、权利证明或展陈素材，默认不纳入 Git |
| `docs/history/source-register.csv` | 具体著作/档案/馆藏条目/文章的书目、证据位置、支持结论、核实情况；复用上级来源规范 |
| `docs/history/asset-manifest.csv` | 一个逻辑图像的原件、网页派生文件、来源、版权、署名、用途与关联事件 |
| `docs/history/event-register.csv` | 事件候选、原始日期/地名、部队/人物关联、逐项证据和可选地理信息；不是已发布事件库 |
| `public/assets/history/` | 仅放版权/核实检查已通过且获准网页使用的展示版本；Vite 会将此目录的文件公开复制进构建产物，不能在这里暂存待审核文件 |
| `src/data/history/` | 未来正式 Source/Media/Event/Place/Army/Person/Claim 数据文件；本次只有目录标记，没有假数据或运行时契约实现 |
| `src/data/history/routes/` | 未来按部队、阶段维护有证据的节点和分段，保留停驻、往返、缺口；本次无路线、坐标或 GeoJSON |

关系为：**SRC 证据 → EVT 事实登记；AST 关联 SRC 与 EVT → 合法原件 → 获准展示派生版 → 审核后数据文件**。一张图片可关联多个事件，一项事件可有多个来源；图像的保存权、展示权、内容真实性分别核查。展示用插值/交互锚点不是新史实。

网页分类目录：`photos/` 历史照片，`documents/` 文献扫描，`maps/` 地图，`portraits/` 人物肖像，`artifacts/` 文物照片，`modern-sites/` 现代遗址/纪念场馆。分类与媒介类型分开：肖像也可能是后世绘画，纪念馆照片不能充当历史现场照片。后世创作/生成示意不得混入历史照片目录；确有已授权装饰用途时继续使用已有装饰资产结构，并登记真实类型和路径。

## 编号、保存与 CSV 填写

- 新素材 ID：`AST-0001`，正则 `^AST-[0-9]{4}$`；来源 ID：`SRC-0001`，正则 `^SRC-[0-9]{4}$`；事件 ID：`EVT-001`，正则 `^EVT-[0-9]{3}$`。这里是格式示例，未预留或填入任何历史记录。按表内已用最大序号递增、不可重复、不可回收；取消的记录保留 rejected，不重排。容量不足时另行评审扩展，不静默改变格式。
- 一张逻辑素材一行 AST；多次引用复用同一编号，原件与同一图像的网页版本不重复申请 AST。不同馆藏/不同画面应独立登记；派生关系填 `derived_from_asset_id`。不得把同一原件的复制品当成相互独立证据。
- 原件可保存为 `research/originals/<AST编号>/original.<扩展名>`；网页版本用 `public/assets/history/<分类>/<AST编号>-web.<扩展名>`。授权凭证可另存原件目录，CSV 填其真实路径。这里只约定命名，未创建示例图片。对不允许本地保存的资料仅登记可定位信息，不绕过访问限制。
- CSV 用 UTF-8、英文逗号与标准双引号转义；建议 Excel 通过“数据→从文本/CSV”按 UTF-8 导入，将 ID、日期、路径和哈希列设为文本。含逗号/换行/双引号的单元格需正确引用；不要插入说明行、注释行或伪示例记录。
- 表头为稳定 snake_case 字段名，中文含义及必填条件见下表；不要自行更名或删列。空值表示未知/未收集，不能用 `0`、猜测日期、伪 URL 或虚构姓名占位。
- 多 ID 单元格用英文分号分隔，如 `SRC-0001;SRC-0002`；仅引用已登记的编号。部队/人物/地点编号未来对应正式实体表，当前没有实体清单，未知时留空，不以显示名称临时充当稳定 ID。
- 本地路径使用项目相对路径和 `/`，不得填本机绝对路径；网页路径填写实际 `public/...` 文件路径，未来转 URL 时去掉 `public` 前缀。CSV 不保存密码、账户、令牌或带私密访问凭证的 URL。
- 图片拍摄/制作时间和历史事件时间分开；原文日期不强制改精确。`date_start/date_end` 仅填证据支持的完整公历日 `YYYY-MM-DD`，区间两端包含。仅知月/年时保留原文与 precision，不擅自补某日。`display_anchor` 只有采用规则和证据明确时才填，不能反写成事件日期。
- `accessed_at/reviewed_at` 是实际查阅/核验当天的 `YYYY-MM-DD`；`reviewer` 只填真实审核人。未知历史坐标留空，不能填现代纪念馆坐标代替；坐标必须经纬度成对并有独立来源、定位及精度说明。
- `evidence_refs` 使用 JSON 数组，键为 `sourceId`、`locator`、`supports`（必要时 `notes`），对应既有 sourceRefs 契约；supports 指明所支持的字段/断言。手工编辑 CSV 时按 CSV 规则转义其中双引号。它是逐项证据，不是把整份文章一概标作支持全部内容。

## 状态与发布门槛

`review_status` 沿用 `pending / verified / disputed / rejected`；`publication_status` 沿用 `draft / ready`。新采集记录一律 pending，素材/事件一律 draft。来源已核实不自动使事件或图像已核实，图片真实性也不自动授予版权。

`rights_status` 为 `unknown / permission-required / permitted / public-domain / restricted`：分别表示未知、待许可、有明确适用许可、有依据的公有领域、不适用于当前用途。该字段是项目登记口径，不替代法律判断；不得因年代久远、馆网可下载、课程实践用途或标注出处就自行认定许可。public-domain 也要填权利判断依据。

发布前同时满足：素材/事件 verified + ready；每项事实可定位至已核验的具体来源；日期、部队番号、地点、坐标分别有依据；素材权利状态 permitted 或有依据的 public-domain，且许可明确涵盖实际使用场景（本地课程演示/公开网站等）；署名、裁切/压缩许可、替代文本完整；关联 ID 存在且无悬空引用；正式文件与登记表一致。不符合时保持研究目录和 draft，不能先放 public 再补手续。

关键起讫、会师与路线结论尽量交叉核对独立证据；转载同一原稿不算独立来源。争议在 dispute_notes 中保留各方出处及采用理由，不删除不同意见。若展示争议，需先设计多断言及引用的明确表达；当前不能直接以唯一确定结论 ready。

## 图片登记字段（asset-manifest.csv）

| 字段 | 填写说明 |
| --- | --- |
| asset_id | 必填，唯一 AST 编号 |
| title | 必填，素材名称，避免把不明图像标成某一历史事件 |
| media_type | 必填：historical-photo / document-scan / historical-map / artifact-photo / modern-site-photo / later-artwork / generated-illustration / unknown；未知创作方式不能擅定 AI 或真实照片 |
| category | 网页分类目录名；不适用的装饰素材留空，并在 notes 说明 |
| source_ids | SRC 编号列表，正式展示前必填；用户自有素材也须登记真实提供途径 |
| source_locator | 图号、馆藏号、页码、原网页具体位置，正式展示前必填 |
| creator | 实际摄影者/绘作者/制作人；未核实留空 |
| creation_date_text | 拍摄/制作日期原文及精度，不是事件日期 |
| original_path | 有权保存时的真实原件路径，未保存则留空并解释 |
| original_sha256 | 已保存原件的64位十六进制 SHA-256；派生修改前校验 |
| display_path | 审核允许后生成的实际展示文件路径，draft 无需填写 |
| derived_from_asset_id | 如为另一逻辑图像的派生创作，填写父 AST；普通网页缩放版本仍登记在原 AST 行 |
| processing_notes | 裁切、尺寸调整、色彩处理、修补等真实操作，严禁隐瞒重建/生成 |
| caption | 展陈说明，分清画面内容与作者阐释；正式展示前必填 |
| alt_text | 有信息图片的替代文本，正式展示前必填；装饰用途允许空并在 notes 明示 |
| rights_status | 必填，见状态约定 |
| rights_holder | 已确认权利人/授权机构，不把转载平台自动当权利人 |
| license_name | 许可准确名称或书面授权标识 |
| license_url | 真实许可条款链接，没有公开链接可留空并指向本地凭证 |
| usage_scope | 是否允许公开展示、课程演示、改编、裁切/压缩及期限等 |
| credit_line | 页面须使用的完整署名 |
| rights_evidence_path | 权利凭证/条款保存位置；正式展示前需有可追溯依据 |
| review_status | 必填，真实性核验状态 |
| publication_status | 必填，draft / ready |
| event_ids | 相关 EVT 列表；无事件关联的装饰素材允许空 |
| reviewer / reviewed_at | 实际核验人和核验日期，verified 时必填 |
| notes | 未知项、使用限制、缺失原件原因等 |

## 来源登记字段（source-register.csv）

| 字段 | 填写说明 |
| --- | --- |
| source_id | 必填，唯一 SRC 编号 |
| legacy_reference | 既有文档编号或引用位置，如候选门户记录；保留旧编号但不冒称门户已核实 |
| title | 必填，具体文章/书籍/档案/馆藏条目完整标题 |
| source_type | 必填：book / archive / museum-record / institutional-article / academic-paper / news-report / user-provided / portal / other；portal 仅线索 |
| author / publisher | 作者/编者与发布机构/出版社，不明留空 |
| publication_date_text | 出版/发布或档案形成时间原文；未知不补日期 |
| edition_volume | 版本、卷册、期号等，适用时必填 |
| url_or_archive_id | 真实原始网址或档案/馆藏号；纸质资料可依完整书目信息定位，不制造网址 |
| accessed_at | 网络资料实际访问日期，纸本可留空 |
| locator | 必填，页码、段落、小标题、档案件号等具体定位；门户首页只能作线索 |
| supported_claims | 必填，明确可支持的结论，不能只写“长征历史” |
| original_date_place_text | 日期/地名的原始表述，保留不确定性 |
| cross_check_source_ids | 独立交叉核验来源列表，无法取得时说明原因 |
| evidence_path | 合法保存的本地证据或摘录路径；不能保存则说明可定位方式 |
| review_status | 必填，来源及所登记用途的核验状态 |
| reviewer / reviewed_at | 实际审核人和日期，verified 时必填 |
| dispute_notes | 不同说法、证据强弱及采用理由 |
| rights_notes | 保存、引用、复制、转载、媒体使用等限制；不自动继承为图片授权 |
| notes | 可访问性、链接失效、原始稿与转载关系等 |

## 事件登记字段（event-register.csv）

| 字段 | 填写说明 |
| --- | --- |
| event_id / title | 必填，唯一 EVT 编号及事件名称 |
| event_type | 可填 departure / arrival / meeting / battle / conference / reorganization / other / unknown；必须依据资料，不预填事件 |
| army_ids / people_ids / place_ids | 各自实体编号列表；须区分当时番号及有效时期，当前实体未建立可暂空 |
| source_ids | SRC 列表，ready 前必填 |
| evidence_refs | 逐字段/断言的 sourceId、locator、supports 引用数组，ready 前必填 |
| original_date_text | 日期原文，保留月/年/区间等不确定性 |
| date_start / date_end | 可空的有证据完整公历日期，不凭精度规则补日 |
| date_precision | 必填：day / month / year / range / unknown |
| display_anchor / anchor_rule | 未来地图交互定位日及采用说明；无依据留空，不能把锚点当新增史实 |
| historical_place_name / modern_place_name | 历史与现代地名分别登记，未确认对应时现代名留空 |
| longitude / latitude | 可空的数值经度/纬度；必须成对、有限且在合理范围；不是随手搜索的场馆坐标 |
| coordinate_system | 有坐标时必填；正式 GeoJSON 仅 WGS84，采用 [longitude, latitude] 顺序；其他坐标待审核转换后使用 |
| location_precision | 必填：exact-site / approximate-site / town / county / unknown |
| coordinate_source_ids / coordinate_locator | 坐标证据来源列表及定位，有坐标时必填；事件文章引用不能自动作为坐标证据 |
| asset_ids | AST 列表，ready 事件允许没有图像，不以假图补足 |
| summary | 有引用的转述，不编造引语；ready 前必填 |
| review_status / publication_status | 必填，核验状态与 draft / ready |
| reviewer / reviewed_at | 实际审核人和日期，verified 时必填 |
| dispute_notes / notes | 分歧、采用理由、覆盖缺口、锚点和现代地名的限制 |

## 人工采集与后续交接

1. 先找到具体史料条目，登记 SRC、准确书目及定位、实际可支持的结论；现有门户仅作检索入口。
2. 登记 EVT 的原始日期/地名、部队关联和证据，先 pending/draft；日期与坐标分别核实，暂不填可信度不足的值。
3. 在许可范围内保存原件并登记 AST、来源、类型、哈希、作者与权利凭证。现有首页艺术图与分层可日后据真实提供记录登记，当前不自动填入模板。
4. 交叉核验，补真实审核人与时间；版权/署名确认后才另存网页版本，登记处理记录；原件不变。
5. 后续单独任务再实现 CSV 校验/导入及 TypeScript 契约，按既有计划建立 Sources、Media、Events、Places、Armies、People、Claims 与每支部队路线。CSV snake_case 明确映射为既有 camelCase；AST 对应 Media.id，SRC 对应 Source.id，EVT 对应 Event.id，不再生成第二套同实体编号。

目前没有实现自动校验器、导入器、审核界面或素材页面。运行时历史实体和路线仍为零，目录存在不能被描述为地图功能已完成。初始化审查和实测结果见 [AUDIT.md](AUDIT.md)。
