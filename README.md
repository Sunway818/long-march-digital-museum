# 伟大征程

纪念中国工农红军长征胜利九十周年沉浸式数字展馆。杭州电子科技大学学生课程实践作品。

## 展馆内容

| 章节 | 入口 | 内容 |
| --- | --- | --- |
| 首页 | `/#home` | 展馆导览、本地字体与山河光影，访客可暂停环境动效 |
| 时空长征 | `/#map` | 四支部队的历史路线、1934 年 10 月 10 日起的联动时间轴、事件档案与四渡赤水专题 |
| 英雄人物 | `/#people` | 十六位人物的肖像和独立档案，如 `/#people/chen-yun` |
| 精神传承 | `/#legacy` | 长征精神与杭电求学实践，`/#legacy/answer` 可在本机生成并下载青春纪念笺 |

路线为区域方向示意。较早的先遣行动仍可在总览和资料中查阅。历史影像的性质、原始来源和许可状态见[影像与来源清单](docs/FINAL_MEDIA_REGISTER.md)。课堂验收以[评审入口](docs/FINAL_ACCEPTANCE.md)与[课程实践报告](docs/COURSE_PRACTICE_REPORT.md)为准。

## 技术与目录

React、TypeScript 与 Vite 构建静态单页站点，GSAP 负责部分叙事动效，MapLibre GL JS 使用 WebGL 与本地 GeoJSON 渲染地图。站内采用 URL 哈希导航，纪念笺通过浏览器 Canvas 生成。正常运行无需后端、账号、环境变量或地图 API 密钥。

- `src/` 包含页面、交互、历史数据、字体和图像资源。首页原图在 `pictures/`。
- `public/` 包含 GeoJSON、人物肖像、校园影像、校标与字体许可。
- `research/overnight_20261110/images/` 中的登记图片和清单是 Vite 构建输入。构建校验原字节并将 91 张登记图像写入 `dist/history-media/`。
- `scripts/`、`tests/`、`docs/` 包含工程检查、回归测试与资料来源。部分阶段文档指向本地的 `output/`、`artifacts/` 验证证据；这些证据和原始研究工作簿由项目方另行保管。

## 启动与验证

需要 Node.js 22.12+ 与 npm。依赖由 `package-lock.json` 锁定。

```sh
npm ci
npm run dev
```

默认打开 `http://127.0.0.1:5173/`。按 Ctrl+C 停止服务。

```sh
node scripts/verify-setup.mjs
npm run build
npm run preview
```

`npm run build` 包含严格 TypeScript 检查，输出为 `dist/`。预览默认使用 `http://127.0.0.1:4173/`。课堂同网预览可使用 `npm run preview -- --host 0.0.0.0`，仅向受信任的局域网开放。

运行 `npm run test:browser` 前先构建。项目的 Playwright 配置使用 Windows 标准路径下的 Chrome 与 Edge，部分用例模拟手机横屏和触摸。原始工作簿哈希测试仅在本地归档存在时执行。详细矩阵见[测试计划](docs/TEST_PLAN.md)和[双端适配记录](docs/MOBILE_LANDSCAPE.md)。

## 静态托管与素材

- 域名根目录或 Vercel 使用 `npm ci`、`npm run build`，托管目录设为 `dist`。
- GitHub Pages 项目站点使用 `npm run build -- --mode github-pages`，将资源基路径设为 `/long-march-digital-museum/`。仓库中的 `.github/workflows/deploy.yml` 使用同一命令，由 `main` 推送或手动运行触发，并发布 `dist`。
- 在本地验证 Pages 构建时，运行 `npm run preview -- --mode github-pages`，浏览器访问 `http://127.0.0.1:4173/long-march-digital-museum/`。回到常规本机或校园网预览前，用 `npm run build` 重新生成根路径版本。
- 仓库可见性和 Pages 访问权限分别配置。公开上线前需按逐图登记核对转载和公开展示权限。

账号条件、部署步骤和素材风险见 [GitHub 上传与部署核对](docs/GITHUB_PREPARATION.md)。后续开发请先阅读 [AGENTS.md](AGENTS.md)。
