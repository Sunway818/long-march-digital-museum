# 英雄人物纪念馆第二轮实施记录

2026-11-17。保留已认可的黑金展墙、书法、完整历史影像与四列陈列秩序；本轮目标16人四排，全部档案扩充为可追溯草稿。原工作区大量未提交成果不重置、不覆盖无关内容。

## 实施前规范与取舍

实际读取frontend-design、ui-ux-pro-max、web-design-guidelines与Playwright说明。前两者用于延续既有令牌和阅读宽度、可打断动效、44px触摸与方向区分；网页规范用于键盘/焦点/加载降级审查。UI UX本地执行`animation interrupted continuity --domain ux`与`effect cleanup animation --stack react`，采用reduce、即时反馈、effect清理；其装饰循环默认禁用建议与用户明确要求的16秒环境光不同，按用户要求保留循环并提供暂停。不新增依赖、字体家族或场景框架。当前技能目录没有专门的历史研究Skill；依据项目历史来源规范，直接核对权威网页与原图图注。浏览器测试沿用项目要求的已建立Playwright脚本，模拟和真机分开记录。

视觉令牌沿用：展墙#151412、暗红#6e302a、标题#f1ece2、暖金#c1af8e、正文#d4cec2。光照集中在上方漫射和陈列平面，静态照明始终保留；一个16秒慢周期调节全墙，不逐幅闪烁。标题/姓名继续原书法与思源宋体，新增文字重新生成既有字体子集。

版式：四列肖像墙自然纵向延展；档案左侧完整肖像/基本信息，右侧导语、分期职务、历史正文与2—4个关键瞬间。桌面和横屏保留并列，竖屏单列。正文限宽，章节导航可回到目录，来源收于末尾折叠目录，段内只保留简短出处编号。

转场采用原生Web Animations + FLIP副本：按图片object-fit:contain实际显示区域测量，保持照片比例，以同一影像副本连接墙面与档案；聚焦、肖像位移与文字淡入重叠，约800ms，返回更短。无API/图片失败时淡入降级；reduce立即切换。每次操作有可取消的生命周期，快速切换、ESC、后台和离页清理副本/计时，不重建地图。

## 实际数据与正文

16人仍采用四列、现在四排，自然向下滚动，不压缩成一屏小卡。每人包含生卒/籍贯/组织、分期职务、导语/生平提要、3章独立叙事、2个关键瞬间、明确标记的本站解读、完整肖像及折叠来源。48章和32个瞬间不是复制同一篇文章：各人的任务、所属部队、年份与叙事重点分别整理。研究内容分成4个文件，数据与JSX分离。

字数只计导语、生平、正文和瞬间的中文字符，不计标题、资料目录及重复图注。测试生成的逐人记录见`output/playwright/people-round2/content-audit.json`。

| 人物 | 中文字符 | 叙事重点 |
|---|---:|---|
| 毛泽东 | 989 | 战略判断、遵义后的分工、毛儿盖北进方针 |
| 周恩来 | 927 | 转移准备、谈判组织、纠错与执行 |
| 张闻天 | 877 | 决议起草、中央分工、瓦窑堡衔接 |
| 朱德 | 916 | 总部指挥、随左路军行动、1936年北上 |
| 陈云 | 939 | 遵义传达、渡河组织、离队与长征记录 |
| 刘伯承 | 921 | 后卫/参谋、皎平渡、彝海与先遣任务 |
| 王稼祥 | 941 | 军事政治领导、会议选择与指挥分工 |
| 博古 | 955 | 前期领导责任、遵义检讨与会后工作 |
| 彭德怀 | 879 | 湘江阻击、娄山关回师、陕甘支队 |
| 聂荣臻 | 889 | 政治工作、先遣/大渡河与接应会师 |
| 林彪 | 902 | 红一军团、乌江与编组变化，限定长征时期 |
| 贺龙 | 865 | 两军团集中行动、乌蒙回旋与1936年北上 |
| 任弼时 | 881 | 两军团沟通、政治组织与甘孜会合 |
| 徐向前 | 878 | 嘉陵江、包座、分路和再次北上 |
| 徐海东 | 878 | 独树镇、鄂豫陕、永坪及红十五军团 |
| 程子华 | 930 | 转移指示、根据地创建、军长至政委 |

类型增量：`PersonResearch`记录基本资料及其sourceIds、appointments分期任职、chapters、moments和reviewNote；`PersonMoment`记录时间/地点/背景/行动/结果/sourceIds及可选mapEventId。`Portrait`补充place；稳定人物ID和原影像ID不改。`people.ts`合并首轮8人与新增8人的元数据，再组合研究正文；首轮原文本仍留在原数组和开发前检查点，未覆盖其他已审核历史事件正文。全部16份publicationStatus仍为draft。

## 新增原图与来源核对

新增7幅原图共574466字节，服务8人（贺龙/任弼时共用完整三人合影）；全馆16人使用15幅不同原图。所有新增原件逐张实际查看，原文件与public/dist字节以SHA-256校验，不裁切、不重编码、不抹水印、不使用AI修复。墙面/档案仅CSS灰度与亮度统一，完整影像查看保留原色。文件清单/原URL/精确定位/日期/地点/许可/尺寸/哈希见`src/data/history/people/round2-media.json`；原登记`media-register.json`未替换。

| 原图ID | 使用人物/来源 | 图像性质与边界 |
|---|---|---|
| POR-PENG-01 | 彭德怀；共产党员网《彭德怀的本色》 | 原图注红军时期；不能细化为1934—1936某日，地点不详 |
| POR-NIE-01 | 聂荣臻；人民网党史人物稿 | 1938年9月蛟潭庄骑马全身照，明确为长征以后 |
| POR-LIN-01 | 林彪；中共党史资料中心生平 | 129×170资料肖像，原文无摄影年月/地点，年代待考，不称长征照 |
| POR-HE-REN-01 | 贺龙、任弼时；共产党员网贺龙资料 | 原图注长征时期，含关向应；完整保留合影，具体年月地点不详 |
| POR-XUX-01 | 徐向前；陕西省档案馆《党的领导人在延安》 | 1937年延安；徐向前、徐海东两张独立照片并列图版，不是同一现场合影 |
| POR-XUH-01 | 徐海东；中央党史和文献研究院《军事家徐海东》 | 原图注明1935年到达陕南时留影，保留全身及原图构图 |
| POR-CHENG-01 | 程子华；人民网七一导航生平 | 209×256资料肖像，摄影年月/地点未注明，不推定长征年代 |

28项新来源合并原有来源目录（共45项），以中央党史和文献研究院、人民网党史/纪念网、共产党员网/新华社、陕西省档案馆、中共安康市委党史研究室为主。`round2-sources.ts`逐条记录URL、机构与采用段落，章节和瞬间均引用稳定sourceId；不是把官网主页当作证据。研究缓存和获取脚本在`research/people_20261117`，不对网站开放目录。几个候选页面请求失败（湖北任弼时页、两个彭德怀候选图源）未被用作已经核实的依据，采用上表可取得并实际查看的原件。

旧C-02/W-02/B-01及L-03保持，L-02缺件记录保留，不将另找照片冒用其编号。新图仍pending/draft，独立公开再授权待确认；电脑与校园网显示同样内容，不依设备/hostname重新限制。

交叉核对的边界：徐向前生平简历将红二、四会合写在1936年6月，贺龙生平和新华社任弼时稿采用7月初，本馆说明1936年夏并采用7月初口径；程子华材料有1934年6月“任职”和“决定派遣”的差别，写赴鄂豫皖后任军长，不补造到任日；军事三人指挥小组形成的具体会议口径不同，写遵义之后的后续调整，不全部提前到遵义会议当天；陈云1935年离队后不再叙述为随全军到陕北；朱德、刘伯承不套用中央1935年北上终点；徐海东/程子华的1934出发与1935年9月职务分别标明。所有这些处理均未改地图原始日期与坐标。

## 导航、共享肖像与地图状态

地图顶部现有导航直接增加“英雄人物”，人物馆保留“长征地图”，沿用hash导航和已挂载实例。查出两项旧规则：宽度断点把全部地图导航a隐藏，compact层补充44px可见入口；`MapCanvas`原来在active恢复时总执行fit旧camera，导致缩放退回。现在保存已应用camera.key，重新激活只resize，只有新的明确camera请求（事件定位/重置）才fit。首次/重试加载仍正确定位，跟随算法及路线坐标不改。

共享肖像以contained图像的实际宽高和位置测量，原生WAAPI完成约180ms聚焦、600ms位移及100ms交叠淡出，正文在过程中淡入，总约880ms；关闭80ms正文退场、480ms肖像回归与100ms收尾，总约660ms。不同人物之间阅读切换使用淡入，不把上一人的面孔飞向下一人。照片副本不参与可访问性树且不拦截触摸；ESC/关闭恢复墙面滚动和原链接焦点。快速重复、后台、离开、resize和reduce均取消旧动画与计时。无API或无有效图像时直接导航并稳定阅读。

光照：静态顶部漫射、中心/边缘纵深、肖像局部柔光；一个16秒全墙暖光周期，不按人物随机闪烁。暂停冻结动态层、保留静态层；聚焦时其余人物变暗，选中人保持清晰且增强局部暖光。浏览器在周期0/8秒、暂停、聚焦分别截图并检查状态，不以样式数值代替视觉复核。

次级任务在核心首轮5项测试通过后实施：关键瞬间仅在数据有mapEventId时显示低调的“在长征地图中查看”，复用原事件ID和现有select/reveal/date/locate，不生成地图实体。对日期仅精确到月的原地图事件（如EVT-012），仍使用原数据的月首时间锚点与精度说明，不能将其当成战斗发生于月首。没有可靠映射的瞬间省略入口。

## 修改文件

- `src/features/people/PeopleMemorial.tsx`、`usePortraitTransition.ts`：可取消共享肖像、ESC/返回、墙面滚动与首入状态。
- `src/features/people/PersonArchive.tsx`、`types.ts`：持续双栏阅读、基本资料/任职/章节/瞬间/来源/地图入口及类型契约。
- `src/data/history/people/{people,sources,additional-people,round2-sources,research-helpers,central-leadership,organization-records,field-commanders,other-armies}.ts`及`round2-media.json`：16份独立研究稿、来源和新增影像登记。
- `src/features/history-map/HistoryMapPage.tsx`、`MapCanvas.tsx`、`src/styles/compact.css`：馆间导航、明确定位与返回的边界、紧凑导航可见性。
- `src/styles/people-memorial.css`：原视觉的暖光、共享副本、双栏长文与触摸；未重设首页或历史专题。
- `scripts/prepare-people-font.py`、`src/assets/fonts/people-{title,serif}.woff2`及两个manifest：复用原书法/思源宋体源，补16人标题与新增中文，约16.2KB/444.2KB，无新字体家族。
- `public/people-media/`7图；`research/people_20261117`的原图/原网页/获取登记脚本/开发前检查点不进入dist。
- `tests/people.spec.ts`、`people-round2.spec.ts`、`people-round2-navigation.spec.ts`、`people-recording.spec.ts`及`tests/homepage.spec.ts`的16人断言；README、相关规范/任务板和本文。

## 视觉与无障碍收尾

实际按[Vercel官方Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md)检查，并参考[MDN Element.animate](https://developer.mozilla.org/en-US/docs/Web/API/Element/animate)核对原生动画边界：原链接保留修饰键/新窗口能力，来源目录原生details且段内按钮可聚焦对应条目；有skip-link、标题层级、44px操作、visible focus、独立滚动、安全区/dvh及方向区分；照片含alt和原比例尺寸、后两排lazy、失败文字降级；dialog原图查看可ESC并恢复焦点；所有自动转场有reduce与生命周期清理。没有新增运行时依赖、transition:all、逐字正文动画或全屏模糊。

响应式沿用compact数据和既有条件：横屏width≤1024且aspect-ratio≥4/3时保持四列/双栏、适配有限高度和16px正文；竖屏width≤700才单列档案。桌面默认双栏。新增地图链接在compact中显式显示，不再受旧宽度规则隐藏。需由实际矩阵和截图确认，不能以CSS存在即视为通过。

## 测试、截图与人工审阅

环境：2026-11-17 Windows / Node v24.21.0，实际Chrome157.0.8103.78、Edge157.0.4341.46进程，Playwright1.65.0；工作区基线HEAD为f481923且包含用户大量未提交成果，本轮未提交、重置或推送。桌面1920×1080/1440×900；手机模拟932×430、844×390、740×320、667×375及390×844竖屏旋转；CSS像素不等于真机物理分辨率。

最终按独立检查范围共105项通过，不把开发中重复跑次累加为新覆盖：

| 检查组 | 结果 | 实际证据（`output/playwright/people-round2/`） |
|---|---|---|
| 人物馆数据/动画/阅读/来源/LAN/四档横屏/地图往返 | Chrome+Edge 40/40 | `final-people-results.json` |
| 横屏正常动画、触摸返回、转场旋转 | Chrome+Edge 2/2 | `recording-and-touch-results.json`中的触摸项及`edge-touch-motion-results.json` |
| 原首页/全屏/全部历史展厅、地图日期与路线层级 | Chrome+Edge 54/54 | `original-modules-results.json` |
| 四军跟随、多军目标、黄色播放/空点/重置、拖缩与触摸协议 | Chrome+Edge 8/8 | `map-camera-regression-results.json` |
| 实际浏览器录屏产生并捕获图像帧 | Chrome 1/1 | `recording-and-touch-results.json`中的录屏项、`recording.json` |

`node scripts/verify-setup.mjs`、`npm run typecheck`、`npm run build`通过。生产构建123模块；人物馆独立懒加载JS约112.6KB、CSS约21.9KB，无新增依赖；既有地图大包仍有>500KB提示。localhost、WiFi IP电脑、同IP手机横屏模拟均逐人物请求原图，HTTP200/MIME/解码/原件与dist SHA一致，15个独立图文件覆盖16人。当前WiFi预览`http://10.75.233.125:4174/#people`，换网需重新确认地址；只提供dist，不开放研究或项目目录。

均通过既有`npm run test:browser -- ... --project=chrome-1920 --project=edge-1920`运行：人物组选择`people.spec.ts people-round2.spec.ts people-round2-navigation.spec.ts`；原模块选择`homepage.spec.ts home-fullscreen.spec.ts exhibit-landscape.spec.ts history-map-consistency.spec.ts map-refinement.spec.ts`；相机组选择`delivery-sprint.spec.ts history-map.spec.ts mobile-landscape.spec.ts`并只匹配四军单独/黄色播放/触摸协议/真实缩放测试；正常动效单独匹配相应测试，录屏仅Chrome。LAN设置`LAN_TEST_URL=http://10.75.233.125:4174`。

首轮核心5/5后才增加段内地图入口。开发中30项28通过/2项误用英文Zoom in，见`first-matrix-results.json`；第二次40项30通过/10项揭示紧凑链接隐藏和返回fit重置，见`navigation-audit-before-fix.json`；修复后40项32通过/8项因44px链接在有边框工具栏顶部的半个CSS像素未达到ratio=1，见`subpixel-assertion-results.json`。最终容许亚像素误差（ratio≥.98），同时验证44px尺寸、实际tap、无横溢出及状态恢复，40/40通过。聚焦原700ms降暗来不及在转场前看清，调为180ms降暗及180ms聚焦/600ms位移，实际截图确认其余肖像明显变暗。原失败记录不删除。

实际截图已经打开查看，均来自真实浏览器进程，不是生成示意：

- 桌面：`chrome-1920-wall.png`、`chrome-1920-wall-bottom.png`（新增后两排）、`chrome-1920-1440-wall.png`、`chrome-1920-chen.png`、`chrome-1920-reading.png`、`chrome-1920-key-moments.png`。
- 横屏：`chrome-1920-{932,844,740,667}-{wall,wall-bottom,profile}.png`；新图版档案`chrome-1920-844-xux-archive.png`；Edge同名对应图。
- 双向导航：`chrome-1920-map-entry.png`、`chrome-1920-{932,844,740,667}-map-entry.png`及Edge对应图。
- 光照：`chrome-1920-light-{low,high,paused,focus}.png`及Edge对应图，同视口核对差异。
- 录屏：`actual-chrome-light-and-portrait.webm`，1280×720、约2.56MB；CDP实际捕获554帧，经浏览器MediaRecorder编码，含完整16秒周期及肖像开关，不是AI动画或手机录屏。

真机边界：本轮未取得实体手机控制，所有手机尺寸/触摸均为Windows浏览器模拟。WiFi IP测试从电脑使用真实网卡地址请求，不能据此声称手机已连校园网实测。Safari/iOS全屏、真实地址栏/刘海/高DPR、低端设备性能与校园网并发仍待人工。

人工历史审核仍需逐份确认16稿及28个新来源的采用范围；新图年代、人物识别、来源链和独立公开再授权仍pending，不因网站可访问而改变状态。林彪、程子华及原张闻天/陈云/博古等年代信息不补造，低分辨率肖像不AI放大；徐向前并列图版以及贺龙/任弼时共用合影的完整展示需人工认可。L-02原件仍缺。未扩展额外候选人物、女性/基层人物或其他模块，保留后续研究任务。
