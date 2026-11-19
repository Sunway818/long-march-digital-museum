# 全站动效统一与最终视觉打磨

2026-11-18，按新任务授权实施。回退检查点：`output/checkpoints/motion-20261118-221725/`，包含原src/public/docs/tests/scripts及工程配置、素材哈希。保持用户已有未提交内容，不提交或推送。

## 开发前审查

| 页面/组件 | 原有机制 | 发现与取舍 |
| --- | --- | --- |
| Hero / heroAnimations | GSAP matchMedia、intro、ScrollTrigger微视差 | 保留静态构图与初显；补后台有限时间线处理；避免全站切页重复长片头 |
| ambientAnimations / flagRenderer | 一个累积时间/GSAP ticker，驱动WebGL2旗面、SVG雾层与朝阳；IO、visibility、pause、abort/destroy | 保留已认可旗面幅度和素材。手机绘制频率可降至30Hz；不增加第二环境时钟 |
| App | hash路由、各章访问后保留挂载，hidden切换、Suspense | 原来四章直接切换，缺统一节奏；采用可取消的短遮幕，不延迟hash或锁定输入 |
| MapCanvas / useHistoryClock | 唯一历史RAF、20Hz日期发布、GeoJSON日期裁切、原生MapLibre镜头 | 原路线推进可复用，不补造动画坐标。显式选节点时需结束旧跟随；后台结束未完成镜头 |
| HistoryPanel / HistoryArchive | 独立资料及原生dialog，保留地图实例 | 补一次节点提示、详情显现及档案开合；关闭后恢复焦点与原地图状态 |
| PeopleMemorial / usePortraitTransition | 首次2.5秒、16秒环境光；真实contain图像测量、WAAPI共享肖像及取消 | 复用FLIP；改善焦点→移动的速度衔接、短回程、浏览器返回与清理。暖光缺少清晰分层 |
| LegacyPage / RouteCircuit | 原生独立滚动，五节点红线、静态SVG、完整动效接口 | 新增与阅读同步的红线、只播放一次的图文/三时代路线演变；内容默认可读，不靠触发器解除隐藏 |
| YouthAnswer / KeepsakePreview | 本机Canvas实时完整绘制、Blob PNG、CSS短淡入 | 页面生成表现与图片像素分离；完整PNG从最终Canvas导出，不截图动画帧 |

现有风险：移动端多层透明叠加、整幅滤镜、全部元素同时动画、各模块独立硬编码节奏、有限动画在后台继续及快速导航残留。采用transform/opacity、少量SVG属性、批量读取几何、事件驱动刷新；不新增Lenis/Motion或任何运行时依赖。

## 实施与验证

按基础规范→人物馆→精神传承→地图/档案→首页/导航→双端回归顺序增量实施。历史正文、路线坐标/日期/归属、真实素材及审核元数据不因本轮动画修改。

## 实际使用的Skill与依据

- `frontend-design`：沿用已认可字体、真实影像与构图，把显现、聚焦和空间连续性作为动效理由，不重做页面。
- `ui-ux-pro-max`：实际执行本地查询 `animation interruptible reduced motion performance --domain ux -n 4`；采用语境时长、减少动态、transform/opacity及少量关键运动，不采用泛用弹簧建议。
- `cinematic-scroll-storytelling`：阅读现有版本，采用一次显现、阅读进度、图层顺序及生命周期清理；按项目约束继续原生滚动，不安装Lenis、不开启pin或滚动劫持，不套用预加载器和卡片堆栈。
- `playwright`：读取Skill；实际使用用户指定的工程既有 `npm run test:browser` 和已安装的Playwright/Chrome/Edge，未另装或声称调用Playwright CLI。依据角色/可见状态操作并保存真实截图、PNG及录屏。
- `web-design-guidelines`：重新获取[当前官方规则](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md)，审查本轮新增状态、焦点、暂停/减少动态与性能。SVG描线是核心叙事所需的少量矢量属性更新；个人文字按项目隐私契约留在本次浏览中。

实现生命周期参照[GSAP context](https://gsap.com/docs/v3/GSAP/gsap.context()/)、[Web Animations cancel](https://developer.mozilla.org/en-US/docs/Web/API/Animation/cancel)、[MapLibre Map](https://maplibre.org/maplibre-gl-js/docs/API/classes/Map/)；没有引入第三方运行时或CDN。

## 共用规范与四章变化

`animations/motion.ts`统一180ms反馈、320ms悬停、520ms显现、380ms档案进入、750ms地图定位、680ms跨章过渡、640ms肖像移动和 `cubic-bezier(.22,.65,.25,1)`。有限WAAPI动画按元素/用途替换，完成/取消后释放；全局只增加visibility与媒体查询监听，不增加常驻RAF。CSS后台状态冻结装饰动画；减少动态时回到静态完整画面。

| 范围 | 实际行为与参数 |
| --- | --- |
| 首页 | 原WebGL2旗面、672×536缓冲、16px幅度及素材保留；同一个环境时间控制远/近/局部雾，朝阳改为9.6秒完整往返。粗指针绘制上限约30Hz，累计时间仍连续。后台暂停初显时间线、离开首页结束未完成初显，返回不重播长开场 |
| 开启征程/四章导航 | 焦点、鼠标或触摸预取本地地图分包；hash立即响应，进入后800ms（首页出发）/680ms暗色遮幕渐退。遮幕不截获触摸/键盘；快速导航替换旧动效，无两章叠加。慢资源显示真实加载文字，失败保留返回首页及重新加载入口 |
| 纪念馆 | 保留约2.5秒首次入场；空间暖光、固定展灯、明确选中光三层。广域环境光14秒，触摸15秒；展灯保持静态，人物照片不闪烁。姓名/图像支持hover、focus和明确点击/触摸反馈 |
| 共享肖像 | 打开160ms聚焦＋640ms移动＋120ms交接；返回90＋520＋120ms。移动从当前实际transform继续，按完整contain照片测量，不拉伸外框。正文约520ms错后显现；浏览器前进/后退同样接续，重复点击、Escape、旋转、后台、离页清理副本与待办 |
| 精神传承开场/尾声 | 原真实影像上仅叠加低透明暖光，14秒/触摸15秒；标题约520ms柔和显现，双周年间隔180ms；阅读提示小幅移动三次。新增44px「暂停光影」按钮；光影在离开视口、离章或后台暂停 |
| 精神之路 | 以独立滚动容器53%阅读线计算红线比例，五节点随进度标记；回滚、hash跳转、字体/图片加载及旋转都重新同步。滚动只预约一个RAF，没有常驻循环，也不改变历史日期。图像淡入与文字7px以内横向接续各一次，不预先永久隐藏正文 |
| 蒋葆增/无人机 | 真实肖像约700ms显现、静态低透明暖聚光；八字遗训约850ms整体遮罩显现，仍明确为字体排印。无人机原图先显，正文错后160ms，不模拟视频或增加图案 |
| 青春答卷 | 选词180ms反馈；实时文字立即完整重绘，不对每个字启动动画。选词时180ms低幅交替显现；生成后约1秒整体显影、保存操作520ms显现。按钮可立即保存或重写，图片字节来自独立最终Canvas，完全不读取动画帧；官方校标、双周年、隐私、200字/IME、复制和保存后备保留 |
| 地图 | 原唯一历史RAF、20Hz日期发布、总览/时间裁切、各军/接应线路不变。显式节点定位750ms、单个节点一次扩散提示、详情520ms接续；主动拖动结束镜头跟随。后台/离章停止未完成镜头，不重新初始化地图 |
| 历史档案/毛儿盖/赤水专题 | 原生dialog380ms进入、260ms返回，纸面正文520ms交替，背景遮罩随开合变化。事件切换可替换待关闭任务；焦点恢复、地图中心/zoom、时间轴与部队仍按原契约保留 |

选历史节点现在会关闭旧跟随，让显式定位独占镜头，但保留此前明确目标。更新原 `delivery-sprint.spec.ts`：新增关闭跟随/选中事件断言，随后重新开启，继续断言黄色目标保留及镜头抵达自身已展开路线，未删除原跟随验证。此项覆盖旧版本“点击事件仍保持跟随”的验收口径。

## 三时代SVG的实际演变

沿用原主路径几何与米白/暗红/古金体系；这仍是艺术示意，不是历史地理路线或可工作的电路。约3.65秒完成一遍，紧凑横屏加速至约3.1秒，宽高比及横向三年代构图不变：

1. **1936，0—1.25秒**：暗红主路从山川自然折转处开始描绘，行军节点明确；淡色底路保持连续关系。
2. **1956，1.25—2.4秒**：推进至规则45度走线，地形减弱；历史节点转为古金轮廓，焊盘/过孔及辅助走线依次显现，信号由暗红变暖金。
3. **2026，2.4—3.65秒**：主线接入芯片、芯片及分支逐渐完整，青年担当显现；信号淡出，保留完整终态，不循环。

`useLegacyMotion`使用已有GSAP的局部context与原生IntersectionObserver；每段显现只触发一次，离页revert。快速滚走或进入后台时有限叙事落到完整终态；返回保持完整静态画面。减少动态模式直接展示完整图形。没有安装DrawSVG/MorphSVG，也没有修改真实地图坐标来实现“变形”。

## 手机性能与无障碍

沿用现有compact/safe-area/动态视口和横屏并列体系，不隐藏历史影像、正文或控件。触摸设备：首页昂贵绘制约30Hz、环境光节奏放慢、没有鼠标视差或新增实时模糊；主要页面遮幕、人物聚焦、精神路线、三时代SVG和纪念笺功能保留。有限动画可取消，底层最终状态默认可读；没有动画结束事件才能使用功能的依赖。环境光可暂停，后台冻结，reduce跳过装饰。SVG描线只在一次短时间线内更新。

## 文件与分阶段证据

新增 `src/animations/{motion,chapterLoaders}.ts`、`src/components/ChapterBoundary.tsx`、`src/features/legacy/useLegacyMotion.ts`、`src/styles/motion.css`、`tests/{motion,motion-final}.spec.ts`。

修改 `src/{App,main}.tsx`、`src/animations/{heroAnimations,ambientAnimations}.ts`、`src/components/WoodenCta.tsx`、`src/features/people/PeopleMemorial.tsx`、`src/features/people/usePortraitTransition.ts`、`src/features/legacy/{LegacyPage,RouteCircuit,KeepsakePreview}.tsx`、`src/features/history-map/{HistoryMapPage,MapCanvas,HistoryPanel,HistoryArchive}.tsx`、`src/styles/{people-memorial,legacy}.css`；更新 `tests/delivery-sprint.spec.ts` 的新镜头所有权口径、`tests/mobile-landscape.spec.ts` 的惯性后真实命中选点、`tests/people-recording.spec.ts` 的浏览器证据命名。文档为本报告、任务看板、设计系统、交互、架构及测试计划补记。审计/画廊脚本与原始任务书在 `research/motion_20261118/`。

- 人物阶段：构建通过，Chrome11/11；`stage2-results.json`、`stage2-build.log`。
- 精神传承阶段：正常动效1440/844两项通过，实际记录三阶段与完整导出；`stage3-results.json`。
- 地图阶段：初轮15/16，唯一旧跟随断言与新任务口径冲突，原始结果及截图保留在 `stage4-initial-*`；新断言及重新开启目标验证随后通过。
- 全站整合预检：Chrome5/5，桌面/横屏四章往返、后台/reduce、历史时钟及分包失败后备；`stage5-pilot-results.json`。
- 全站现有及新增测试：Chrome/Edge22文件、302项全部执行，首轮300通过、2项同一触摸选点用例超时；全部结果保留在 `full-302-initial-results.json`。不是声称首轮302/302通过。

## 最终验证结果

2026-11-18在Windows实际Chrome/Edge、Node v24.21.0、Playwright1.65.0执行。最终生产构建（含严格类型检查）成功，136模块；`build-final.log`。无新增依赖，原包清单/锁文件/构建配置保持字节一致。

| 检查 | 实际结果 |
| --- | --- |
| 全站首轮 | 22文件302项，300通过、2项失败；无跳过。涉及原首页/旗面、历史数据/地图/档案/全部展厅、人物馆、精神传承、内容一致性及新增动效 |
| 触摸用例定位 | 两个浏览器在同一用例中，松开双指后尚有惯性，旧选点只按包围盒选了随后被其他节点/重置按钮遮挡的元素；平移/缩放断言此前已通过。保留 `full-initial-failures/`，未用force或跳过触摸来通过 |
| 最终整合复测 | 24/24，`final-24-results.json`。等待镜头稳定，选 `elementFromPoint` 实际命中的单事件节点后，双浏览器原始CDP触摸、黄色跟随与手势恢复通过。另含正常动效桌面/横屏、共享肖像/旋转、reduce及无WAAPI、慢速资源取消、后台终态、地图取消载入后初始视野、光影暂停、实际录屏 |
| 人物短聚焦竞态 | 实际复现“聚焦毛泽东时改选周恩来，旧160ms回调又跳回毛泽东”。单靠hash监听不足；最终在布局提交及定时器触发前检查最新地址，并接续浏览器提前抵达的目标。`portrait-race-final-2-results.json`为Chrome/Edge2/2，包含新人物优先、90ms关闭窗口内浏览器返回、零残留副本；初轮与首版修复失败记录均保留 |
| 完整PNG | 六档正常动效期间实际下载1080px PNG；旧预览/生成/落盘校标像素、200字/IME/长文及所有失败后备在全站原测试中通过。页面显影不影响导出字节 |
| 同源与素材 | 两浏览器各在localhost、WiFi IP桌面和触摸模拟中验证91张图片及本章素材；102份历史数据/图片/字体/旗面/Canvas导出等文件原字节保持，所有旧文件保留，原艺术主路几何不变；`integrity.json` |
| 短期生命周期 | Chrome/Edge各24轮快速跨章，历史时钟不追赶，残留肖像副本0；强制GC后JS堆净增约1.54/1.70MiB。是含暖机的短样本，不能据此宣称零泄漏或长期稳定；原始 `*-lifecycle.json`保留全部采样及合成visibility说明 |
| 工程与审查 | `node scripts/verify-setup.mjs`、严格类型、生产构建及相关差异审查通过。新增按钮具原生语义/44px目标/可见焦点，环境光可暂停；SVG描线与文字遮罩按本任务的核心叙事需求保留 |

全站命令：`npm run test:browser -- --project=chrome-1920 --project=edge-1920`，设置 `LAN_TEST_URL=http://10.75.233.125:4174`、`LEGACY_EVIDENCE_DIR=output/playwright/motion/legacy-regression`。用例内部另建1440桌面和四档触摸上下文，没有把未运行的1366项目写成已执行。24项与2项为相关修复/收尾复测，不累加为更多全站独立功能数。所有已识别失败均已解决；不把失败的原始报告覆盖为成功。

收尾修复减少动态效果恢复时重播开场、人物落位后父层重复淡入；补齐载入中的返回入口，并验证迟到资源不会覆盖当前页、地图首次视野保持正确。相关专项已在生产构建验证。此后只对人物短聚焦回调仲裁作修改并完成双浏览器复测，其他模块未再扩展。

## 实际截图、PNG与录屏

- [六档视口阶段截图总览](../output/playwright/motion/gallery.html)
- [Chrome实际人物馆录屏](../output/playwright/motion/chrome-1920-light-and-portrait.webm)、[Edge实际录屏](../output/playwright/motion/edge-1920-light-and-portrait.webm)：各555帧、1280×720，浏览器实际画面，包含完整光照周期及档案往返，不是真机录屏。
- [1936阶段](../output/playwright/motion/chrome-1920-1440-pcb-1936.png)、[1956阶段](../output/playwright/motion/chrome-1920-1440-pcb-1956.png)、[2026阶段](../output/playwright/motion/chrome-1920-1440-pcb-2026.png)、[完整终态](../output/playwright/motion/chrome-1920-1440-pcb-complete.png)
- [844横屏PCB终态](../output/playwright/motion/chrome-1920-844-pcb-complete.png)、[共享肖像移动中](../output/playwright/motion/chrome-1920-844-people-flight.png)
- [蒋葆增与八字遗训](../output/playwright/motion/chrome-1920-1440-jiang-final.png)、[横屏遗训](../output/playwright/motion/chrome-1920-844-jiang-final.png)
- [纪念笺显影场景](../output/playwright/motion/chrome-1920-1440-keepsake.png)、[实际下载PNG](../output/playwright/motion/chrome-1920-1440-export.png)

正常动效1920×1080、1440×900、932×430、844×390、740×320、667×375均有双浏览器交互与阶段图；底层图片/文案没有为了性能而隐藏。

新动效截图命名为 `output/playwright/motion/{project}-{width}-{road,pcb-1936,pcb-1956,pcb-2026,pcb-complete,keepsake,people-wall,people-flight,home}.png`；`*-export.png`为实际下载的纪念笺。人物录屏由浏览器实际CDP帧经MediaRecorder编码，按真实浏览器项目分别命名，不使用生成影像。生命周期JSON注明合成visibility事件，不把它写成真实手机后台测试。

## 交付边界

验证均在Windows实际Chrome/Edge执行；手机横屏为触摸/移动视口模拟，不等于iPhone Safari/Android真机、系统地址栏/键盘/保存或校园网客户端隔离。仅检查短周期堆内存变化与DOM/动画清理，不宣称完成长期内存、真实GPU或低端机帧率验证。既有地图大分包警告仍保留，未借动效任务做架构拆包。史料与媒体的pending/draft/版权状态不升级。

本轮结束后不新增大型功能。
