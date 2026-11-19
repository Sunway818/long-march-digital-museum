# 伟大征程

纪念中国工农红军长征胜利九十周年沉浸式数字展馆，大学课程实践项目。

课堂交付版包含首页、时空长征、英雄人物和精神传承。以 [评审入口与验收清单](docs/FINAL_ACCEPTANCE.md)、[课程实践报告](docs/COURSE_PRACTICE_REPORT.md) 为准；阶段记录用于追溯。地图使用 MapLibre GL JS 的 WebGL 渲染与本地 GeoJSON，时间轴自1934年10月10日中央红军开始战略转移起算。较早的先遣行动仍在资料和总览中保留。

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

首页导航为首页、时空长征、英雄人物、精神传承。地图入口 `/#map`，遵义会议档案 `/#map?archive=EVT-001`，英雄人物 `/#people`，精神传承 `/#legacy`，答卷 `/#legacy/answer`。默认访客界面不显示内部整理状态。影像出处、素材性质与公开使用边界见 [影像与来源清单](docs/FINAL_MEDIA_REGISTER.md)。

地图默认聚焦长征沿线，放大后逐层显示节点与地名；1936年接应路线可单独开关。现代省域、区域方向和时间裁切用于阅读参照，不等于历史行政边界、精确道路或逐日部队位置。[路线勘误](docs/MAP_ROUTE_CORRECTIONS.md)保留分路、番号和会师归属依据；[地理复核](docs/MAP_ROUTE_AUDIT_20261112.md)与[地图开发说明](docs/MAP_DEVELOPMENT.md)用于追溯数据和设计过程。

本地地址依赖 Vite 进程持续运行，保留终端；Ctrl+C、退出相关进程或重启电脑后，重新在项目目录执行 `npm run dev`。标签页本身不提供服务，不需要因此重新安装依赖。

2026-11-08：首页红旗已接入唯一 16px 中等档的局部 WebGL2 动画，与云雾、朝阳共用单个环境动效按钮。初始化失败回退完整原图，reduce 静态。实现与实际验收记录见 [旗帜集成](docs/FLAG_INTEGRATION.md)。独立实验中的多档控件不进入正式首页。

## 阅读入口

- [项目概要](docs/PROJECT_BRIEF.md)与[正式需求](docs/REQUIREMENTS.md)
- [视觉规范草案](docs/DESIGN_SYSTEM.md)、[技术架构](docs/TECHNICAL_ARCHITECTURE.md)、[交互设计](docs/INTERACTION_DESIGN.md)
- [历史数据计划](docs/HISTORICAL_DATA_PLAN.md)与[史料来源管理](docs/HISTORICAL_SOURCES.md)
- [14 天计划](docs/DEVELOPMENT_PLAN.md)、[任务看板](docs/TASK_BOARD.md)、[测试计划](docs/TEST_PLAN.md)
- [报告大纲](docs/REPORT_OUTLINE.md)、[Git 工作流](docs/GIT_WORKFLOW.md)、[Skills](docs/SKILLS.md)
- [环境检查](docs/ENVIRONMENT_CHECK.md)与[准备阶段验证](docs/SETUP_VALIDATION.md)

后续开发先阅读根目录 [AGENTS.md](AGENTS.md)。正式内容只使用有依据且已审核的资料；示意路线必须标注精度和局限。

2026-11-16起，桌面与手机横屏均属正式交付目标；手机竖屏可选择继续浏览。统一规则、截图与真机待办见[双端适配记录](docs/MOBILE_LANDSCAPE.md)。生产构建后使用 `npm run preview -- --host 0.0.0.0` 进行课堂同网预览，访问终端输出的WiFi地址。按用户最终要求，电脑与手机统一显示已接入正文和图片；91张登记图片通过同源history-media路径进入dist，详见[内容一致性修复](docs/CONTENT_PARITY_FIX_20261116.md)。

## 项目文档与资源检查

英雄人物纪念馆已接入首页和地图导航：`#people`为16人四列肖像墙，`#people/chen-yun`等为可独立刷新的人物档案。原八幅影像的采用记录见[第一轮记录](docs/PEOPLE_MEMORIAL.md)；新增八人、七幅原图、全部档案扩充、肖像连续转场与双端验证见[第二轮记录](docs/PEOPLE_MEMORIAL_ROUND2.md)。正文仍为草稿，原L-02缺件及年代、许可待核问题保留。

```powershell
node scripts/verify-setup.mjs
git status --short --branch
```

各阶段验证结果与限制见对应文档，不以首页证据代替地图或全站验收。资源来源、许可与字体复现见 [资源说明](src/assets/README.md)。地图数据仍为draft，未经明确授权不部署或推送。

## 2026-11-17 精神传承正式接入

第四章六场景及本机青春纪念笺已实现。接入阶段见[精神传承记录](docs/LEGACY_CHAPTER.md)，现版入口、素材与验证以顶部评审材料为准。
