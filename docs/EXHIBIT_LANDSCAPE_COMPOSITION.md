# 手机横屏展陈构图修复

2026-11-16。当前消息未提供可读取的两张真机图片附件，本轮依照文字描述、实际CSS和四档浏览器视口复现；不冒称查看过真机截图或完成真机测试。修改前保存相关文件到 `output/playwright/exhibit-layout-checkpoint-Wa63lT/`，没有重置已有工作区。

## 原因与断点

`history-exhibition.css`原`max-width:760px`将开篇设为`display:flex; flex-direction:column`，图片变为`position:relative; width:100%; order:2`。因此667与740宽的横屏也会把影像推到文字之后。`history-campaign.css`另有1000/760/650px纯宽度断点，紧凑样式又统一设置旧档案单栏、无图上下文块布局。这些规则没有区分横屏与竖屏。

新增 `exhibit-landscape.css`：仅在**data-compact=true、orientation:landscape、min-aspect-ratio:4/3、600px≤宽度≤1024px**时启用宽屏构图。四档要求视口均满足，电脑1920/1440不命中。portrait≤600px独立采用纵向图文，旋转仅改变布局，不重建展厅。

## 最终结构

- 有主图开篇：45fr文字/55fr影像，同一Grid行，左侧日期、标题、导语、地域/部队与阅读入口，右侧图片和静态图注。紧凑留白14–18px、标题30–44px、导语16px，保留44px操作。图像contain按原比例，不使用整体scale，关闭触摸悬停遗留的放大裁切，完整影像按钮保留。
- 极矮视口允许长导语继续向下滚动，但图片始终位于同一行且在首屏出现，不独占下一屏。
- 四渡章节加入轻量text/images结构；桌面三个容器均display:contents，保持原DOM内容流及32px段落间距。横屏仅有图章节启用两栏，一渡文左图右、二渡图左文右；分析、后续行动与章节导航继续全宽。无图章节不生成空列。
- 一渡和其他战役/会议/行军读本使用相同开篇关系；路线解读、叙事与分析恢复各自原有Grid比例，行军类原全宽画廊继续全宽。地图采用全宽地图区及其原局部图文结构，不塞成三列窄栏。
- 遵义等有代表图事件保留并列；毛儿盖、芦花、沙窝的开篇原本无代表图，保持会议档案正文/章节导览，不挪用后续地域照片填首屏。原文献、时间关系、地域图与独立影像模块保持。
- 有照片的旧档案恢复60/40阅读与画廊列；无图时继续全文，不统一套一个模板。

电脑端原影像叠合/渐变、字体、图片尺寸和章节地图双栏保持。历史正文、原图、91张同源资源、部队路线及发布/访问逻辑均未修改。

## 文件

新增 `src/styles/exhibit-landscape.css`、`tests/exhibit-landscape.spec.ts`、本文；修改main.tsx引入样式，ChishuiCampaign.tsx加入章节分组，history-campaign.css为默认contents及原段落间距适配；AGENTS.md第10条与设计系统/看板增量记录长期规范。

## 验证

首轮四档横屏四渡开篇及交错章节均通过。额外遍历发现图像hover缩放造成边缘轻微超框，已关闭横屏hover缩放；竖屏按真实flex-column验证，桌面测试补全关闭上一弹窗的步骤。

最终命令：`npm run test:browser -- tests/exhibit-landscape.spec.ts tests/history-exhibitions.spec.ts tests/adaptive-exhibition.spec.ts tests/content-parity.spec.ts --grep-invert "localhost|lan-desktop" --project=chrome-1920 --project=edge-1920`，**40/40通过（3.8分钟）**。包括Chrome/Edge四档横屏、全部已配置展厅与旧档案、竖屏旋转、1920/1440桌面、原专题与地图状态保留，以及校园网IP手机模拟逐张检查91图HTTP/解码/哈希/滚动及切换。证据：[最终测试JSON](../output/playwright/exhibit-layout/final-40-results.json)。本轮不重复上一阶段已通过的localhost/IP桌面全资源矩阵，不将本轮40项扩大描述为全站全部用例。

测试后再次执行`npm run build`（含`npm run typecheck`）通过，仍有既有大JS分块提示；`node scripts/verify-setup.mjs`通过（13必备文档、210本地链接、78文件哈希）；`git diff --check`通过，仅提示既有换行转换。Node v24.21.0/Windows，本轮保留既有未提交工作区，没有创建提交。最终dist的91图共23,750,218字节，SHA256全部符合素材登记，见[构建图片校验](../output/playwright/exhibit-layout/build-media-integrity.json)。本机再次访问`http://10.75.233.125:4173/`及AST-0033.jpg、AST-0092.png均200且MIME正确。

| CSS视口 | 首屏 | 后续章节 |
| --- | --- | --- |
| 932×430 | [横屏首屏](../output/playwright/exhibit-layout/chrome-1920-932-opening.png) | [一渡](../output/playwright/exhibit-layout/chrome-1920-932-first.png) / [二渡](../output/playwright/exhibit-layout/chrome-1920-932-second.png) |
| 844×390 | [横屏首屏](../output/playwright/exhibit-layout/chrome-1920-844-opening.png) | [一渡](../output/playwright/exhibit-layout/chrome-1920-844-first.png) / [二渡](../output/playwright/exhibit-layout/chrome-1920-844-second.png) |
| 740×320 | [横屏首屏](../output/playwright/exhibit-layout/chrome-1920-740-opening.png) | [一渡](../output/playwright/exhibit-layout/chrome-1920-740-first.png) / [二渡](../output/playwright/exhibit-layout/chrome-1920-740-second.png) |
| 667×375 | [横屏首屏](../output/playwright/exhibit-layout/chrome-1920-667-opening.png) | [一渡](../output/playwright/exhibit-layout/chrome-1920-667-first.png) / [二渡](../output/playwright/exhibit-layout/chrome-1920-667-second.png) |
| 1920×1080 | [桌面回归](../output/playwright/exhibit-layout/chrome-1920-1920-desktop.png) | 原影像叠合与地图双栏保持 |
| 1440×900 | [桌面回归](../output/playwright/exhibit-layout/chrome-1920-1440-desktop.png) | 原影像叠合与地图双栏保持 |

本轮截图均为Chrome/Edge真实浏览器中的手机模拟，不是实体手机。四档932×430、844×390、740×320、667×375；补查390×844竖屏及1920×1080/1440×900桌面。验证首屏标题/导语/完整img同现、左右关系、图片解码、大图关闭、无横溢出、原地图返回、原档案空资源与旋转同一实例。

已人工查看667/740横屏首屏、740一渡与844首屏以及1440桌面截图。740×320允许阅读入口/长内容继续下滚，主要导语和完整图片已在首屏同现。真机地址栏、刘海安全区和实体Safari/Android触摸仍需人工验收；用户在本轮前已确认真机图片加载正常，本轮未再次操作实体手机。

长期规则已写入根AGENTS.md第10条：手机横屏与竖屏策略分开，空间允许保留图文并列；不得只按小宽度强制单栏；未来历史专题、英雄人物同样遵守，兼顾沉浸感、可读性和触摸。
