# 双端布局与手机横屏交付规范

后续用户已明确取消本机/局域网内容访问差异：已接入图片与正文统一展示，91张图片进入dist/history-media。下方早期访问门槛及404探测仅为过程记录，现行规则与新验证见[内容一致性修复](CONTENT_PARITY_FIX_20261116.md)。

2026-11-16。本轮在已有未提交工作区增量开发；改动前完整保存src/docs/tests/scripts及工程入口的本地检查点：`output/playwright/mobile-checkpoint-iAfGOO/`。未重置Git、未提交/推送或公开上传。

## 正式范围与结构

已有正式界面为首页、展馆入口、时空地图、资料速览、旧档案和全部已配置的专题展厅/图像阅读器。英雄人物、精神传承仍为原占位，没有新增页面。

- `OrientationGuide.tsx`统一检测视口宽高、方向与触摸能力。紧凑布局使用根节点data-compact；小于等于1024px的短窗口或触摸设备进入紧凑模式。竖屏手机显示原生dialog引导，可继续竖屏；旋转关闭引导，页面与地图始终挂载，不以方向作为React key。
- `compact.css`集中管理横屏首页构图、动态视口、safe-area、触摸命中、侧栏和展厅。通过有范围的选择器覆盖旧规则，桌面原样式不变；没有整体scale或旋转页面。
- 首页保留原影像、三种字体、旗帜/云雾/朝阳及原统一暂停系统。缩减标题/留白并保留44px入口，失败仍用既有静态原图。旗面使用既有636×504固定绘制缓冲和ResizeObserver，没有按手机DPR放大它；地图在触摸设备限制pixelRatio至1.5。
- 地图占主体，部队和事件面板覆盖展开，可通过顶部收起按钮关闭；短屏面板会覆盖右侧部分时间轴，收起后恢复全部地图操作空间。标题/日期/地域/部队后立即显示暖白字深红主按钮。时间轴保持日期、拖动与所有控制，较窄设备的控制组可左右滑动，无删除操作。
- 地图只在交互画布设置touch-action:none，资料栏纵向独立滚动、时间轴单独命中。节点44px命中区域保留原小符号；隐藏无实际用途的旋转控件，保留缩放/复位。
- 旋转时ResizeObserver只更新地图尺寸，不重新fit总览；保留镜头与唯一currentDay。镜头跟随保持用户回退后的显式部队选择方案，没有重新引入自动接续功能。
- 各类展厅复用原分支与资料，紧凑模式近全屏、独立滚动、固定返回入口；书法标题缩至约42px，正文约16–17px，图片、文献和局部地图依旧存在，无图不补造展品。

## 长期规范

强制规则已写入根AGENTS.md的“双端开发强制规范”。今后每个页面/组件至少验证一次桌面与手机横屏，考虑有限高度、44px命中、16px正文、安全区域、横溢出、触摸等效操作、性能与失败降级；新展陈复用现有体系，禁止把手机适配延后为可选任务。桌面与手机横屏都是完成门槛。

## 资源、校园网与审核边界

关键底图、字体、首页影像、MapLibre worker均为本地资源；原始文件没有压缩覆盖。既有非开篇历史影像lazy加载、地图lazy分包继续沿用；未安装新框架。仍有既有大分包警告，未进行高风险拆包。

用户后续已明确取消上述访问门槛：已接入正文、研究图片与正式图片均在电脑和手机同源展示，91张图片进入dist/history-media。原始pending/draft和版权元数据保留用于记录，不再阻断局域网加载。审阅参数只控制内部说明。现行实现与实测见[内容一致性修复](CONTENT_PARITY_FIX_20261116.md)。

同一网络下可运行现有命令 `npm run preview -- --host 0.0.0.0`。仅用于本轮校园网预览，不公开上传；Windows防火墙/校园网客户端隔离是否允许同学连接仍需真机确认。不自动修改系统防火墙。

## 验证与截图

使用现有Playwright脚本，在本机Chrome/Edge中创建触摸+移动视口上下文。四档横屏932×430、844×390、667×375、740×320；两档竖屏390×844、360×800。模拟不能代替iPhone Safari/Android真机、刘海屏、地址栏伸缩和GPU实测。

首轮14/14通过（四档流程/两档方向/协议级触摸，各两浏览器）。随后56项混合回归54通过、2失败，均为旧档案返回按钮因44px工具栏及1px边框造成半像素裁切；工具栏增为46px后已解决。该轮40项纯桌面首页/地图/毛儿盖检查全部通过；原始报告完整保留。

最终18/18通过：四档手机横屏连续流程、两档竖屏/自动关闭/备用入口/旋转中心与zoom/日期保持、全部配置展厅与旧档案遍历及图片放大关闭、触摸协议平移/缩放/节点点击/黄色显式跟随，以及1440桌面首页，各Chrome/Edge一遍。另将全部展陈遍历放到最矮740×320，2/2补测通过。最后按要求重新build（含typecheck），最新dist已更新；工程/链接/差异检查通过。原七份历史JSON哈希一致。

- [56项过程结果](../output/playwright/mobile/desktop-mobile-56-results.json)（保留初轮两项失败）
- [最终18项](../output/playwright/mobile/final-18-results.json)、[最矮屏2项](../output/playwright/mobile/short-2-results.json)、[历史数据哈希](../output/playwright/mobile/integrity.json)

```powershell
npm run test:browser -- tests/mobile-landscape.spec.ts tests/homepage.spec.ts tests/map-refinement.spec.ts tests/adaptive-exhibition.spec.ts --project=chrome-1920 --project=edge-1920
npm run test:browser -- tests/mobile-landscape.spec.ts --project=chrome-1920 --project=edge-1920
npm run test:browser -- tests/mobile-landscape.spec.ts --grep "全部已有展陈" --project=chrome-1920 --project=edge-1920
```

| CSS视口 | 首页 | 地图 | 档案 |
| --- | --- | --- | --- |
| 932×430 | [截图](../output/playwright/mobile/chrome-1920-932-home.png) | [截图](../output/playwright/mobile/chrome-1920-932-map.png) | [截图](../output/playwright/mobile/chrome-1920-932-archive.png) |
| 844×390 | [截图](../output/playwright/mobile/chrome-1920-844-home.png) | [截图](../output/playwright/mobile/chrome-1920-844-map.png) | [截图](../output/playwright/mobile/chrome-1920-844-archive.png) |
| 667×375 | [截图](../output/playwright/mobile/chrome-1920-667-home.png) | [截图](../output/playwright/mobile/chrome-1920-667-map.png) | [截图](../output/playwright/mobile/chrome-1920-667-archive.png) |
| 740×320 | [截图](../output/playwright/mobile/chrome-1920-740-home.png) | [截图](../output/playwright/mobile/chrome-1920-740-map.png) | [截图](../output/playwright/mobile/chrome-1920-740-archive.png) |

同目录保留四渡及Edge截图，以及[1440桌面首页](../output/playwright/mobile/chrome-1920-1440-home.png)。测试环境为本机Windows、已安装Chrome/Edge（Playwright真实浏览器引擎+手机模拟）；不是实体手机。

局域网预览运行在当前WLAN地址 **http://10.75.233.125:4173/**，监听0.0.0.0:4173。早期[探测记录](../output/playwright/mobile/lan-probe.json)中的研究图404已经由后续修复消除，不能作为当前行为。新图片URL直接由dist提供，localhost与WiFi IP均成功。未冒称完成其他实体手机或几十人并发实测；地址随WiFi变化可能变化。

触摸验证通过CDP真实Touch事件通道发出单指拖动、双指分开，检查地图中心/zoom变化；另外验证四军筛选、黄色显式跟随和关闭，地图/时间轴隔离。方向切换检查同一canvas与日期，不重载。

## 文件

新增OrientationGuide.tsx、compact.css、mobile-landscape.spec.ts、本文；修改App.tsx、main.tsx、index.html、HistoryMapPage.tsx、MapCanvas.tsx、AGENTS.md、README.md、DESIGN_SYSTEM.md、INTERACTION_DESIGN.md、TEST_PLAN.md和TASK_BOARD.md。既有历史数据、素材和展厅正文保持。

## 真机验收待办

手机Safari/Chrome实际单指/双指操作、系统字体放大、刘海安全区域、地址栏动态高度、WebGL温升/帧率、几十人校园网并发均未实测，不填虚构指标。需核对当前WiFi IPv4、同网可达性及正式/审阅资料边界。
