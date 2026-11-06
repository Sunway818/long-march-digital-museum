# 伟大征程

纪念中国工农红军长征胜利九十周年沉浸式数字展馆，大学课程实践项目。

当前阶段：项目准备。尚无正式网页、应用脚手架或业务依赖，不能运行网站。计划周期为 14 天，暂按 2026-11-06 至 2026-11-19 编排，实际开工调整时统一更新日期。

## 阅读入口

- [项目概要](docs/PROJECT_BRIEF.md)与[正式需求](docs/REQUIREMENTS.md)
- [视觉规范草案](docs/DESIGN_SYSTEM.md)、[技术架构](docs/TECHNICAL_ARCHITECTURE.md)、[交互设计](docs/INTERACTION_DESIGN.md)
- [历史数据计划](docs/HISTORICAL_DATA_PLAN.md)与[史料来源管理](docs/HISTORICAL_SOURCES.md)
- [14 天计划](docs/DEVELOPMENT_PLAN.md)、[任务看板](docs/TASK_BOARD.md)、[测试计划](docs/TEST_PLAN.md)
- [报告大纲](docs/REPORT_OUTLINE.md)、[Git 工作流](docs/GIT_WORKFLOW.md)、[Skills](docs/SKILLS.md)
- [环境检查](docs/ENVIRONMENT_CHECK.md)与[准备阶段验证](docs/SETUP_VALIDATION.md)

后续开发先阅读根目录 [AGENTS.md](AGENTS.md)。正式内容只使用有依据且已审核的资料；示意路线必须标注精度和局限。

## 本阶段检查

```powershell
node scripts/verify-setup.mjs
git status --short --branch
```

本阶段没有 `npm run dev`、构建或浏览器测试结果。下一阶段先确认视觉方向和历史素材范围，再初始化 React + Vite + TypeScript 工程。
