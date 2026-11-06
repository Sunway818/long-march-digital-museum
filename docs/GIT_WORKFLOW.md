# Git 版本管理规范

只管理当前本地项目。未经用户明确指令不创建 GitHub 远程仓库、不添加远程地址、不执行 push。

## 分支

- `main`：稳定、可验收的版本；准备阶段首次提交从 main 建立。
- `dev`：日常集成，首次提交后从同一提交建立，初始工作分支保留 main。
- 功能分支：从 dev 创建，如 feature/homepage、feature/timeline、feature/interactive-map、feature/historical-events。
- 修复可采用 fix/问题名称；文档可采用 docs/主题。

合并前检查差异、测试和史料影响；未经授权不改写已共享历史。禁止 git reset --hard、git clean -fd、强制覆盖用户改动。检查存在的仓库与修改后再操作，不把用户未提交文件混入本任务提交。

## 提交规范

采用 Conventional Commits：`类型: 说明`，可加范围。类型包括 feat、fix、docs、test、refactor、perf、chore。一次提交聚焦一个可审查变化，功能未完成不能写成已实现。

```text
chore: initialize long march anniversary project
docs: add project planning documents
feat: implement interactive timeline
feat: add dynamic army routes
fix(map): pause playback while dragging timeline
```

历史数据修改应在正文或提交说明附来源和核验范围；无关重构不混入功能提交。每个模块验证后再提交，提交说明与测试事实一致。

## 工作步骤

```powershell
git status --short --branch
git switch dev
git switch -c feature/interactive-map
# 完成当前模块并运行已建立的检查命令
git diff --check
git diff
git add -- <本次具体文件路径>
git diff --cached --stat
git diff --cached
git commit -m "feat: implement interactive timeline"
```

合并示例（相应阶段测试通过后）：

```powershell
git switch dev
git merge --no-ff feature/interactive-map
git switch main
git merge --no-ff dev
```

首次初始化仅在确认目录无仓库时执行 `git init -b main`；身份只使用用户提供的真实值，以 `git config --local user.name` 和 `user.email` 写入当前仓库，不修改全局设置。若身份缺失必须询问，不能编造。

## 敏感文件与提交前检查

.gitignore 排除 node_modules、dist、环境文件、日志、系统杂项；保留 .env.example、源代码、文档、四个项目 Skills、许可证和必要锁文件。不提交私钥、访问令牌、个人认证配置或临时下载缓存。

每次提交前检查 status、暂存文件清单、diff --cached 和敏感文件名。新目录可用明确 allowlist 暂存；已有目录禁止不经检查直接 git add .。检查 Git 用户身份，再提交；提交后复查当前分支、最后提交和未提交修改。

Skills 来源记录以 [SKILLS.md](SKILLS.md)与 [skills-provenance.json](skills-provenance.json)为准。升级需要重新审查和验证，不能无记录地拉取最新版本。

## 版本节点

建议核心闭环通过后标 v0.1.0、最终交付通过后标 v1.0.0；当前未创建发布标签。交付记录提交哈希、测试环境和运行步骤。Git 不是史料审核替代品，错误内容必须修正并留下来源追踪。
