# 首页精修与验证记录

## 第二轮基线（2026-11-07）

范围：四模块导航和三处待开放入口、旧时间轴/历史瞬间锚点归并地图、移除跳过片头、木纹 CTA、局部环境动画与暂停控制。原图 SHA-256 保持 f9dd8a4659a5ddb27c909e791a0630e8e4a5b054b00cd9fd73fa51d151935c37；没有修改史料、地图、依赖或公开发布。

`npm run typecheck`、`npm run build` 通过；`npm run test:browser` 36 passed，0 skipped/failed/flaky，实际 Chrome 157.0.8103.38 / Edge 157.0.4341.42，各 1920×1080、1366×768。新增覆盖旧锚点归并、片头按钮不存在、激活状态、暂停、离屏恢复、运行中 reduce 切换和后台分支（模拟 document.hidden，不能等同物理标签页实测）。首次导航激活测试发现状态问题，已修正并回归通过。

第二轮截图在 output/playwright/refine-*，Day 3 初版稳定帧用作修改前基线；均为本地 QA，不进入 Git。旗帜受单张原图限制：外边缘锁定，内部静态位移纹理与小于 1px 的叠层运动，不声称真正分离旗面。动画、IntersectionObserver、媒体查询和 visibilitychange 在卸载清理。

用户第三轮反馈：光与雾几乎不可见，木牌仍偏现代。确认原因是光雾位于深色遮罩下且位移/不透明度过低，第二轮不能视为视觉达标；本轮将用亮暗帧、时间点截图和控件局部截图验证改进，不只记录功能结果。

## 第三轮：可感知的暖光、雾流与旧木牌

基线提交：1ad8a6a。第三轮保留方案 A、原始 PNG、标题/副标题/年份、四导航、2.2 秒片头与现有旗面参数；只增强光、雾、木牌和必要的分层/资源代码。未安装任何新工具、包或 Skill。

### 实际使用的三个 Skills

已读取 `.agents/skills/frontend-design/SKILL.md`、`ui-ux-pro-max/SKILL.md`、`cinematic-scroll-storytelling/SKILL.md`。

| Skill | 对本轮的具体影响 |
| --- | --- |
| frontend-design | 视觉记忆仍由原图与书法承担；按钮使用不规则木纹、木结与磨损边缘，移除铜牌式双框；光源对准原图朝阳，不给标题加发光动画 |
| ui-ux-pro-max | 深褐字搭配暖木底，hover 保留纹理、仅 8% 提亮/1px 触感和 3px 箭头位移；保留键盘焦点、点击、暂停和 reduce。只读搜索 `button hover contrast --domain ux -n 2` 返回 Contrast Readability 与 Hover vs Tap，采用可读性/点击语义，不把通用结果当木纹素材方案 |
| cinematic-scroll-storytelling | GSAP 复用单一环境时间线，sine.inOut/yoyo 无跳帧归零；光雾与滚动视差同向协调，缓存雾图仅 transform/opacity，不每帧重算滤镜；后台/离屏/卸载与 reduce 继续清理或暂停 |

### 参数与图层修改

| 项目 | 第二轮 | 第三轮 |
| --- | --- | --- |
| 朝阳层级 | 与原图一起位于深色遮罩下 | 单独 Atmosphere，遮罩上方、文字/控件下方，pointer-events:none |
| 朝阳 | 单层 opacity .10—.22，完整周期 10s | 内层 .08—.40，外层 .05—.26，完整周期 7.6s；轻扩散 1—1.04 / 1—1.025；中心对应原图 (1496,440)/(1496,425)，天空轮廓遮罩保护山脊 |
| 远景雾 | SVG 原图坐标 -6→10，单程 18s | 缓存透明纹理，CSS x:-40→80px，单程 16s，opacity .16—.28 |
| 山谷雾 | 原图坐标 7→-12，单程 13s | CSS x:34→-80px、y:0→-8px，单程 11s，opacity .14—.24 |
| 局部薄雾 | 无 | CSS x:-12→24px，单程 14s，opacity .06—.12 |
| 木牌 | 几条较规则纹路、双线框 | 68 条弯曲疏密纹、绕木结弯曲的纹理、噪声色差、边缘磨损；独立面层+深色木质侧边，微小不规则轮廓，无大圆角 |

三个雾层为项目原创 SVG，不是椭圆渐变；贝塞尔不规则轮廓、静态位移纹理与柔化叠加，在固定前景遮罩内移动，保护旗手与队伍。单程含回程的完整周期为 32/22/28 秒，位移不在循环边界跳回。旗面已有滤镜、遮罩和两条 tween 数值未改。

### 浏览器调试证据

1. 先检查实际图层与参数，再捕获第二轮自然时序，保存 enhance-before-*。
2. 临时将光提高至 .8、雾提高至 .55，确认局部确实可见（enhance-debug-visibility.png）；该规则仅注入 QA 页面，随后移除，不进入产品。
3. 初版动态 SVG 在 1920 的 RAF 样本均值约 19.13ms / P95 33.5ms；改为静态 SVG 图像缓存+HTML transform。像素比较抓到热更新中遮罩 URL 错误，修复为显式资源导入，重新截图确认雾层不再全透明。没有以“样式在变化”冒充实际可见。
4. 最终在 Chrome/Edge 的两档尺寸分别保存自然开始、较亮、中后段较暗帧与按钮正常/悬停局部；副标题、书法与主体位置保持。时间报告记录真实 elapsedMs（约 2/4/8 秒，包含截图开销），不是伪造视频或强制 GSAP seek。

固定区域的较亮/较暗截图 RGB 平均绝对差（0—255）如下；它证明图像发生变化，不替代审美或实体显示器判断：

| 画幅 | 朝阳：前→后 | 云雾：前→后 |
| --- | --- | --- |
| 1920×1080 | 0.109 → 14.077 | 0.110 → 3.289 |
| 1366×768 | 0.109 → 14.239 | 0.101 → 3.430 |

1920 固定雾区约 38.9% 像素差超过 3/255，朝阳区约 85.85%；旗面区域均差维持约 .48—.50，符合保留原动效。雾层从开始到后段的变换矩阵记录可直接核查位移，并非只改变透明度。

最终四组 4 秒 headless RAF 样本各 240 帧，均值约 16.66ms，P95 16.9—17.3ms；是本地浏览器观察，不冒充硬件 GPU/实体显示器、长期帧率或 Lighthouse 成绩。无错误与横溢出，原图仍约 2.8MB，原性能传输预算问题未因本轮消失。

### 复现、证据与边界

运行 `npm run dev`，刷新 http://127.0.0.1:5173/，片头结束后观察 8—10 秒；右下角可暂停/恢复。保持服务进程，关闭服务需再次启动。后台状态分支自动测试使用 document.hidden 模拟，未冒称实体标签页/显示器校验。

`node scripts/review-ambient.mjs enhance-after` 重新采集四组时序与按钮截图；`node scripts/compare-ambient.mjs` 比较已保存的前/后真实截图。PREVIEW_URL 可指向生产预览；截图/JSON 均在 output/playwright、被 Git 忽略，未公开发布。没有录屏，也未安装录屏工具；以三时间点原始截图及可操作的本地动态页面交付。

最终 `npm run typecheck`、`npm run build`、`node scripts/verify-setup.mjs` 通过；`npm run test:browser` **40 passed**（3.4 分钟，0 failed/skipped/flaky）。Chrome/Edge 每档 10 项；新增验证 5 秒内雾层实际移动超过 10 CSS px、朝阳跨过 .34/.12 的亮暗区间、标题颜色/透明度保持不变。采样记录中，1920 山谷雾开始到后段 x 从约 21.82 到 -64.94 CSS px，约移动 86.76px。

通过现有 `web-design-guidelines` Skill 获取 2026-11-07 [官方规则](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md)审查：WoodenCta 保留语义链接/焦点/修饰键，装饰图含空 alt/尺寸与 aria-hidden，图层不拦截指针，持续动画可暂停且 reduce 隐藏。未做完整读屏器与 WCAG 审计。

最终构建 JS 353.47KB（gzip 119.82KB）、CSS 34.06KB（gzip 10.08KB），木纹 SVG 67.36KB（gzip 20.83KB）；三雾图和遮罩各小于 4KB，由 Vite 内联。没有新的运行依赖。主观的旧木质感、实体演示机正常亮度与长期流畅度仍应现场复核；不宣称自动测试能够决定艺术效果。
