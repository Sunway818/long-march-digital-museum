# Day 3 首页开发与验证

范围：首页、导航、影像说明、展馆入口占位；其他正式模块未实现。不部署、不推送。桌面方案 A；志莽书法标题、思源宋体正文、思源黑体功能字；暖红 #8A2E22 用于本次候选实现，未视为全站冻结。

## 分阶段记录

1. 静态：首页两种指定尺寸在 Chrome 已运行和截图检查，图像 1672px 原始宽度加载，无溢出、无控制台错误；未创建第二套网站或替换原图。
2. 字体：取得 Adobe 官方 SourceHanSerifSC-Regular.otf、SourceHanSansSC-Regular.otf 及 OFL；志莽来自已核验字体。制作仅覆盖本首页文字的本地 WOFF2，保留源 SHA 和许可；内部家族改名以符合 OFL 修改版名称要求，不冒充未修改原始字库。实际来源、大小、字重和覆盖见 src/assets/fonts/manifest.json。未安装系统字体。
3. 动画：GSAP 作用域管理短入场与 ScrollTrigger 转场，跳过片头、减少动态效果、卸载清理。未安装 Lenis 或 Motion；浏览器原生平滑滚动。
4. 最终：类型检查、生产构建、Chrome/Edge 指定尺寸各 6 类检查通过，共 24 项；无失败、跳过或 flaky。返回首页会同步地址，待开放章节按钮/导航刷新恢复真实状态；修复了返回后刷新误回章节入口的问题。

## QA 覆盖清单

| 体验/声明 | 功能与视觉检查 | 证据 |
| --- | --- | --- |
| 原图左旗右题、无溢出 | 1920×1080、1366×768 查看首屏 | 分阶段/最终截图与 metrics |
| 三种真实本地字体 | font ready/check、字体响应、字号与四字辨识 | 字体 manifest、截图 |
| 开启征程/向下探索/返回序章 | 真正点击、目标焦点、平滑滚动 | 浏览器测试 |
| 六项导航与五个后续章节入口 | 各项点击，状态提示真实显示待开放 | 浏览器测试与入口截图 |
| 影像说明 | 点击打开、Escape、Enter、关闭按钮、焦点恢复 | 浏览器测试与对话框截图 |
| 分时入场/滚动过渡 | 中间帧/稳定帧、滚动淡出、跳过入口 | 动画截图、opacity 检查 |
| 异常/降级 | 图片请求失败、reduce、800×600 缩窗 | 浏览器测试，不冒称手机适配 |

截图保存在 output/playwright，仅本地 QA；不代表图片获公开使用授权。历史数据文件和 Skill 未修改。新增业务源码只属于首页。

## 2026-11-07 最终运行结果

测试对象为本次 `feat: implement cinematic homepage` 提交中的代码；测试先于提交，具体哈希用 `git log -1` 查询，不在提交内自引用。

| 环境 / 命令 | 结果 |
| --- | --- |
| Windows、Node 24.21.0、npm 11.19.0 | 已实际安装/运行 |
| `node scripts/verify-setup.mjs` | 13 份必需文档、38 个相对链接、4 个 Skill/78 项上游哈希、字体校验通过 |
| `npm run typecheck` / `npm run build` | 通过；32 个模块，Vite 8.3.6 |
| `npm run test:browser` | 24 passed；实际 Chrome/Edge 可执行程序，headless 临时上下文 |
| Chrome 157.0.8103.38，1920×1080 / 1366×768 | 各 6 项通过；原图加载、真实字体、导航/按钮/焦点、滚动、降级、深链接刷新 |
| Edge 157.0.4341.42，1920×1080 / 1366×768 | 各 6 项通过；同上 |
| 最终稳定帧截图与控制台 | 四组截图，PNG naturalWidth=1672；无横向溢出、pageerror 或 console error |
| 800×600 缩窗、reduce、图片中断 | 控件仍可达，无横向溢出；不代表专门手机适配 |

两档尺寸是浏览器 CSS viewport，并非四台物理显示器。已实际查看 PNG：旗帜与主要人物保留在左侧，标题放置右侧，副标题与年份清晰；背景 source 1672×941 在 1920 上有放大，不能描述为原生 1920 分辨率。未进行实体低性能电脑、Windows 125%/150% DPI、Safari 或手机测试。

本地探索检查包含小步滚动、反向滚动、五项入口切换、对话框反复开关、缩窗和运行中切换减少动态效果；`exploration.json` 无脚本错误或横溢出。2 秒 headless RAF 样本约 16.58ms 均值、17ms P95，仅为本地观察，不是实际设备性能结论；未测正式 Lighthouse/LCP/CLS，不据此声称性能达标。

## 可复核证据

- `output/playwright/stage1-static-chrome-{1920,1366}.png`：静态构图阶段。
- `output/playwright/stage2-fonts-chrome-{1920,1366}.png`：真实字体阶段；既有三种候选对比仍保留在 `docs/design-review/`，正式首页使用已确认 A。
- `output/playwright/stage3-intro-mid.png`：入场中间帧；`final-{chrome,edge}-{1920,1366}.png`：生产预览最终帧。
- `final-entrance.png`、`final-source-dialog.png`、`final-window-800.png`：占位入口、影像说明与缩窗。
- `results.json`、`final-metrics.json`、`exploration.json`：功能、截图指标与探索记录。执行方法见根 README 和 tests/homepage.spec.ts；本地 QA 产物不进入 Git。

## 网页质量审查与边界

读取项目 `web-design-guidelines` Skill，并于 2026-11-07 获取[官方检查规则](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md)，检查首页源码。

- `src/utils/navigation.ts:12`：修复普通导航拦截修饰键的问题，保留 Ctrl/中键等浏览器原生行为；补齐返回与章节选择的 URL 状态。
- `src/styles/hero.css`：已补充暗色原生控件、dialog overscroll containment、程序化章节的键盘焦点样式。按钮/链接有焦点与 hover，主图有尺寸与 high priority；无无限循环装饰动画。
- 无表单、远程请求、长列表、视频、地图或历史资料计算，相关规则本轮不适用。未进行完整读屏器审计。

## 资源与剩余限制

- 图片直接导入 `pictures/山河壮阔的长征旗帜.png`，SHA-256 `f9dd8a4659a5ddb27c909e791a0630e8e4a5b054b00cd9fd73fa51d151935c37`；构建复制保持原始字节，不裁改源文件。作者、创作方式和授权待用户补充，未上传/部署。
- 三种 OFL 本地 WOFF2 约 1.93 / 82.20 / 57.68 KB，原生 Regular 400，非变量字体；为修改后的子集更名内部家族，保留完整许可与来源 SHA。没有依赖线上字体服务。
- JS 342.59 KB（gzip 116.79 KB），CSS 32.28 KB（gzip 9.57 KB）。原图 2,801,558 字节，使首屏总传输超出原定 1.5 MB / 单图 500 KB 预算；按用户要求保留原图，未擅自生成压缩派生资源。后续取得许可并单独确认衍生资源策略后再优化。
- 地图、历史时间轴等只显示待开放提示；没有开发对应业务，没有数据真实性核验完成或全站性能验收的声明。
