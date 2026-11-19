# 精神传承最终精修 · 实施与验收

2026-11-18。任务原文保存在 `research/legacy_final_20261118/brief.txt`；修改前Git状态已检查，既有成果及本轮相关文件保存在 `output/checkpoints/legacy-final-20261118/`。本轮仅调整第四章，不提交或推送。

## 开发前的设计选择

本章是具有史料依据的课程数字展陈。沿用深墨绿#171c19、展厅墨绿#1d2420、暖灰纸#e5dfd1、暗红#933e32、暖金#ae9060、浅金文字#e9dfc9；书法继续使用真实LegacyBrush，正文LegacySerif，操作与来源用现有黑体。

- 首屏只提亮校园、减轻融合区遮罩，保持山河与书法构图。
- 导读按「一代人／有一代人的长征」语义断行；长说明移入页尾，叙事先行。
- 精神之路以连续红线、明确节点组织五段；信念以事件叙事为主，坚韧放大环境，求实强调两处专题入口，团结呈现不同会师关系，人民以老屋和半条被子的故事为主体。不为每段设置整屏高度。
- 答卷左侧书写、右侧独立深色纪念笺：进入即见明确标记的示例，选词与输入实时重绘，本地确认后导出完整PNG。横屏保留两栏，有限高度通过自然滚动阅读。
- 图形在同一红路中依次使用不规则行军折转、逐渐规整的45度转折、焊盘/过孔/芯片引脚；不增加动画或科技光效。

## 实际使用的Skill

已阅读Frontend Design的正文、UI UX Pro Max的优先级和工作流、Design Taste的正文及copy/layout参考、Web Design Guidelines。应用主体特有的真实影像、主动控制标题断行、减少重复标签/边框、内容决定高度、左右等边、输入即时反馈、44px目标和16px横屏正文。UI UX Pro Max执行了 `live preview feedback --domain ux`、`controlled input deferred --stack react` 查询；采用单一完整状态反馈与受控输入/可见标签，不采用搜索中的AI反馈或震动建议。

Design Taste中商业页面的无图注、固定整屏与模板起步规则，与本任务明确要求冲突：本轮依用户任务保留历史图注和自然章节高度，不导入商业模板或其动效库。此为明确适用范围判断，不据此发起额外确认。审查时再获取最新官方Web Interface Guidelines并记录结果。

## 素材复核

信念保留界首渡口现代遗址照；坚韧保留夹金山地理环境照（不冒作草地）；求实保留遵义作战室照片，年代未知仍注明；团结保留会宁西关照，仅对应会宁，不将其冒作将台堡或会师现场。人民替换为新华社沙洲村徐解秀旧居内景，明确为现代遗址及陈设。原湖南路线图及原登记不删除。

新来源：[新华社《魅力山乡丨“半条被子”的故事在这里延续》](https://www.xinhuanet.com/20260710/eadd7e44b7e3429c899b953cfdee1cbb/c.html)，2026-07-10，正文第一幅老屋内景图及相邻图注；[湖南省政府陈列馆介绍](https://www.hunan.gov.cn/hnszf/c101482/202108/t20210830_20409697.html)作故事地点和旧居性质交叉对照。没有把现有被褥认定为1934年原物。原件、网页缓存、哈希与尺寸独立登记；审核及转载许可仍为pending/draft/permission-required。

## 文案与说明的实际修改

导读改为三段：1936年的革命征途、1956年后的工业与教育、今天杭电课堂里的学习和实践。标题由两个完整语义单元组成，未在「一代人」中断词。五个精神维度删去重复的概念摘要和每段相同的解读标签，以湘江、雪山、遵义与四渡、两处会师、剪被故事组织短段落；不在每段末尾再附一段当代议论。

校史四节点采用「为国家建设育才／在电子工业中开拓／向新的科技领域进发／接过时代的答卷」，正文保留前身校名、国务院批准改建、2004更名、办学特色及七十周年的事实，不以口号替换校史。1980年计算机房原图保留，主段解释其作为早期教学与设备建设影像的作用。

蒋葆增真实肖像与八字书法主体保留。删除观众界面「不是1956年学校创办时的首任校长」，只展示杭州电子工业学院首任院长；原史实校正仍保存在登记。正文变为「以信念开路／以知识报国／以青春作答」三个短主题，保留真空管研制、电子工业教育与人才培养贡献，末尾以母题收束。没有新编个人经历或与长征的直接联系。

无人机章节改为「九十年后的这个夜晚」。先写2026年10月16日校园夜空中的肖像与遗训，再回望九十年前的红军，最后落到往后的学习、探索与选择，引出答卷。没有扩写无人机数量、流程、观众感受或假定每名学生都在现场。图注与照片来源保留。

答卷保留用户上次指定的长征路引导句，补充课程、问题、小事等可写内容，移除空泛鼓励。尾声缩为先辈足迹、校园嘱托、今后学习工作生活中的答卷两段。

真实性与创作边界没有删掉，移至页尾折叠的「创作与史料说明」；五维标题为本站概括、艺术场景与实拍、不同会师地域、雪山与草地影像区分、当代历史代价差异统一在那里说明。照片年代与来源、书法并非本人手迹仍贴近展品。公开正文不再出现审核流程或开发用语，原pending/draft/版权登记保留。

## 版式与图形

首屏校园图从原0.46透明度提高至0.76，轻调亮度与自然色，扩大融合区域，局部遮罩从左向右递减；原始背景文件未改。山河保持沉稳，校园天空、建筑与问鼎广场可辨。

五段共用现有组件，分别以事件图文、宽幅山地环境、判断叙事与双专题入口、会宁照片与分开的会师入口、老屋与剪被故事为主。图文列宽与顺序不同，横屏仍并列。删除620/480/360px的精神段落最小高度约束，以正文与图片决定实际高度；减少导读、章节与正文间距。连续红线独立于关键词背景，五个圆形节点与线条对齐，章节高度、字体加载和方向变化均由CSS自然跟随。

薪火图去掉正弦形山路与三角山峰，改为不规则行军折转、少量箭头和曲线等高线。中段转折逐渐规整到45度并出现过孔，地形线逐渐消失；右端增加分支、焊盘、小元件、芯片封装和引脚。红色主路接入输入引脚和内框，辅助走线与芯片相接并留开放端点。保留米白、暗红与暖金，不使用蓝紫光、赛博效果或真实电路宣称。

## 青春纪念笺的完整流程

1. 进入即显示一张深墨绿、暖金书法的完整示例，标明「示例预览」，五个关键词全部未选。示例不能直接保存为个人答卷。
2. 在左侧选词，暗红字、下划线和勾记共同表示选中；右侧大字实时变化。前四词来自校训，担当仍为主题延伸。
3. 输入出现后，右侧每次输入同步重绘，无需点击生成。保留200字素、IME、换行与系统中文字体后备，不上传或持久保存文字。
4. 点击「生成我的青春纪念笺」才确认导出。未选词、空白文字有明确提示并聚焦相应控件；生成中按钮禁用。
5. 生成后，左侧出现保存图片、复制文字、重新书写、继续尾声；右侧显示完整PNG，可打开原图或长按保存。HTTP校园网不依赖安全上下文剪贴板来完成保存。
6. 改词或改字会撤下旧下载并返回实时预览，避免保存过期答案；重新书写保留草稿，生成过程中修改也不会提交旧结果。
7. Canvas不支持时仍可阅读文字预览、书写和复制；导出失败时可重试。复制失败提供可全选文字。Blob URL、异步字体回调有清理与失效保护，方向变化不清空内容。

预览与导出共用 `paintKeepsake`，使用本地字体和原创线条，完全不读取远程图片。导出宽1080px，正文自动换行，长文按实际行数增加高度；用户手动换行保留。处理中文标点行首和自动换行末行过短的问题，避免句号独占一行或正文压住页脚。纪念笺含标题、关键词、个人文字、八字遗训、双周年、校训和「2026 · 我的青春征途」；无证书边框、奖项或身份收集。

## 双端截图与真实导出

以下均为实际生产网页截图，非设计稿。Chrome主图如下；Edge以 `edge-1920-` 同名保存，六档视口均有相应文件。专项镜头与原六场景截图命名区分，原开发阶段证据保留。

| 场景 | 电脑1440×900 | 手机横屏844×390 |
| --- | --- | --- |
| 首屏 | [山河与校园](../output/playwright/legacy-final/chrome-1920-1440-final-prologue.png) | [横屏首屏](../output/playwright/legacy-final/chrome-1920-844-final-prologue.png) |
| 一代人的长征 | [导读](../output/playwright/legacy-final/chrome-1920-1440-final-introduction.png) | [横屏导读](../output/playwright/legacy-final/chrome-1920-844-final-introduction.png) |
| 人民 | [徐解秀旧居](../output/playwright/legacy-final/chrome-1920-1440-final-people.png) | [横屏人民](../output/playwright/legacy-final/chrome-1920-844-final-people.png) |
| 路线与PCB | [薪火相传](../output/playwright/legacy-final/chrome-1920-1440-final-relay.png) | [横屏图形](../output/playwright/legacy-final/chrome-1920-844-circuit.png) |
| 蒋葆增与遗训 | [主体](../output/playwright/legacy-final/chrome-1920-1440-final-jiang.png)、[三段正文](../output/playwright/legacy-final/chrome-1920-1440-jiang-reading.png) | [横屏主体](../output/playwright/legacy-final/chrome-1920-844-final-jiang.png) |
| 无人机 | [图文](../output/playwright/legacy-final/chrome-1920-1440-final-drone.png) | [横屏阅读](../output/playwright/legacy-final/chrome-1920-844-drone-reading.png) |
| 答卷初始 | [示例预览](../output/playwright/legacy-final/chrome-1920-1440-final-answer-initial.png) | [横屏初始](../output/playwright/legacy-final/chrome-1920-844-final-answer-initial.png) |
| 答卷输入后 | [实时状态](../output/playwright/legacy-final/chrome-1920-1440-final-answer-live.png) | [横屏书写](../output/playwright/legacy-final/chrome-1920-844-final-answer-live.png) |
| 生成后 | [生成结果](../output/playwright/legacy-final/chrome-1920-1440-final-answer-generated.png) | [横屏生成](../output/playwright/legacy-final/chrome-1920-844-final-answer-generated.png) |
| 最终PNG | [真实下载样例](../output/playwright/legacy-final/chrome-1920-1440-final-keepsake.png) | [横屏下载样例](../output/playwright/legacy-final/chrome-1920-844-final-keepsake.png) |
| 尾声 | [网站尾声](../output/playwright/legacy-final/chrome-1920-1440-final-epilogue.png) | [横屏尾声](../output/playwright/legacy-final/chrome-1920-844-final-epilogue.png) |

另有belief/tenacity/truth/unity各段近景；740×320和667×375有实时答卷、生成结果及完整PNG证据。前期pilot中一张首屏截图拍到了懒加载占位，现已在截图前明确等待标题和双图解码，最终截图不采用该图。

## 代码与交付文件

修改 `src/features/legacy/LegacyPage.tsx`、`RouteCircuit.tsx`、`YouthAnswer.tsx`、`keepsake.ts`，新增 `KeepsakePreview.tsx`；样式 `src/styles/legacy.css`；正文与登记 `src/data/history/legacy/{content.ts,media-register.json,editorial-register.json}`。

新增一幅 `public/legacy-media/shazhou-old-house.jpg`，其原件和网页证据在 `research/legacy_final_20261118/`；旧图片文件不删除。`scripts/prepare-legacy-media.mjs`仅增加保留此JPEG原字节的处理分支。按新文案重生成 `src/assets/fonts/legacy-{title,serif}.woff2` 与manifest，书法字集范围不扩张，原字体和OFL不变。

测试新增 `tests/legacy-final.spec.ts`，更新原 `legacy.spec.ts`按钮名称与媒体描述，`legacy-theme.spec.ts`支持独立证据目录和新的三主题正文。文档为本文、`TASK_BOARD`、`LEGACY_CHAPTER`、`LEGACY_THEME_REVISION`、`DESIGN_SYSTEM`、`INTERACTION_DESIGN`、`TECHNICAL_ARCHITECTURE`、`HISTORICAL_SOURCES`、`TEST_PLAN`的本轮记录与现行版本指引。`research/legacy_final_20261118/{audit.mjs,check-font.py}`检查素材、非本章文件与字体。实际差异清单见 `output/playwright/legacy-final/integrity-audit.json`，不把Git中其他早期未提交内容列成本轮成果。

## 后续动效接口与边界

保留全部六个 `data-legacy-scene` / `data-motion-slot`；精神之路增加 `data-motion-slot="spirit-route"`、`.legacy-road-route`、`data-route-node`；主SVG有 `#legacy-main-route`、`.legacy-route-path`、`.legacy-terrain`、`.legacy-circuit-traces` 和PCB group；纪念笺预览有 `data-motion-slot="keepsake-preview"`。未来可分别接滚动点亮、电子信号、芯片或生成转场，本轮未新增滚动时钟、GSAP场景或光影动画，原按钮/结果反馈仍尊重reduce。

本轮完成后暂停新增功能。实体Safari/Android、真实软键盘与系统长按/下载、刘海/地址栏、低端机性能和校园网客户端隔离仍需真机验收；模拟与同IP桌面访问不等于真机。史料与媒体仍pending/draft，独立公开转载条件仍待人工处理；没有全站最终清洁安装或性能跑分结论。

## 实际验证与审查

环境：2026-11-18，Windows、Node v24.21.0、Playwright1.65.0，实际Chrome157与Edge157。使用生产dist。未新增依赖，构建130模块；第四章JS约40.88KB、CSS36.62KB，均为未gzip大小。既有地图分包大于500KB的构建提示保持，未在本轮做全站分包重构。

| 检查 | 结果及证据 |
| --- | --- |
| 工程和链接 | `node scripts/verify-setup.mjs`通过，收尾 `setup-validation.log` |
| 严格类型 | `npm run typecheck`通过，`typecheck.log`；最终build再次包含typecheck |
| 生产构建 | `npm run build`成功，`build.log` |
| 双浏览器完整回归 | 70/70，`full-70-results.json`：首页20、本章原流程28、原主题近景6、新实时纪念笺和精修16 |
| 末行排版收尾 | 26/26，`final-26-results.json`，相关输入法/长文/故障/缩短高度与新流程复测，不累加独立覆盖 |
| 最终图注和截图 | 12/12。新图原图注有「7与1日摄」笔误，公开图注最终只列可靠刊载年月；六档最终画面重新核对，记录 `final-12-results.json` |
| PNG与内容 | 每档实际下载1080×1440以上PNG；预览和导出正文区域像素一致。99次换行的极端输入完整输出1080×6130，正文不压页脚 |
| 隐私与过期结果 | 用户文字未出现在请求URL或请求体；示例不能提交，生成中修改不出现旧结果，改词保留文字、撤下过期下载通过 |
| 故障与HTTP | 无Canvas/字体失败/导出失败均有后备；原生及手动复制、HTTP下载和原图可用；本机及WiFi IP桌面/横屏模拟六份登记图与现行五维图解码通过 |
| 字体 | 新章正文汉字及书法标题缺字0，字体name/CFF与许可入包一致，`font-audit.json` |
| 保护与素材 | 156份原src/public文件字节保持，未发现无关业务改动；六份登记图原件/展示/dist一致，五份旧历史图（含已换下路线图）保留；`integrity-audit.json` |

70是独立覆盖数量，pilot、26项和最终截图刷新均为相关重复验证，不相加成更多功能。完整70项没有失败；pilot的首屏占位截图已明确弃用。过程JSON完整保留，旧阶段142/54等数字不移作本轮成绩。

桌面1920×1080、1440×900，横屏932×430、844×390、740×320、667×375均实际跑过；原专题近景另有1440×1000。核验横屏双栏、16px正文、44px入口、无横溢出、完整缩放画幅及键盘可用，原测试继续覆盖竖屏旋转、可视高度缩短到220和地图状态保留。纪念笺属于独立图像预览，按可用高度等比显示；个人文字也在左侧16px以上输入框中可读，保存的1080px原图可放大查看。

完整命令使用已有脚本：`npm run test:browser -- tests/legacy-final.spec.ts tests/legacy.spec.ts tests/legacy-theme.spec.ts tests/homepage.spec.ts --project=chrome-1920 --project=edge-1920`。设置 `LEGACY_EVIDENCE_DIR=output/playwright/legacy-final`、`LAN_TEST_URL=http://10.75.233.125:4174`。收尾只跑相关case。没有声称运行仓库所有测试文件。

已重新获取[官方Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md)并审查本轮变更；原生语义控件、可见标签、完整状态消息、图片和Canvas替代说明、焦点、safe-area、reduce和无横溢出均纳入实际检查。历史日期按史料口径展示，私人文字不进入URL或持久存储；这两项按项目内容及隐私要求保留，不机械采用通用产品规则。

```text
src/features/legacy/LegacyPage.tsx:59 - ✓ 标题语义断行；说明移至页尾；五维与真实图注保留
src/features/legacy/RouteCircuit.tsx:3 - ✓ 艺术示意替代文本；连续主路接入芯片
src/features/legacy/YouthAnswer.tsx:16 - ✓ 生成校验、失效控制、文字后备和可跳过
src/features/legacy/KeepsakePreview.tsx:10 - ✓ 字体回调取消，无持续时钟，Canvas失败有文字后备
src/features/legacy/keepsake.ts:8 - ✓ 预览/导出同源绘制，标点与短末行处理，完整换行
src/styles/legacy.css:34 - ✓ 内容高度、差异构图、横屏并列与触摸尺寸
```

本轮验收范围内未发现阻断问题。实体手机、独立公开转载与史料最终人工审核、全站清洁安装与真实性能仍按上节保留。本机预览[精神传承](http://localhost:4174/#legacy)，同网段[精神传承](http://10.75.233.125:4174/#legacy)；保留原4174服务，收尾停止本轮4173测试服务。
