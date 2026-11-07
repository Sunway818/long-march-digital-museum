# 伟大征程

纪念中国工农红军长征胜利九十周年沉浸式数字展馆，大学课程实践项目。

当前阶段：Day 3 首页已实现。采用 React + Vite + TypeScript + Tailwind CSS + GSAP；只有首页、影像说明与明确标记的展馆入口占位，其他正式模块尚未开发。计划周期为 14 天，日历基线见开发计划。

## 本地运行

需要 Node.js 22.12+（本次使用 24.21.0）、npm；图片和字体均在项目内，无线上字体服务。原始图片本次作为首页直接资源纳入本地版本管理，未经改动，不代表获准公开发布。

```powershell
npm ci
npm run dev
```

浏览器打开终端提示的本地地址，默认 http://127.0.0.1:5173/。停止服务使用 Ctrl+C。

```powershell
npm run typecheck
npm run build
npm run preview
npm run test:browser
```

测试配置使用本机 Windows Chrome 与 Edge 的标准安装路径，覆盖 1920×1080、1366×768；没有安装浏览器时先安装所需浏览器或按实际路径调整测试配置。Playwright 测试自动启动 4173 生产预览；测试前须先 build。截图可执行 `node scripts/capture-homepage.mjs final`（需已运行 dev，或设置 PREVIEW_URL 指向 preview）。本地 QA 产物 output/playwright 和 test-results 不提交。

首页：导航未来章节/开启征程会定位到“展馆入口”并说明待开放；不会展示伪造地图。影像说明可打开、Escape 关闭；减少动态效果时立即静态展示。详见 [Day 3 验证](docs/DAY3_VALIDATION.md)。

## 阅读入口

- [项目概要](docs/PROJECT_BRIEF.md)与[正式需求](docs/REQUIREMENTS.md)
- [视觉规范草案](docs/DESIGN_SYSTEM.md)、[技术架构](docs/TECHNICAL_ARCHITECTURE.md)、[交互设计](docs/INTERACTION_DESIGN.md)
- [历史数据计划](docs/HISTORICAL_DATA_PLAN.md)与[史料来源管理](docs/HISTORICAL_SOURCES.md)
- [14 天计划](docs/DEVELOPMENT_PLAN.md)、[任务看板](docs/TASK_BOARD.md)、[测试计划](docs/TEST_PLAN.md)
- [报告大纲](docs/REPORT_OUTLINE.md)、[Git 工作流](docs/GIT_WORKFLOW.md)、[Skills](docs/SKILLS.md)
- [环境检查](docs/ENVIRONMENT_CHECK.md)与[准备阶段验证](docs/SETUP_VALIDATION.md)

后续开发先阅读根目录 [AGENTS.md](AGENTS.md)。正式内容只使用有依据且已审核的资料；示意路线必须标注精度和局限。

## 项目文档与资源检查

```powershell
node scripts/verify-setup.mjs
git status --short --branch
```

当前验证结果、版本与限制见 DAY3_VALIDATION。资源来源、许可与字体复现见 [资源说明](src/assets/README.md)。下一阶段再核验底图与路线数据，不将首页完成描述为全站完成；未经明确授权不部署或推送。
