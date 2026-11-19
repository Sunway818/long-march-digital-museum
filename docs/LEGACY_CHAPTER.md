# 第四章「精神传承」——征途未止

2026-11-18最终精修：当前已采用语义断行、短叙事与页尾说明、五维差异构图和连续节点、沙洲村徐解秀旧居实拍、行军路线到PCB转译，以及左写右览的实时青春纪念笺。现行文案、图片来源、交互、实际截图与最新验证见[最终精修报告](LEGACY_FINAL_POLISH.md)；下文与主题修订报告保留阶段记录。

2026-11-17后续专项修订：现行文案已统一到「一代人有一代人的长征」与「先辈足迹 → 前辈嘱托 → 我们作答」，第二章改为连续山路/折线/电路转译。原布局与真实素材保留；最终本章Chrome/Edge34项通过，首页20项通过。具体改写、最新截图、文件和验证边界见[主题强化修订](LEGACY_THEME_REVISION.md)。下文保留首次开发记录。

2026-11-17。本轮按正式任务书实际开发，供杭州电子科技大学课程实践评审。已接入六个场景、五个精神维度、八个既有事件入口及本机青春纪念笺。完成本轮检查后暂停新增功能，等待人工验收；高级动效仍暂缓。

## 工作区保护与实际 Skill 使用

基线 HEAD 为 `f481923`，分支 `feature/continuous-flag-motion`，开始时已有大量未提交成果。开发前保存 `src/docs/tests/scripts`、工程入口与 Git 状态至 `output/checkpoints/legacy-20261117-214646/`。本轮未提交、重置或 push，也未安装新依赖。差异以该检查点为准，不能把整个 Git dirty tree 算作本轮改动。

实际读取并采用：

| Skill | 实际应用 |
| --- | --- |
| `.agents/skills/frontend-design/SKILL.md` | 以杭电真实校园、前辈肖像与书法为主体；六段分别采用合成开篇、交错道路、线路图、肖像遗训、书写工作区和全幅校园构图；避免同形卡片铺排。 |
| `.agents/skills/ui-ux-pro-max/SKILL.md` | 执行本地设计系统、UX 与 React 查询，采用渐进显示、44px触摸、16px横屏正文、可见焦点、错误恢复与 effect 清理。 |
| `.agents/skills/web-design-guidelines/SKILL.md` | 实际获取并按[Vercel官方规则](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md)审查语义、键盘、标签、图像占位、动态反馈、reduce、独立滚动和安全区。 |
| `C:/Users/czx/.codex/skills/design-taste-frontend/SKILL.md` | 采用真实素材、清楚文案、统一边线与按钮；其商业站分类、随机模板、删除图注和强制每屏高度与本任务冲突，不照搬。未声称运行其商业站检查器。 |
| `C:/Users/czx/.codex/skills/playwright/SKILL.md` | 真实浏览器验证、截图及交互复查；按项目明确要求使用已有 `npm run test:browser`，不另建测试框架。 |
| `sites:sites` | 阅读既有仓库的本地预览工作流；仍使用当前 React/Vite 工程，没有创建、托管或发布新的 Site。 |

本地 UIUX 查询确实运行：`historical museum editorial narrative --design-system -p 征途未止 -f markdown`、`form keyboard focus error feedback --domain ux`、`effect cleanup --stack react`。设计系统检索中的通用配色/Inter建议没有取代已认可的红金与中文字体；采用其适用的连续叙事和可读性建议。Python 使用现有3.15环境，没有安装系统软件。

## 最终结构与导航

入口 `#legacy`；可刷新章节为 `#legacy/prologue`、`road`、`relay`、`entrust`、`answer`、`epilogue`。旧 `#entrance-legacy` 归并为正式入口。

| 场景 | 呈现与边界 |
| --- | --- |
| 序章 · 九十年，回望来路 | 「征途未止」、双周年、既有山河艺术与真实问鼎广场；说明三个年代是主题串联，不是直接因果或组织承继。 |
| 第一章 · 精神之路 | 一条红色道路连接信念、坚韧、求实、团结、人民；正文与图片左右交错，五维为2016年讲话的本站概括。 |
| 第二章 · 薪火相传 | 原创SVG从山路过渡为电路及芯片，1936/1956/2026节点；四个校史阶段与1980年计算机房照片。非实际地理路线或工作电路。 |
| 第三章 · 国家大事，千万尽力 | 蒋葆增真实肖像与八字书法并列，生平三段、真实无人机现场；排印明确不是本人手迹。 |
| 第四章 · 我的青春答卷 | 选词、解释、自由书写、本机生成、完整图片预览、下载/复制/重写/跳过，均有实际功能。 |
| 尾声 · 山河已新，征途未止 | 真实下沙南大门全幅画面、面向未来的结束文案、重温伟大征程入口。 |

首页导航、展馆按钮、地图导航、人物馆导航均可进入。本章可以返回首页/地图/人物馆；当前「精神传承」有 `aria-current="page"`。浏览器回退/前进与章节焦点恢复已纳入测试。各馆保持挂载，方向变化不以 React key 重建；返回地图保留同一Canvas、唯一日期、筛选与原镜头。普通滚动不驱动历史日期。

精神之路仅复用以下事件，无新建事件、日期或坐标：

| 维度 | 事件ID |
| --- | --- |
| 信念 | EVT-015 抢渡湘江 |
| 坚韧 | EVT-051 翻越夹金山；EVT-059 右路军穿越草地 |
| 求实 | EVT-001 遵义会议；EVT-023 四渡赤水专题 |
| 团结 | EVT-076 红一、红四方面军会师；EVT-077 红一、红二方面军会师 |
| 人民 | EVT-009 半条被子相关军民故事 |

点击通过已有 `#map?event=ID` 选择对应节点并采用其原日期；不把两地会师合并，不把雪山环境图当草地实拍。

## 六个场景实际截图

以下为1440×900真实Chrome截图；包含自动化演示输入的图片不是用户提交内容。原图与Edge/1920版本均在 `output/playwright/legacy/`。

![序章](../output/playwright/legacy/chrome-1920-1440-prologue.png)

![精神之路](../output/playwright/legacy/chrome-1920-1440-road.png)

![薪火相传](../output/playwright/legacy/chrome-1920-1440-relay.png)

![前辈嘱托](../output/playwright/legacy/chrome-1920-1440-entrust.png)

![青春答卷](../output/playwright/legacy/chrome-1920-1440-answer.png)

![尾声](../output/playwright/legacy/chrome-1920-1440-epilogue.png)

## 新增素材与史实依据

完整机器登记：[媒体登记](../src/data/history/legacy/media-register.json)、[事实与编辑状态](../src/data/history/legacy/editorial-register.json)、[来源与正文](../src/data/history/legacy/content.ts)。原件在 `research/legacy_20261117/originals/`，页面使用同源 `/legacy-media/`，均进入dist。没有AI新增图、AI修脸或AI放大。

| ID | 素材、年代、来源 | 使用及核验边界 |
| --- | --- | --- |
| LEG-01 | 蒋葆增肖像，摄影年月/地点未注明；[电子科技大学成电新闻网2016年教授展](https://news.uestc.edu.cn/info/1003/7275.htm)，原图标题「蒋葆增.jpg」 | 339×489原字节，遗训场景；不伪称长征时期照片，不AI放大。 |
| LEG-02 | 下沙学校南大门，官网2017-08-17刊载、拍摄日未注明；[杭电校园胜景](https://www.hdu.edu.cn/2017/0817/c773a34788/page.htm) | 尾声；保留完整画幅，生成1920×1080 WebP展示副本。 |
| LEG-03 | 下沙问鼎广场，同为2017年刊载、拍摄日未注明；[杭电校园胜景](https://www.hdu.edu.cn/2017/0817/c773a34778/page.htm) | 序章；完整1920×1440 WebP，开篇背景允许裁切，大图完整查看。 |
| LEG-04 | 2026-10-16校庆无人机现场；[杭电2026-10-19报道](https://www.hdu.edu.cn/2026/1019/c720a301651/page.htm) | 遗训后段；实际查看包含人物头像、八字遗训和校园，1920×1026 WebP。 |
| LEG-05 | 1980年DJS-130计算机房；[杭电档案馆2025-06-19文章](https://dangan.hdu.edu.cn/2025/0619/c13300a280393/page.htm) | 薪火相传；439×443原字节，按相邻原图注定年，不把1979年设备交付日期当作拍照时间。 |

五份展示文件共1,212,438字节；三幅较大的现代影像转WebP质量0.84、最大宽1920，完整原件未覆盖。肖像和早期计算机房保持原字节。新素材全部保持 `pending / draft / permission-required`。用户授权本轮课程网站展示，不等于已取得独立公开转载许可；来源机构的官网公开可访问也不是授权证据。

复用五份原媒体：AST-0027湘江界首渡口现代遗址、AST-0080夹金山现代环境、AST-0002遵义作战室相关图（摄制年代/复原状况待考）、AST-0072会宁西关遗址（年代待考）、AST-0029湖南现代路线图。原图注、来源和审核记录不改。人民维度目前没有可核验的故事现场照片，明确使用地域示意图，没有补造「历史实拍」。

蒋葆增采用的证据是：杭电无人机报道明确首任院长、第一批真空管主要研制者、教育开拓者及遗训；[杭电历任校长](https://www.hdu.edu.cn/767/list.htm)列其任期1980.5—1982.12；成电教授展说明交通大学/麻省理工学院求学、成都电讯工程学院教学管理以及南京/杭州无线电工业院校筹建。未编造具体实验故事、私人对话或遗训形成过程。

1956/1980/2004依据[学校简介](https://intedu.hdu.edu.cn/12708/list.htm)，与[70周年校庆网「杭电记忆」](https://hdu70.hdu.edu.cn/)对照。校训依据[杭电校训介绍](https://www.hdu.edu.cn/news/2016/1028/c8410a189021/page.htm)；五个维度依据[2016年纪念讲话](https://www.cac.gov.cn/2016-10/21/c_1119765784.htm)，均说明本站解读边界。

## 青春答卷完整流程

1. 自愿选择笃学/力行/守正/求新/担当，原生radio可触摸及方向键切换。前四项来自校训，第五项是本站延伸。
2. 显示解释与输入区域，支持换行；现代浏览器按Unicode字素限制200，中文输入法在组合结束后裁切，兼容缺少Intl.Segmenter时按Unicode码点回退。
3. 点击「留下我的青春答卷」，空词/空文显示指引并聚焦；不强制完成，始终可以跳过。
4. 等待本地字体，Canvas只绘制文字、底色与原创线条，不读取跨域照片。字体请求失败时使用系统中文回退。输入作为纯文本处理，不注入HTML。
5. 生成1080px宽PNG；正文根据实测字宽换行，保留换行，画布高度随行数增加，正文与页脚分离；测试了200字和极端换行。展示完整图片，允许下载、打开原图和手机长按保存。
6. HTTPS/localhost使用Clipboard API；校园网HTTP与权限受限时使用原生复制后备，再失败仍显示可全选的完整纪念文字。Canvas导出失败可以重试，也可以先复制文字保存。
7. 重新书写保留已写文字；站内切换与旋转保留答卷。刷新清除；页面提前说明仅本次浏览保留，不写数据库、localStorage或用户档案。没有身份采集、评分、排名、宣誓、AI接口或文字上传。

Blob URL在替换/卸载时撤销；异步绘图有revision令牌防止过期结果写回。可视高度监听有清理；使用visualViewport处理软键盘缩小可见区域，未再建一套设备检测。

![纪念笺实际导出示例](../output/playwright/legacy/chrome-1920-1440-keepsake.png.export.png)

## 双端、输入与来源一致性

桌面1920×1080、1440×900；横屏模拟932×430、844×390、740×320、667×375；竖屏390×844旋转使用现有可跳过引导。横屏保留精神道路图文、肖像/遗训、校史和答卷左右构图；减少留白，不整体缩小桌面。有限高度通过自然滚动阅读全部正文，触摸入口至少44px，正文约16px，安全区域和动态视口有处理。

实际手机横屏截图（Windows浏览器模拟）：

![844横屏肖像遗训](../output/playwright/legacy/chrome-1920-844-entrust.png)

![667横屏书写](../output/playwright/legacy/chrome-1920-667-writing.png)

![740横屏纪念笺](../output/playwright/legacy/chrome-1920-740-keepsake.png)

完整命名：`{chrome,edge}-1920-{1920,1440,932,844,740,667}-{prologue,road,relay,entrust,answer,epilogue,writing,keepsake}.png`；1440/844另有五个精神路段近景；`*-keepsake.png.export.png`是真实下载文件。

本机、实际WiFi IP电脑、同IP手机横屏模拟均检查五份新图HTTP/MIME/解码/原件副本与dist哈希，五份复用图亦实际解码；HTTP下纪念笺生成与复制备用可用。研究目录、环境变量、Git和源码不作为静态资料公开。服务只展示生产dist。

这不是实体手机测试。iOS Safari、Android实机、地址栏/刘海、真实软键盘、系统下载交互、长按菜单、高DPR/低端性能及校园网隔离/并发，仍需人工检查。缩小视口和触摸协议只能作为模拟证据。

## 工程与回归结果

环境：2026-11-17，Windows、Node v24.21.0、Playwright1.65.0，实际Chrome157.0.8103.79与Edge157.0.4341.46。使用生产dist，不以Vite开发页面替代生产验证。

| 检查 | 结果及证据 |
| --- | --- |
| 既有首页/全屏/地图/手机展陈/人物馆/导航 | Chrome+Edge 114/114，`original-and-legacy-results.json`中的既有模块项 |
| 新章完整专项，含六档视口、导出、失败、隐私、历史关联、旋转、同一地图及筛选 | Chrome+Edge 28/28，`final-legacy-results.json` |
| 844/740横屏遗训收尾 | Chrome+Edge 4/4，`short-landscape-results.json` |
| 补齐书法字形后的1440/740及最矮屏完整肖像/八字标题 | Chrome+Edge 4/4，`final-font-and-height-results.json` |
| 工程文件检查 | `node scripts/verify-setup.mjs`通过，最终日志`setup-validation.log` |
| 严格类型及生产构建 | `npm run typecheck`、`npm run build`通过；`final-build.log` |
| 原数据与媒体 | 七份原JSON、人物源数据与依赖保持；五份新图原件/展示/dist哈希一致，`integrity-audit.json` |
| 字体 | 所有书法标题与五关键词字形存在，name/CFF均为Legacy命名，OFL与NOTICE进入dist；`font-audit.json` |

独立覆盖为142项；收尾复测是重复验证，不累加成新功能数量。完整142项首轮全部通过，保存在`original-and-legacy-results.json`，分文件统计为`regression-summary.json`。命令使用现有脚本：`npm run test:browser -- tests/legacy.spec.ts tests/homepage.spec.ts tests/home-fullscreen.spec.ts tests/history-map.spec.ts tests/people-round2.spec.ts tests/people-round2-navigation.spec.ts tests/mobile-landscape.spec.ts --project=chrome-1920 --project=edge-1920`。收尾仅重跑相关第四章专项与对应矩阵；没有声称运行仓库所有测试文件。

首次字体字形审计发现「精神之路」中的「之、路」落到回退字体，已加入真实书法子集并重新构建、截图、复测，最终缺字为0。最矮740×320遗训曾在首屏下方显示第二行，已缩短留白/肖像并顶对齐，新增断言确认完整肖像和八字标题同时在视口内。

生产构建129模块；新章懒加载JS约33.8KB、CSS约24.8KB，未增加依赖。既有地图分包大于500KB警告仍在，没有本轮Lighthouse/真实INP/低端手机性能结论，也未执行D14最终清洁安装。本轮不等于全站所有遗留项均已关闭。

本机预览：[精神传承](http://localhost:4174/#legacy)；校园网同网段：[精神传承](http://10.75.233.125:4174/#legacy)。最终专项以`LAN_TEST_URL=http://10.75.233.125:4174`核对现有dist服务；本轮自启4173测试服务在测试结束后停止，既有4174服务保留。换网后地址可能改变，实体手机需由用户连接校园网再验证。

## 本轮新增与修改文件

新增业务：`src/features/legacy/{LegacyPage,YouthAnswer,RouteCircuit}.tsx`、`keepsake.ts`、`src/styles/legacy.css`；新增正文/来源/登记：`src/data/history/legacy/{content.ts,media-register.json,editorial-register.json}`；新字体：`src/assets/fonts/legacy-{title,serif}.woff2`及manifest；新静态媒体：`public/legacy-media/`五文件；OFL许可：`public/legacy-font-licenses/`。

导航增量修改：`src/App.tsx`、`src/components/Navbar.tsx`、`src/sections/Entrance.tsx`、`src/features/history-map/HistoryMapPage.tsx`、`src/features/people/PeopleMemorial.tsx`。测试：新增`tests/legacy.spec.ts`，更新`tests/homepage.spec.ts`中的待开放断言。没有重构其他人物或历史展陈。

工具与证据：`scripts/prepare-legacy-font.py`、`scripts/prepare-legacy-media.mjs`；`research/legacy_20261117/`的下载脚本、原始资料缓存、五原图和校验脚本；`output/playwright/legacy/`的实际截图、测试JSON、下载PNG、完整性审计和`changed-files.json`差异清单。相关README、任务看板、设计/交互/测试/史料规范增量更新；本报告是课程报告可引用的实施与验收材料。

## 后续人工验收与动效接口

需人工确认：六场景视觉、本站原创历史解读与校史用词、蒋葆增人物和遗训采用、五份新影像与原图的关联、摄制年代和独立公开转载条件、人民维度采用地域图的范围。编辑状态仍为draft，史料仍pending；不宣称已完成学校官方审核或全站最终验收。

高级路线演变、电子信号、环境光/滚动转场、全站统一动效均暂缓。已保留六场景 `data-legacy-scene` / `data-motion-slot`、各精神路段类名、SVG `.legacy-route-path`（标准化pathLength）与 `.legacy-circuit-traces`；后续可在原结构内增加GSAP，但同一属性只能由一个动画系统管理。当前仅选词反馈、按钮反馈与结果淡入；reduce下全部静止，正文始终可读，无新播放时钟或滚动劫持。
