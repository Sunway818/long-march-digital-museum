# GitHub 上传与部署核对

源码仓库采用 [GitHub Private](https://github.com/Sunway818/long-march-digital-museum)。现有 Git 历史和本地素材保存在原目录，上传范围由 Git 已跟踪文件和忽略规则过滤后的新增源码组成。

## 文件范围

| 拟纳入 | 用途 |
| --- | --- |
| `src/`、`public/`、`pictures/` | 网站代码、路由与样式、地图数据、已经接入的历史与校园影像、字体及许可、首页原图和动效资源 |
| `research/overnight_20261110/images/data/download-results.json`，以及 `images/downloaded_originals/` 内的 91 张登记影像 | Vite 校验并写入 `dist/history-media/` 的输入。已拒用的 AST-0005 保留在本地 |
| `scripts/`、`tests/`、`docs/`、`.agents/skills/` 与根配置 | 构建、校验和回归、教师评审与史料出处、带来源的项目技能目录 |
| `package.json`、`package-lock.json`、`vite.config.ts`、`tsconfig.json` 等 | 使用 Node.js 22.12+ 复现安装与构建 |

忽略 `node_modules/`、`dist/`、测试报告和录屏、`output/`、`artifacts/`、未登记原图和研究工作簿、编辑器个人设置、缓存和常见凭据文件。既有历史中的素材仍随相关提交保留。原始工作簿和阶段验证证据可按需从本地归档核对。

## 本地验证

- 在仅含拟上传文件的独立副本中，用 Node 24.21.0 与 npm 11.19.0 运行 `npm ci`、工程校验和生产构建。Windows 本机安装和构建通过。Vite 报告地图 JavaScript 分包约 1.65 MB，压缩后约 414 KB。
- 使用纯静态服务检查默认根路径和 `/long-march-review/` 子路径。Chrome 1440×900 桌面及 Edge 844×390 触摸横屏模拟共四组通过。各组检查了本地字体、地图底图与档案图、人物肖像、校园图和校标，并下载了实际生成的 PNG。检查范围内未出现页面脚本错误或站内资源请求失败。
- 清洁副本运行 Chrome／Edge 项目专项回归，8 项通过。2 项工作簿原件校验因本地归档未包含在副本中按预期跳过。
- 对拟上传快照及所有可达提交执行常见凭据格式与文件名筛查。未发现匹配的凭据。阶段文档仍包含当时的本机路径和局域网测试地址，浏览器检查脚本保留 Windows 安装路径。

## 静态托管

| 平台 | 项目配置 | 访问边界 |
| --- | --- | --- |
| GitHub Pages 项目站 | Actions 以 Node 22.12+ 执行 `npm ci` 和 `npm run build -- --base=/仓库名/`，上传并发布 `dist`。根域名站点用默认根路径构建 | 私有源仓库需要适用的付费或 Enterprise 套餐。对网站本身限制访问需符合 Enterprise Cloud 的发布条件 |
| Vercel | 选择 Vite 框架，安装命令 `npm ci`、构建命令 `npm run build`、输出目录 `dist`，根目录为仓库根目录 | Hobby 对 GitHub 组织拥有的私有仓库有限制；预览和生产域名的访问保护须分别确认 |

站内页面通过哈希定位。地图、档案影像、肖像和纪念笺校标随 Vite 部署路径加载。站点仅分发构建产物 `dist`。本地可用 `npm run preview -- --base=/仓库名/` 验证相同子路径。官方资料见 [Vite 静态部署](https://vite.dev/guide/static-deploy.html)、[GitHub Pages 发布来源](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)、[Vercel Git 仓库限制](https://vercel.com/docs/git)与 [Vercel 访问保护](https://vercel.com/docs/deployment-protection)。

## 素材与权限

- 首页长征主题图的原作者与公开授权待确认。部分历史档案影像、人物肖像和校园照片只确认了原始刊载来源，转载和网上公开展示权限仍待核查。
- 地图展陈登记的 91 张图片当前均未标为已获公开部署许可。私有仓库的阅读权限由项目方控制，第三方素材的使用范围仍须按原登记核对。
- 校标采用学校提供的素材，用于课程展示。学校标识的使用范围与纪念笺的课程实践定位见[校标使用记录](LEGACY_EMBLEM.md)。
- 字体保留 OFL 许可和来源记录。地图现代底图与地理数据见[地图开发说明](MAP_DEVELOPMENT.md)。逐图资料、限制和待核项见[影像与来源清单](FINAL_MEDIA_REGISTER.md)。
- 浏览器回归依赖本机 Chrome／Edge 安装位置。部分研究辅助脚本依赖本地归档或操作系统路径。站点构建、资源加载与访问者浏览均使用项目相对路径和站点部署路径。
