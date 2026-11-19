# 电脑与校园网手机内容一致性修复

2026-11-16，按用户最新明确授权实施。此前“待审/研究图片仅本机预览”的访问门槛已取消；不再以审核字段、设备或hostname阻止手机读取电脑已能显示的内容。史料来源、图注、审核/版权记录原值不改，不据此宣布事实已核实。

## 已定位原因

1. exhibitionContent.ts将非localhost/127.0.0.1访问自动切成public模式，隐藏部分展陈正文/影像。
2. historyMediaPlugin.ts读取本地research素材，通过/__research-media/AST-ID提供图片，但按socket.remoteAddress仅允许loopback；校园网手机请求返回404。
3. 这些图片原先没有进入dist。不是手机CSS把图片高度设零，也不是图片地址指向手机localhost；根因是展示门槛和图片服务门槛叠加。

## 修改

- exhibitionContent.ts统一默认presentation；review=0与默认访问均有完整内容，review=1只增加审阅元数据。无hostname/UA访问分流。
- historyMediaPlugin.ts按原images登记筛选saved、有路径、未拒绝的网站图片，严格核验原始文件SHA256与大小，生成不包含Windows路径的media-files.json。
- 91张原图，共23,750,218字节，按稳定ID与真实JPEG/PNG格式输出到dist/history-media。图片原始字节不变，不复制整个研究目录。
- data.ts将站内图片URL派生为/history-media/AST-xxxx.jpg或.png。电脑localhost及校园网IP均请求自身同源路径，没有CORS或手机localhost问题。
- 开发服务只对白名单图片响应；生产规范URL直接由dist静态服务响应，不依赖图片中间件。旧/__research-media/ID保留严格白名单兼容，不支持目录、任意文件名、Windows路径或路径穿越。
- 本轮没有改动CSS、地图坐标、历史正文、图片关联或审核字段。非首屏图片继续lazy加载，独立滚动容器内逐图滚动并检查显示/解码。

## 测试

首轮Chrome三环境检查3/3通过：localhost电脑、当前真实WiFi IP电脑、WiFi IP+844×390触摸手机模拟。每环境91张图片均验证HTTP成功、正确MIME、字节哈希、浏览器decode；遍历已配置事件、旧档案和四渡专题，滚动后图片仍加载。

最终Chrome/Edge相关回归 **46/46通过**，0失败/跳过/不稳定项。[完整结果](../output/playwright/content-parity/final-46-results.json)。其中六组图片全量验证分别为两浏览器×localhost电脑、WiFi IP电脑、WiFi IP触摸手机模拟；每组91张，均验证原文件/生产文件/HTTP响应SHA256一致，正确MIME、浏览器decode及页面中实际可见。禁用缓存后逐图滚动，检查后续图片可加载；还验证事件切换、四渡专题、档案关闭/返回/大图与来源信息。原“远程必须隐藏”的断言改为内容一致，review=1仅显示审核记录。

```powershell
npm run test:browser -- tests/content-parity.spec.ts tests/history-archive.spec.ts tests/history-exhibitions.spec.ts tests/adaptive-exhibition.spec.ts tests/delivery-sprint.spec.ts --grep-invert "四军跟随均|四军单独|黄色播放" --project=chrome-1920 --project=edge-1920
```

类型/构建检查通过；测试完成后再次执行生产build，dist含91张历史图片。原七份历史JSON逐项哈希一致，图片生产文件无任何字节差异，见[完整性校验](../output/playwright/content-parity/integrity.json)。工程/文档链接/差异检查通过；沿用既有大包警告，本轮无依赖、路由或视觉重构。

| 访问场景 | 实际验证 | 图片截图 |
| --- | --- | --- |
| localhost电脑 | Chrome/Edge全91图及展陈通过 | [localhost](../output/playwright/content-parity/chrome-1920-localhost-event.png) |
| 校园网IP电脑 | 直接访问10.75.233.125:4173，Chrome/Edge全91图及展陈通过 | [IP电脑](../output/playwright/content-parity/chrome-1920-lan-desktop-event.png) |
| 校园网IP手机模拟 | 844×390触摸上下文，Chrome/Edge全91图及展陈通过；不是实体手机 | [IP手机模拟](../output/playwright/content-parity/chrome-1920-lan-mobile-simulation-event.png) |

[四渡专题手机模拟](../output/playwright/content-parity/chrome-1920-lan-mobile-simulation-campaign.png)。私有目录/环境变量/Git和无效图片路径检查未返回项目内部内容；未开放research目录浏览。预览进程继续运行并提供最新dist。

真实实体手机目前无法由本环境操作，**没有完成真机测试**。触摸手机模拟不能替代Safari/Android真机、校园网隔离和信号条件。服务监听当前WiFi地址http://10.75.233.125:4173/；手机需刷新页面以加载本轮JS和图片路径。

## 文件

代码：scripts/historyMediaPlugin.ts、src/features/history-map/data.ts、exhibitionContent.ts；新增src/data/history/map/media-files.json。测试：新增content-parity.spec.ts，更新history-archive.spec.ts、history-exhibitions.spec.ts、adaptive-exhibition.spec.ts、delivery-sprint.spec.ts。规范/记录：AGENTS.md、README.md、MOBILE_LANDSCAPE.md、TASK_BOARD.md及本文。

修改前相关文件备份在output/playwright/content-parity-checkpoint-8NfCa9/。没有提交、推送、公开上传，也没有开放项目根目录。
