# 精神传承：主题强化修订

2026-11-18后续最终精修已在此版本上实施；现行正文、人民配图、差异构图与实时青春纪念笺以[最终精修报告](LEGACY_FINAL_POLISH.md)为准，下文保留此前主题强化及批注记录。

2026-11-17。在现有「征途未止」六场景基础上修订，不改全页布局，不删除或替换真实素材。修改前检查Git状态，保存本轮文件检查点及受保护数据/媒体哈希至 `output/checkpoints/legacy-theme-20261117/`；原工作区未提交内容保留，未提交或推送。

## 叙事与逐段审校

贯穿母题：**一代人有一代人的长征。** 阅读链条为「先辈足迹 → 前辈嘱托 → 我们作答」，三个年代为1936革命征途、1956电子报国、2026青年担当。年代间是本站精神价值解读，不是人物、机构的直接历史承继；开篇明确当代学习、科研与成长不能与革命战争的生死考验简单等同。

| 位置 | 原有重心 | 本轮修订 |
| --- | --- | --- |
| 开篇导读 | 两个纪念周年并列、泛问未来 | 母题标题、三段时代任务串联；说明杭电以专业教育和人才培养进入本章的理由 |
| 精神之路引导 | 精神在选择中被理解 | 从历史具体选择进入今天的责任 |
| 信念 | 湘江牺牲与寻找出路 | 保留历史基础，追加「为什么学、知识帮助谁」的当代提问 |
| 坚韧 | 雪山草地困难与扶持 | 保留各部队历史差异；落实为长期工作、主动求助，不把吃苦本身当目的 |
| 求实 | 遵义与四渡赤水中修正判断 | 增加实验尊重证据、如实记录、结论可检验 |
| 团结 | 不同部队协同与会师 | 增加跨专业合作、尊重知识与共同责任，不合并不同会师史实 |
| 人民 | 半条被子与具体的人 | 增加技术使用者、实际困难及被忽略需求的追问 |
| 薪火相传引导与图注 | 革命与电子意象并列 | 明确道路到走线的连续转译及各年代不同任务；保留象征边界 |
| 校史总述与四节点 | 学校名称与校庆回顾 | 1956专业人才、1980工业与育人、2004探索实际问题、2026所学去向；日期与校名不改 |
| 蒋葆增 | 身份与求学任职列举 | 三段依次为革命之后的建设课题、科研教育贡献的具体例证、遗训对今天知识/技术/责任的提问 |
| 无人机图旁 | 活动地点、头像、致意 | 两段精神回响：征途上的理想信念 → 校园夜空中的前辈嘱托 → 面对时代需要如何尽力 |
| 青春答卷前后 | 面向未来的一般性抒情 | 用所学回应真实需要，从一件愿意做好的事开始；结果提示留待学习与实践检验 |
| 尾声 | 纪念周年与篇章展开 | 回扣不同年代的时代课题、所学去向及这一代人的具体回答 |

保留开篇既有主句、真实图片图注、完整来源目录、准确身份、遗训原文、校训及五个关键词释义。页面引导语集中到 `legacyNarrative`，历史与人物段落仍在独立数据文件中，未将新增正文散入JSX。所有当代例子为本站解读，不冒充人物原话或个人经历。

## 蒋葆增与无人机段落

蒋葆增章节的核心逻辑是：长征一代寻找民族出路；建设年代以工业、科技与教育回应国家需要；蒋葆增在真空管研制、电子工业教育与人才培养中的贡献，使知识报国有具体面貌；「国家大事，千万尽力」再把问题交给今天的学生。保留杭州电子工业学院首任院长身份、第一批真空管主要研制者与电子工业教育开拓者之一的口径。删除正文中求学和任职的履历列举，原来源和核验记录保留。没有添加他参加长征、受某一长征人物直接影响等未经证实的联系。

无人机图旁标题改为「前辈嘱托，今天的追问」。活动时间、地点、照片性质仍由日期与图注准确承担；正文解释为什么这一幕属于精神传承页，并提出「知识、技术与责任被需要时，所学用在何处、怎样尽力」。既有现场图及原字节不变。

## 第二章图形

- 1936：保留淡墨山形与红色自然曲线，起伏、绕行与道路节点清楚可见。
- 1956：同一条红色主路经曲线、圆滑折角过渡到规则折线；增加环形焊盘、节点与从主线实际分出的暖金走线。
- 2026：折线逐步形成清晰的45度走线，主路直接进入芯片封装与内框；上下分支汇入芯片不同位置。
- 芯片右侧开放少量细线，上下保留克制引脚，表达继续延伸的方向；移除原芯片内部的通用勾号。
- 年份改为与三个主要位置居中对应，沿用「革命征途／电子报国／青年担当」标签。无新动画、渐变光效、WebGL、依赖或时间状态。

图仍为原创隐喻，不表示真实地理路线或可工作的电子电路。原 `.legacy-route-path`、`.legacy-circuit-traces` 和章节动效接口保留。

## 双端、构建与证据

环境：Windows、Node v24.21.0、Playwright1.65.0，实际Chrome157与Edge157。使用重新生成的生产dist。

| 检查 | 结果及证据 |
| --- | --- |
| 工程与链接 | `node scripts/verify-setup.mjs`通过，`setup-validation.log` |
| 严格类型与构建 | `npm run typecheck`、`npm run build`通过，129模块，`typecheck.log`、`build.log`；既有地图分包大于500KB提示仍在 |
| 最终本章回归 | Chrome/Edge 34/34，`final-34-results.json`：六档完整流程28项、主题近景6项 |
| 首页及原四章入口 | Chrome/Edge 20/20，`initial-54-results.json`中的homepage项 |
| 桌面 | 1920×1080、1440×900；专项近景1440×1000 |
| 手机横屏模拟 | 932×430、844×390、740×320、667×375；正文至少16px、导航44px、图文并列、无横溢出 |
| 既有交互 | 200字/换行/IME、关键词、PNG下载、复制后备、图片与Canvas失败、键盘/焦点、旋转及导航状态保留、八个历史事件日期、localhost与WiFi IP媒体一致均通过 |
| 字体 | 所有新正文汉字及书法标题缺字0，命名/许可入包通过；`font-audit.json` |
| 数据和媒体 | 检查点27份受保护文件哈希保持；五份新图原件/展示/dist登记一致，五份复用历史图原件与dist一致；`integrity-audit.json` |

本轮独立覆盖54项。首轮52通过、2失败，均为740×320的SVG顶对齐时0.5px舍入造成可见率0.997375，实际图形没有溢出。专项截图改为在滚动容器中居中定位，保持完整可见率断言不放宽。最终本章34/34全部通过。首轮JSON及失败trace/截图保存在 `initial-54-results.json`、`initial-failures/`，不隐去失败，也不累加重复跑次。

使用已有脚本：首轮 `npm run test:browser -- tests/legacy-theme.spec.ts tests/legacy.spec.ts tests/homepage.spec.ts --project=chrome-1920 --project=edge-1920`；最终 `npm run test:browser -- tests/legacy-theme.spec.ts tests/legacy.spec.ts --project=chrome-1920 --project=edge-1920`。环境变量 `LEGACY_EVIDENCE_DIR=output/playwright/legacy-theme`、`LAN_TEST_URL=http://10.75.233.125:4174`。未声称运行仓库全部测试或性能跑分。

本轮实体Safari/Android、真实软键盘、地址栏、安全区和校园网客户端隔离仍未实测；不以桌面触摸模拟声称真机验收。所有真实图片保留，史料/出版/版权状态仍为原值。

本轮关键截图存于 `output/playwright/legacy-theme/`，旧版交付截图保留。专项测试同时保存标题/肖像、完整正文阅读位置、无人机图文及SVG近景，并检查主线终点确实进入芯片、横屏图文并列、正文至少16px、无横溢出、无页面异常。

| 章节 | 桌面关键截图 | 横屏关键截图 |
| --- | --- | --- |
| 薪火相传 | [全景](../output/playwright/legacy-theme/chrome-1920-1440-relay.png) | [844图形](../output/playwright/legacy-theme/chrome-1920-844-circuit.png)、[740图形](../output/playwright/legacy-theme/chrome-1920-740-circuit.png) |
| 蒋葆增 | [肖像与遗训](../output/playwright/legacy-theme/chrome-1920-1440-jiang.png)、[三段完整正文](../output/playwright/legacy-theme/chrome-1920-1440-jiang-reading.png) | [844](../output/playwright/legacy-theme/chrome-1920-844-jiang.png)、[740](../output/playwright/legacy-theme/chrome-1920-740-jiang.png)、[正文](../output/playwright/legacy-theme/chrome-1920-844-jiang-reading.png) |
| 无人机精神回响 | [图文](../output/playwright/legacy-theme/chrome-1920-1440-drone.png) | [844](../output/playwright/legacy-theme/chrome-1920-844-drone.png)、[740图文](../output/playwright/legacy-theme/chrome-1920-740-drone.png)、[740末段](../output/playwright/legacy-theme/chrome-1920-740-drone-reading.png) |

Edge同名证据以 `edge-1920-` 开头。原六场景及五精神维度阅读截图在相同目录，不以拼图或设计稿冒充实际网页截图。

按[最新Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md)审查本轮改动，保留原有焦点、标签、触摸入口、媒体说明与reduce策略。改动范围检查记录：

```text
src/features/legacy/LegacyPage.tsx:59 - ✓ 正文分离、语义结构及原始图注保留
src/features/legacy/RouteCircuit.tsx:3 - ✓ SVG替代说明覆盖三个阶段，静态可读
src/features/legacy/YouthAnswer.tsx:51 - ✓ 可跳过、原输入标签与结果反馈保留
src/styles/legacy.css:26 - ✓ 引导语行长约束，横屏图文未改单栏
```

此为改动范围检查，不冒称完成全站WCAG认证、真机或Lighthouse性能验收。预览：[本机](http://localhost:4174/#legacy)、[同网段](http://10.75.233.125:4174/#legacy)。保留原4174生产服务，本轮自启4173测试服务在收尾时停止。

## 文件范围

- 正文与登记：`src/data/history/legacy/content.ts`、`editorial-register.json`。
- 组件：`src/features/legacy/LegacyPage.tsx`、`YouthAnswer.tsx`、`RouteCircuit.tsx`。
- 样式：`src/styles/legacy.css`，仅新增引导语行长/换行约束，保留所有原响应式构图。
- 字体：按新文案重生成 `src/assets/fonts/legacy-serif.woff2`、`legacy-title.woff2` 和 `legacy-font-manifest.json`；书法字集保持原范围。
- 测试：`tests/legacy-theme.spec.ts`；`tests/legacy.spec.ts`仅增加证据目录环境变量入口，避免覆盖旧版证据。
- 文档：本文、`docs/LEGACY_CHAPTER.md`、`docs/TASK_BOARD.md`。
- 审计与截图：`research/legacy_theme_20261117/`、`output/playwright/legacy-theme/`。

原地图/人物数据及全部既有真实影像须通过本轮检查点哈希比对。`pending`、`draft`和版权元数据不因文案重写而升级。后续人工确认仍包括文字审读、史料/图片公开转载条件、实体手机与实际校园网体验；本轮不扩展其他模块或全站高级动效。

## 2026-11-18 浏览器批注微调

按用户两条定位批注，仅修改 `src/data/history/legacy/content.ts` 中两处文案：答卷引导替换为「读过长征红军先辈的事迹和上一代人长征的嘱托，你希望用怎样的所学，走好我们这一代人的长征路？」；无人机末段加入「走好我们这一代人的长征路，需要在今后的学习与实践中，一步步写下自己的回答」，保留知识、技术和责任的提问。

工程检查、严格类型、生产构建通过；现有字体覆盖新增文案全部汉字，无需重生成字体。Chrome桌面1440×900/1000与横屏844×390，四项既有专项检查通过；截图确认图文并列、自然换行和正文可滚动阅读。记录与截图保存于 `output/playwright/legacy-copy-comments/`，本条不覆盖上一轮双浏览器完整回归的范围，也不代表真机检查。
