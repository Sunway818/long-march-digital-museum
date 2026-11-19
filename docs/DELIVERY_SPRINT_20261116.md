# 交付冲刺：会议档案、资料入口与四军镜头跟随

2026-11-16；在 `f48192390168034418454be03dfbd379db253367` 及既有未提交工作区上继续开发。本轮仅处理用户指定的三项任务，不提交或推送 Git，不开展手机适配。首页、红旗/云雾/朝阳、底图、历史路线坐标及四渡赤水展厅视觉保持既有实现。

## 本轮展陈范围

沿用已认可的 EVT-058 毛儿盖展厅：深色开篇、书法标题、编号/年月/地域/部队、问题式导语、章节导览、不同底色的阅读段落和文末折叠来源。没有重新设计其样式，也没有改变其策展对象。

| 事件 | 人工指定类型 | 实际模块与叙事重点 | 开篇导览 |
| --- | --- | --- | --- |
| EVT-056 芦花会议及组织安排 | archival 会议档案 | 会合后协同的背景；领导分工；6月下旬—7月18日—7月21日的时间区别；本站解读；折叠来源 | 看组织安排、辨时间 |
| EVT-057 沙窝会议 | archival 会议档案 | 松潘计划之后的背景；共同任务与团结；会议—会后左右路混合编组—毛儿盖后续进程；本站解读；折叠来源 | 读会议任务、看协同部署 |
| EVT-058 毛儿盖会议与右路军出发 | 原 composite 档案＋地图 | 原叙事、决策、文献线索、地域图、五节点时间关系、地域影像、本站解读与来源全部保留 | 原读会议、看方向、理时间 |

EVT-056/057各配置4个正文模块（narrative、decision、timeline、analysis），内容、时间关系和导航文案分别编写；来源目录由原共用组件生成。没有登记到这两次会议的可靠照片或文献原件，故**接入图片0张、文献影印件0份**，不留空图框、不生成仿原件、不挪用EVT-058影像或DOC-0016。职务有依据的人员只在相应正文与时间关系中出现，不增加没有独立资料支撑的人物墙。

EVT-059、EVT-060及其他行军、战役、会师节点没有迁入新会议档案分支。旧12节点展厅和四渡专用展厅继续走原分支。右侧检索 `EVT-056` / `EVT-057`，选择后点击“深入了解”即可查看。

### 史料依据和审核边界

复用已有来源ID，没有新增史料下载或修改原登记：

- SRC-0040 / SRC-0107：[石仲泉《周恩来与遵义会议的召开和红军长征的伟大胜利》](https://www.dswxyjy.org.cn/n1/2025/0307/c423726-40433382.html)，第三节（三）芦花、沙窝和毛儿盖段；二者登记同一文章，不当作两份独立交叉证据。
- SRC-0108：[军事百科1935年大事记](https://js.bkzx.cn/events?year=1935)，6月26日、7月18日、7月21日、8月4日条；8月4日条记会议至6日。
- SRC-0042：原事件已关联的甘肃党史会议综述，保留在相关背景/后续关系与来源目录中。

本轮复读确认的编辑取舍：芦花领导分工与随后前敌指挥部署分别叙述，不把7月组织变化合成一次会议同日决定。沙窝开篇明确写“1935年8月上旬 · 文献记为4—6日”；原事件“6日起会议过程待核”的登记及月精度展示锚点继续保留。编组左右路不直接等同于两个方面军。

全部新开篇和正文证据仍为 **pending / draft**。没有人物引语、没有会议原文摘录，也没有将编辑解释包装成史实；分析模块明确标“本站解读”。在本机默认干净预览中可读；`?review=1#map`显示证据定位；`?review=0#map`与远程正式模式隐藏待审正文，只保留整理提示及来源。人工审核前不升级正式发布状态。

## 右侧主要入口

现在顺序为：事件标题 → 地域/日期/部队 → **深入了解 →** → 专题导览（适用时）→ 简介 → 已有影像 → 定位等辅助操作。主入口位于正文和图片之前。

入口使用 `#78342c` 深红背景、`#fff3df` 暖白文字和 `#b99a61` 细边，计算纯色文本对比约 **8.23:1**。悬停略提亮，键盘焦点有明确外轮廓；沿用原历史视觉语言。按钮在右栏内 `position: sticky; top: 0`，滚动长简介后仍可见。

切换 `selected.id` 时，在 `useLayoutEffect` 中把右侧 `<aside>` 的 `scrollTop` 设为0，并用 `preventScroll` 聚焦新标题。它不操作地图中心或缩放，也不滚动整页。浏览器检查覆盖精选节点、旧专题目录节点以及三个新展陈节点组成的全部可达集合；每个事件的入口均在1440×900首屏内。另在滚到底部后直接点击另一个地图节点，验证归顶、入口和展厅事件一致。

## 镜头跟随：原因与修复

### 原因

旧实现只在播放期间更新镜头，把**所有可见部队的最近事件地点**一起传给 `fitBounds`。这不是一条明确部队的当前路线位置：多军混显时容易得到混合范围；事件日期稀疏时镜头不随线条展开；暂停拖日期不会执行跟随，`fitBounds`还会改变缩放。原状态也没有独立、可持续的跟随目标。

核对后，黄色身份映射正确，不是配色或坐标串军错误：

| 稳定部队ID | 现有颜色 | 显示方向段ID前缀 | 镜头处理 |
| --- | --- | --- | --- |
| central | `#B42B25` 红 | `DIR-central-*` / `VIEW-central-*` | 只读取中央红军自身展开几何，遵守接应线开关 |
| second | `#B47C10` 黄 | `DIR-second-*` / `VIEW-second-*` | 红二、红六军团及其后红二方面军；名称依日期变化 |
| fourth | `#28647B` 蓝 | `DIR-fourth-*` / `VIEW-fourth-*` | 只读取红四方面军，不合并红一路线 |
| twentyfive | `#4D722E` 绿 | `DIR-twentyfive-*` / `VIEW-twentyfive-*` | 只读取红二十五军 |

原工作簿的RTE节点记录在会师等事件上可以关联多支部队，因此不能按数组第一条RTE或颜色猜目标。实际跟随按渲染分段的 `army_id` 过滤。

### 新状态和移动规则

1. `HistoryState` 增加可选 `followArmyId`；`followArmy` action负责明确选军。单军显示可直接使用唯一部队；多军时使用保存目标/当前明确选择，否则显示“请选择部队”，保持镜头，不默认中央红军。启用跟随时在原时间轴控制组显示“目标”下拉框，只列当前可见部队。
2. `followPosition` 直接复用 `buildRouteChains` 的时间裁切、连续前缀及hold规则，从该军已展开路线端点取得目标，不新增日坐标、不独立推算实际行军速度。暂停拖日期与播放使用同一 `currentDay`。
3. 优先当前正在展开的分段，否则选最近完成段；同日多分支用稳定段ID打破平局，避免数组顺序变化造成跳动。分支仍全部保留，这只决定一个镜头的代表目标，不声称代表全军或所有纵队的精确位置。
4. `easeTo` 仅设置中心，不传zoom、不fitBounds；播放使用短线性追随，暂停调时使用有限缓动；减少动态效果时立即定位。没有合格坐标则保持当前中心；hold区间保持已完成端点，不跨待核缺口补路。
5. 手动拖图/缩放仍取消跟随；隐藏跟随部队或全部隐藏会关闭跟随，日期变化不把保存目标悄悄换成其他军。选择会师等多军事件时，若原目标也参与该事件，就继续跟随原目标，不按事件部队数组的首项换军。全程总览及重置视野关闭跟随后走原复位流程。无新增RAF或播放时钟。

### 已验证场景

- 红一、黄色红二/六、红四、红二十五军分别单独显示，开启跟随，手动改变日期，中心均与本军已展开端点一致，zoom保持。
- 全部显示后在目标下拉框连续切换四军；各次镜头只读取指定军的分段，暂停调时也跟随。
- 黄色线路1936年3月的播放进度带动镜头；暂停后中心落在当前端点，保持zoom；回到该军首段尚未出现的时间点时保持中心，不跳到地图原点或另一军。
- 黄色线路1936年9月8—9日的既有间隔保持同一已完成端点；未创造衔接坐标。
- 关闭跟随后可手动拖图；重置视野恢复原范围；隐藏目标关闭跟随。全程总览与四渡专题继续使用各自原有显示规则。

复位还核对中心与缩放均回到初始总览，而不是仅检查“跟随已关闭”。明确的定位请求会先结束旧跟随，再启动原fit流程，避免同一轮effect中取消跟随误停新复位。减少动态效果下也检查中心正确且zoom保持。

## 修改文件

| 文件 | 本轮修改 |
| --- | --- |
| `src/features/history-map/meetingExhibitions.ts` | 新增芦花、沙窝的独立策展草稿与逐模块证据定位 |
| `adaptiveExhibitions.ts` | 仅合并上述两个配置，EVT-058定义保持 |
| `adaptiveExhibitionModel.ts`、`AdaptiveExhibition.tsx` | 模块增加可选navLabel，导览可使用各事件自己的文字 |
| `HistoryPanel.tsx` | 主按钮前置；换事件时右栏归顶与焦点处理 |
| `src/styles/map-refinement.css` | 主按钮暖白文字、深红底、细边/焦点/吸附；紧凑跟随目标控件 |
| `src/features/history-map/cameraFollow.ts` | 新增明确部队目标与同源展开几何端点选择器 |
| `types.ts`、`model.ts` | 保存目标；筛选、选择事件、阶段、总览等状态边界 |
| `MapCanvas.tsx` | 用本军端点移动中心，取代多军最近事件fitBounds |
| `ParallelTimeline.tsx`、`HistoryMapPage.tsx` | 原跟随开关旁选择部队；重置/总览中止跟随 |
| `scripts/prepare-exhibit-font.py`、`src/assets/fonts/exhibit-title.woff2`、`exhibit-font-manifest.json` | 原OFL书法子集补芦花/沙窝标题字，保留原字符；没有下载字体 |
| `tests/delivery-sprint.spec.ts`、`tests/adaptive-exhibition.spec.ts` | 6项新检查及原试点范围断言更新，沿用项目Playwright脚本 |
| 本文、任务看板、交互/架构/来源文档与原试点记录 | 记录新增范围、证据、测试和人工待办 |

表中省略目录的TS/TSX均位于 `src/features/history-map/`。无依赖或路由变更。原七份JSON与前次留存SHA256逐项一致，见[完整性记录](../output/playwright/sprint/integrity.json)。

## 检查与证据

环境：Windows NT 10.0.26200.0、Node v24.21.0、npm 11.19.0；Chrome 157.0.8103.78 / Edge 157.0.4341.46，100%浏览器缩放，原工程四项目1920×1080/1366×768，新增用例另设1440×900。浏览器版本读取本机可执行文件信息。测试对象为 `npm run build` 后的本地preview。

| 检查 | 实际结果 |
| --- | --- |
| `npm run build`（包含typecheck） | 通过；保留既有MapLibre大分包警告，未扩大为拆包重构 |
| `npm run test:browser -- tests/delivery-sprint.spec.ts --project=chrome-1920` | 阶段性6/6通过；[定向结果](../output/playwright/sprint/chrome-targeted-6-results.json) |
| 多军会师目标保持、完整复位及reduce补充定向检查 | 2/2通过；[跟随收尾结果](../output/playwright/sprint/follow-final-2-results.json) |
| 地图、资料卡、旧专题、精修、自适应及本轮七个测试文件，四项目 | **208/208通过**，0失败、0跳过、0不稳定项；[完整结果](../output/playwright/sprint/final-regression-208-results.json) |
| `npm run test:browser -- tests/delivery-sprint.spec.ts --grep "芦花和沙窝档案"` | 收尾一句文案调整后 **4/4通过**，刷新四项目两张会议的开篇/章节截图；[收尾结果](../output/playwright/sprint/final-meeting-4-results.json) |
| `node scripts/verify-setup.mjs`、`git diff --check` | 通过；最终文档链接与差异检查完成 |
| 历史原始数据 | 原七份JSON哈希一致；不据此宣称原始内容已完成史实审核 |

首轮定向6项中4项通过、2项坐标断言失败：旧 `data-center` 仅保留三位小数，测试最初要求误差小于0.0002度。将断言改为允许三位舍入误差0.00051后六项通过；未通过修改路线坐标或放宽到跨地域误差来绕过失败。

完整208项的实际命令：

```powershell
npm run test:browser -- tests/history-map.spec.ts tests/history-map-consistency.spec.ts tests/history-archive.spec.ts tests/history-exhibitions.spec.ts tests/map-refinement.spec.ts tests/adaptive-exhibition.spec.ts tests/delivery-sprint.spec.ts
```

完整回归后仅把沙窝时间关系的一句内部登记说明改为面向读者的史事概述，证据ID、待审状态和数据锚点不变；重新构建并针对两篇会议展厅补做四项目收尾复测与截图，不重复无关模块测试。

按[项目指定网页规则](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md)复核本次入口、导览与目标控件：原生button/a/select、标签、可见焦点、独立滚动、不覆盖新标题、空资源省略、减少动态效果与明确hover状态。没有据此开展全站URL状态重构或手机适配。实体读屏软件、系统高倍率缩放、性能量化与清洁安装交付验收不在此次实测范围。

### 实际页面截图

| 内容 | 浏览器截图 |
| --- | --- |
| 芦花1920开篇 | [开篇](../output/playwright/sprint/chrome-1920-EVT-056-opening.png) |
| 芦花组织与时间关系 | [滚动后](../output/playwright/sprint/chrome-1920-EVT-056-decision.png) |
| 沙窝1920开篇 | [开篇](../output/playwright/sprint/chrome-1920-EVT-057-opening.png) |
| 沙窝任务与协同 | [滚动后](../output/playwright/sprint/chrome-1920-EVT-057-decision.png) |
| 1440右侧主入口首屏 | [入口](../output/playwright/sprint/chrome-1920-1440-entry.png) |
| 1440黄色路线播放后暂停 | [黄色跟随](../output/playwright/sprint/chrome-1920-1440-yellow-playing.png) |
| 四军分别跟随 | [红一](../output/playwright/sprint/chrome-1920-follow-central.png)、[红二/六](../output/playwright/sprint/chrome-1920-follow-second.png)、[红四](../output/playwright/sprint/chrome-1920-follow-fourth.png)、[红二十五](../output/playwright/sprint/chrome-1920-follow-twentyfive.png) |

同目录保留另外三个项目的实际截图。截图为本机策展预览，不能当作待审史料的正式发布许可。

## 仍需人工处理

1. 审查两篇原创转述和本站解读；核对芦花多次会议、7月18日/21日安排的口径，及沙窝4—6日与原登记待核说明的区别。
2. 两事件会议确址、完整文件/原件、可用历史照片及其年代/授权仍缺。维持原始pending/draft，不能用新展陈设计替代史料审核。
3. 黄色线及其他部队仍为既有地域方向图，分路与逐日确址不完整；代表性镜头不能替代全军每一梯队的位置。原会师/南下/再北上关系和待核状态不变。
4. 原首页刷新滚动遗留项QA-HOME-20261112-01不属本轮，未宣称修复或全站验收通过。

本轮完成后等待人工验收，再由用户决定手机适配；不自动进入下一阶段。

## 用户要求回退

已按本次要求撤回最后一轮自动接续跟随改动，恢复此前三项冲刺交付版本的代码与测试；芦花/沙窝档案、深入了解入口和显式部队跟随保留。多军自动接续问题继续留待后续任务，不再作为当前已实现功能。撤回前的11份文件保存在 output/playwright/rollback-auto-uKcplq/，原自动接续测试结果和截图另留在output作过程记录。

回退后构建（含类型检查）、工程与差异检查通过。页面构建资源恢复到上一轮的 `index-BX8lbO5s.js` / `HistoryMapPage-BmwHniFy.js`。Chrome/Edge两档桌面视口的显式跟随、调时、播放、拖图与复位定向回归 **12/12通过**：[本次结果](../output/playwright/rollback-auto-uKcplq/restored-12-results.json)。未重跑全部208项，不将原报告当作本次全量复测。
