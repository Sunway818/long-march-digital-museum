# 青春纪念笺官方校标增量

2026-11-18。仅优化「我的青春答卷」纪念笺；不改其他页面，不新增动效或依赖。已有未提交内容保留，原绘制文件备份于 `output/checkpoints/legacy-emblem-20261118/`。

## 素材与构图

项目内未发现已接入的校标原件。先查看杭电官网[校标规范](https://www.hdu.edu.cn/666/list.htm)，下载「标志正稿」ZIP，内含AI与CDR。为避免对原稿重新绘制或自造反白版本，实际采用[官网首页](https://www.hdu.edu.cn/main.htm)引用的[原始反白SVG](https://www.hdu.edu.cn/_upload/tpl/02/12/530/template530/images/logo.svg)，包含完整圆形校标及中英文校名。当前官网HTML及ZIP一并保存在 `research/legacy_emblem_20261118/`，不进入网站。

展示资源为 `public/legacy-brand/hdu-official-white.svg`，74,531字节；原件与展示文件SHA256均为 `5866a6702247866fe9fb026b71758e878d0af7ae5ee77a26bac93d37ea12b128`。原始viewBox为314.419×70，透明背景、白色。原字节复制，没有AI生成、裁切、改色、重绘或SVG结构修改；SVG无脚本、外部图片或字体引用。独立登记在 `src/data/history/legacy/brand-register.json`，不更改六幅历史/校园影像登记及其审核状态。

使用项目 `frontend-design` Skill：保留原字体、深绿#19251f、暖金#cbb484/#e3c58c、米白#f0e8d6、砖红#a85c4b的现有关系，校标保持官方白色。右上角等比绘制宽288px、高约64.12px，位置x680/y49，右边缘与正文及页脚对齐；左上标题仍位于x112/y88，原2026年份仅下移至y167。关键词、用户文字、电子电路和双周年信息位置保持。页脚新增低调的「学生课程实践作品」，不使用官方发行或认证语气。借鉴 `design-taste-frontend` 中真实品牌图案、不画近似标识和保留原色的原则；商业站模板、重新配色、固定屏高及新增动效均不适用于此次局部修改。

## 绘制与导出

`keepsakeBrand.ts`统一加载同源SVG，缓存已加载Image及进行中的Promise，不随每次输入重新请求；失败和8秒超时允许下一次生成重试。保留原viewBox小数比例，避免Image.naturalWidth取整造成细微拉伸。

`KeepsakePreview.tsx`等待校标及本地字体，然后调用原绘制函数。加载期间保留1080×1440画幅占位，提供准备状态，避免新增资源改变预览高度；失败保留可读文字后备。

`keepsake.ts`的默认/实时预览和最终生成仍共享 `paintKeepsake`。校标通过 `context.drawImage`直接进入画布，不是覆盖在Canvas上的网页元素。`renderKeepsake`必须等同源校标加载成功后才调用绘制及toBlob；加载失败明确提示、保留文字复制，不生成缺图PNG。其他200字/IME、长文换行、修改失效、Blob清理、下载/原图/复制与本机隐私逻辑未变。

资源随public目录进入dist，在localhost及现有校园网IP预览使用相同源路径，不在浏览和导出时访问杭电服务器，不增加新的目录开放规则。原项目课程实践声明保留；素材登记不将官网可下载自动解释为独立公开转载或商用许可。

## 验证与证据

最终生产构建及其严格类型检查成功，131模块；工程检查通过（13份必需文档、309个本地链接、4个仓库Skill及78份校验文件）。既有地图分包大于500KB的提示保留，本轮未调整其他模块。

Chrome/Edge最终54/54通过，无跳过、失败或flaky：新校标专项10项、原最终精修16项、原本章28项。原回归继续覆盖桌面1920×1080/1440×900及横屏932×430/844×390/740×320/667×375、200字及IME、长文完整PNG、输入过程中生成失效、Canvas/字体/剪贴板后备、动态高度、方向变化、原地图状态及真实同源影像。专项实际落盘PNG为1080×1440，校标与官方SVG等比绘制后的像素一致；各访问来源无外部HTTP请求或页面错误。

首轮完整测试50/54，四处失败来自两个截图定位case及两个未设置局域网4174地址的case；保留 `initial-results.json` 和 `initial-failures/`。在资源就绪后为截图重新定位，并明确 `LAN_TEST_URL` 后，最终同一套54项全通过；不把前后重复跑次累加覆盖数。加载期间另保留画幅占位，最终比例采用原SVG小数viewBox。

命令为 `npm run test:browser -- tests/legacy-emblem.spec.ts tests/legacy-final.spec.ts tests/legacy.spec.ts --project=chrome-1920 --project=edge-1920`，设置 `LEGACY_EVIDENCE_DIR=output/playwright/legacy-emblem/regression`、`LAN_TEST_URL=http://10.75.233.125:4174`。证据位于 `output/playwright/legacy-emblem/`：`final-results.json`、六份 `*-review.json`、`build.log`、`setup-validation.log`。真实手机Safari/Android、系统保存及校园网客户端隔离未作真机测试；桌面浏览器触摸视口与IP访问单独记录。

新增 `tests/legacy-emblem.spec.ts`：桌面1440×900、横屏844×390、局域网IP844×390；逐像素比较官网原件、默认预览、实时预览、生成图与重新解码的实际下载PNG中的校标区域，同时校验原件/public/dist/HTTP字节一致。另覆盖加载失败后重试、首次慢加载不能提前导出。

截图与实际导出：

- [桌面默认预览](../output/playwright/legacy-emblem/chrome-1920-desktop-default.png)
- [桌面实时预览](../output/playwright/legacy-emblem/chrome-1920-desktop-live.png)
- [桌面生成后](../output/playwright/legacy-emblem/chrome-1920-desktop-generated.png)
- [手机横屏实时预览](../output/playwright/legacy-emblem/chrome-1920-landscape-live.png)
- [局域网横屏生成后](../output/playwright/legacy-emblem/chrome-1920-lan-landscape-generated.png)
- [实际下载PNG样例1080×1440](../output/playwright/legacy-emblem/chrome-1920-desktop-export.png)

本轮修改文件：`src/features/legacy/keepsake.ts`、`KeepsakePreview.tsx`；新增同目录 `keepsakeBrand.ts`、`public/legacy-brand/hdu-official-white.svg`、`src/data/history/legacy/brand-register.json`、`tests/legacy-emblem.spec.ts`及本文，追加任务看板。`YouthAnswer.tsx`、全章CSS、路线SVG、所有旧图片和字体均未改动。
