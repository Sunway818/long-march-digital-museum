# 首页全屏入口（2026-11-16）

首页顶部导航右侧新增「全屏 / 退出全屏」按钮，电脑与手机共用组件。采用原深棕、古金、米白配色，最小44px高度，键盘Enter/Space可操作，提供可见焦点与aria-pressed。手机保留独立入口，竖屏过窄时导航链接可横向滚动，不挤掉全屏按钮。

点击直接请求document.documentElement全屏，保留整站内容，进入地图再返回不会把隐藏的首页容器留在全屏层。监听fullscreenchange与webkitfullscreenchange，外部退出同步按钮文案；优先标准API，兼容已有WebKit前缀。请求失败或API缺失时保留页面与按钮，显示可关闭的提示，不伪装成成功。

地图组件挂载时补读一次实际全屏状态，处理从全屏首页首次进入地图时原按钮初始文案不一致的问题；未改变地图引擎、历史日期、路线、图片与首页环境动效。

参考：[MDN Fullscreen API](https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API)、[requestFullscreen](https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen)。全屏须由用户操作触发，是否允许由浏览器决定，网页无法强行消除不支持设备上的浏览器界面。本轮不声称完成实体手机兼容性验收。

修改文件：src/components/FullscreenButton.tsx（新增）、Navbar.tsx、src/styles/hero.css、compact.css、src/features/history-map/HistoryMapPage.tsx（一行初始化）、tests/home-fullscreen.spec.ts（新增），以及本文和任务看板。

## 验证

首轮已验证原生全屏与手机各档入口；两个异常分支测试因使用全页status选择器同时匹配原章节状态而失败，已将选择器限定到全屏提示。实际提示正常。

Windows / Node v24.21.0，Chrome与Edge均实际运行：`npm run test:browser -- tests/home-fullscreen.spec.ts tests/homepage.spec.ts --project=chrome-1920 --project=edge-1920`，原首页20项全部通过，全屏专项4项通过、4项因上述测试选择器失败；保留[首轮结果](../output/playwright/home-fullscreen/initial-28-results.json)。补齐地图初始状态并重新构建后，`npm run test:browser -- tests/home-fullscreen.spec.ts --project=chrome-1920 --project=edge-1920`最终**8/8通过**（37.5秒），见[最终专项结果](../output/playwright/home-fullscreen/final-8-results.json)。原首页动效/深链接/导航/缩窗/图片失败与焦点回归20项、最终专项8项分别记录，不将首轮失败隐去。

`npm run build`（含typecheck）、`node scripts/verify-setup.mjs`与`git diff --check`通过，构建仍提示既有大JS分块，差异检查仅有换行转换提示。预览服务4173已提供最新dist。本轮未操作实体手机，手机为触摸浏览器模拟，API缺失与拒绝为受控异常测试。

已查看[电脑1920首页](../output/playwright/home-fullscreen/chrome-1920-desktop.png)、[667横屏](../output/playwright/home-fullscreen/chrome-1920-667.png)、[390竖屏](../output/playwright/home-fullscreen/chrome-1920-390.png)；另有[844横屏](../output/playwright/home-fullscreen/chrome-1920-844.png)、[740横屏](../output/playwright/home-fullscreen/chrome-1920-740.png)、[932横屏](../output/playwright/home-fullscreen/chrome-1920-932.png)。按钮始终保留，不改变首页原红旗、云雾、朝阳与标题构图。

新用例覆盖：原生进入/按钮退出、浏览器API外部退出同步、首页全屏下地图往返、932×430/844×390/740×320/667×375/390×844触摸模拟入口与进入退出、44px目标、无页面横溢出、API缺失、请求拒绝和重试。异常分支通过替换API测试，不冒称实体浏览器不支持测试。
