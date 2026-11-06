# 指定 Skills 安装与使用记录

安装日期：2026-11-06，Asia/Shanghai。项目最终只注册下列四个 Skills，均为实体文件，未安装到用户全局 Skill 目录。

## 安装结果

| Skill | 官方仓库 | 项目安装位置 | 版本/提交 | 安装与验证 |
| --- | --- | --- | --- | --- |
| frontend-design | https://github.com/anthropics/skills | .agents/skills/frontend-design | ca45fc496a3436251f191354091d557da31c15b5 | 文件检查通过；Codex repo/enabled=true |
| ui-ux-pro-max | https://github.com/nextlevelbuilder/ui-ux-pro-max-skill | .agents/skills/ui-ux-pro-max | npm ui-ux-pro-max-cli 2.15.0 | 文件/目录检查通过；Codex repo/enabled=true；Python 搜索脚本未运行 |
| cinematic-scroll-storytelling | https://github.com/MengTo/Skills | .agents/skills/cinematic-scroll-storytelling | 5ea1661a0e05d82b054553daaa6baf6d0233c33c | 文件/引用检查通过；Codex repo/enabled=true |
| web-design-guidelines | https://github.com/vercel-labs/agent-skills | .agents/skills/web-design-guidelines | 1.0.0；1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62 | 文件检查通过；Codex repo/enabled=true |

UI/UX 仓库审查快照提交为 b7d5353e0130feb8c5574ef1251f8a1db1873ccb；实际安装资产来自固定 npm 2.15.0，不能把仓库 main 的提交当成该包的精确源码版本。安装包 integrity：

```text
sha512-D0J/C40xrzzi5si6ZLtRGbEE5v3QjL7d4wJNnasmP3yfDSrGiuqVCdwQiqCNnIkbqOuVoA/uonR2o1WKXh3urw==
```

四项全部通过真实 Codex app-server `skills/list`（cwds 指向项目、forceReload=true），结果为 scope=repo、enabled=true、errors=[]，并非仅依据文件存在作出判断。原始发现摘要见 [skills-discovery.json](skills-discovery.json)，来源与逐文件校验和见 [skills-provenance.json](skills-provenance.json)。

## 安装前审查与执行方法

先检查 Node/npm 与网络，再读取官方 README、各 Skill 的 SKILL.md、相关脚本/模板和依赖。下载不执行仓库脚本；npm pack 和 npx 使用 --ignore-scripts。已审查官方 skills CLI 1.7.6 的本地来源、目录安全与复制逻辑；UI/UX CLI 2.15.0 的入口、模板生成、复制行为和 Python 入口。未执行仓库 demo、构建和维护脚本。

frontend-design 的官方说明主要面向 Claude，没有专属 Codex 安装命令；MengTo 官方说明采用可移植 SKILL.md 文件夹。采用 Vercel 官方 `skills add` CLI 将审查后的固定提交本地文件夹复制到 Codex 项目目录；Vercel Skill 使用同一官方安装工具并明确只选择单项。

```powershell
# <reviewed-skill-folder> 是固定提交的官方 Skill 文件夹
npx --yes --ignore-scripts skills@1.7.6 add <reviewed-skill-folder> --agent codex --copy --yes
```

三项上游路径分别为：`skills/frontend-design`、`agent-skills/web-design/cinematic-scroll-storytelling`、`skills/web-design-guidelines`。

UI/UX 按用户指定官方方式，固定版本执行：

```powershell
npx --yes --ignore-scripts ui-ux-pro-max-cli@2.15.0 init --ai codex
```

该命令在项目外暂存目录运行，因为 2.15.0 会附带其他子 Skills。只将生成的 `ui-ux-pro-max` 文件夹复制进当前项目，额外子 Skills 未加入项目或全局目录。项目中保留原始资源、搜索脚本及相关许可证。

官方安装器为本地来源生成的临时路径锁文件不适合迁移，已用项目自有的 skills-provenance.json 统一记录四项仓库、精确版本、上游路径与逐文件 SHA-256；它是审计清单，不声称是官方 CLI 的更新锁格式。升级时从官方来源重新获取并核验，禁止自动依赖临时目录。

## 失败、替代与能力限制

- 沙箱内 GitHub `Could not resolve host`、npm `ENOTFOUND registry.npmjs.org`；联网执行后 npm ping 成功、GitHub 提交查询成功。
- MengTo 完整克隆耗时，改用官方 Git 稀疏克隆仅取所需文件夹；不从非官方镜像替换内容。
- 沙箱写入 .agents 被拒绝，授权执行后复制成功，没有覆盖原有文件。
- 内置 skill-installer 为 Python 脚本；本机 python.exe 是无法启动的 WindowsApps 别名，py 未找到，故采用已审查的官方 skills CLI 完成复制。
- UI/UX 搜索脚本依赖 Python 3 标准库；当前没有可用解释器，未完成运行冒烟测试，不能声称该能力已通过。Skill 文本和静态数据仍可读取。后续由用户提供可用 Python 或选择不使用搜索；当前不擅自安装系统软件。
- web-design-guidelines 审查时需重新读取其指定的官方在线规则；本次没有正式页面可审查，未声称通过网页质量验收。

## 调用与本项目场景

| Skill | 用途 | Codex 调用示例 | 项目时机 |
| --- | --- | --- | --- |
| frontend-design | 视觉方向、版式、字体和避免模板化 | `$frontend-design 请根据 DESIGN_SYSTEM.md 提出首页视觉方案，暂不编码。` | D2 方案、D3 首页、D10 精修 |
| ui-ux-pro-max | 设计系统、响应式、交互和无障碍建议 | `$ui-ux-pro-max 审查地图时间轴的键盘和移动交互方案。` | D2 规范、D5—7 控件、D11 体验检查 |
| cinematic-scroll-storytelling | GSAP/Lenis 叙事、视差和章节转场 | `$cinematic-scroll-storytelling 按已确认方案实现章节动画并清理生命周期。` | D9 统一动画；不能照搬作品集 demo |
| web-design-guidelines | 响应式、可访问性、性能和 UX 审查 | `$web-design-guidelines 审查 src/features/journey-map 下的界面。` | 每模块及 D11—12 验收 |

可用自然语言要求“使用某 Skill”；CLI/IDE 可通过 `/skills` 或 `$` 查看/选择。安装后下一个回合应可使用；若选择器未更新，重启 Codex 再检查。官方说明支持项目 `.agents/skills` 的发现；本次已另行通过真实发现接口验证。

Skill 是指导，不代表功能自动实现或历史内容自动可靠。使用时以用户要求、AGENTS.md 和已确认项目规范为约束；不得因 Skill 示例而引入无关页面、额外安装、发布或史料填充。

## 官方依据

- [Codex 本地 Skill 结构和发现](https://learn.chatgpt.com/docs/build-skills)
- [Codex app-server skills/list](https://learn.chatgpt.com/docs/app-server)
- [Anthropic 官方仓库](https://github.com/anthropics/skills)
- [UI UX Pro Max 官方安装说明](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill#installation)
- [MengTo 官方仓库](https://github.com/MengTo/Skills)
- [Vercel 官方仓库](https://github.com/vercel-labs/agent-skills#installation)

不安装这四项之外的项目 Skill。新增或升级 Skill 必须有任务依据，并重新审查源文件、脚本、依赖和来源版本。
