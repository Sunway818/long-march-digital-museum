# 指定 Skills 安装与使用记录

安装日期：2026-11-06，Asia/Shanghai。项目最终只注册下列四个 Skills，均为实体文件，未安装到用户全局 Skill 目录。

## 安装结果

| Skill | 官方仓库 | 项目安装位置 | 版本/提交 | 安装与验证 |
| --- | --- | --- | --- | --- |
| frontend-design | https://github.com/anthropics/skills | .agents/skills/frontend-design | ca45fc496a3436251f191354091d557da31c15b5 | 文件检查通过；Codex repo/enabled=true |
| ui-ux-pro-max | https://github.com/nextlevelbuilder/ui-ux-pro-max-skill | .agents/skills/ui-ux-pro-max | npm ui-ux-pro-max-cli 2.15.0 | 文件/目录检查通过；Codex repo/enabled=true；2026-11-07 Python 3.15.2 搜索验证通过（需沙箱外执行；配色匹配有限） |
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
- 2026-11-06 安装时，内置 skill-installer 为 Python 脚本，而当时 python.exe 无法启动、py 未找到，故采用已审查的官方 skills CLI 完成复制。
- 2026-11-06 未运行 Python 搜索；2026-11-07 复核已在授权沙箱外环境通过，沙箱内 WindowsApps 入口仍不可运行，详见下节。未安装 pip 包或系统软件。skills-provenance.json 中 runtimeStatus 保留安装当日快照，当前运行状态以本节复核为准。
- web-design-guidelines 审查时需重新读取其指定的官方在线规则；本次没有正式页面可审查，未声称通过网页质量验收。

## Python 环境与搜索复核（2026-11-07）

### 解释器与安装位置

- 从项目根目录调用 `python --version`，授权沙箱外环境返回 **Python 3.15.2**；实际 `sys.version_info.major == 3`，64 位 AMD64。
- `Get-Command python` 和 `where.exe python` 指向 `C:\Users\czx\AppData\Local\Microsoft\WindowsApps\python.exe`；实际 `sys.executable` 为 `C:\Users\czx\AppData\Local\Python\pythoncore-3.15-64\python.exe`。
- 沙箱内相同命令仍报 WindowsApps 程序无法访问；这不代表本机未安装 Python。本次 AST 审查和搜索均经授权在沙箱外执行，没有改动 PATH、别名、解释器或系统设置。
- Skill 实际目录：`E:\长征2\.agents\skills\ui-ux-pro-max`；已读取 `SKILL.md`、`scripts/search.py` 以及相关本地模块。

### 来源、依赖与源码审查

来源仍为上述官方 npm `ui-ux-pro-max-cli@2.15.0`。运行准备检查通过，全部 78 个已安装 Skill 文件与安装审计清单一致；本次未修改、删除或替换任何 Skill 文件。

审查了 scripts 顶层的 search.py、core.py、design_system.py、reasoning_contract.py、validate_data.py 五个文件，使用源码阅读与 Python 标准库 AST 解析检查导入和敏感调用；AST 阶段只读取源码，不导入或执行 Skill。

- 搜索导入链：`search.py → core.py / design_system.py → reasoning_contract.py`。
- 第三方 Python 包依赖：**0**。外部依赖均属于标准库，如 argparse、csv、json、sys、io、os、re、difflib、pathlib、math、collections、datetime、tempfile；其他导入为同目录模块。validate_data.py 另用 hashlib、statistics、urllib.parse，后者仅解析 URL，不执行网络请求。
- 普通搜索用 `open(..., 'r', encoding='utf-8')` 读取本地 data/*.csv，建立内存索引后输出结果；未发现该执行链中的联网请求、shell/subprocess 调用或内置 eval/exec 动态执行。`re.compile` 是正则编译，不是动态执行 Python 源码。
- `design_system.py` 包含正常的可选持久化功能：创建目录、写临时文件、硬链接发布或显式 force 覆盖、清理临时文件（os.link/replace/unlink）。这些功能不是搜索必需，仅在启用设计系统持久化时触发，不能误报“整份源码没有文件写入”。本次没有使用 `--design-system`、`--persist` 或 `--force`。
- 本次所有搜索增加 `-B`，禁止生成 __pycache__/字节码；不执行 CSV 中返回的代码示例。scripts/tests 不属于本次搜索运行链，没有运行其测试套件。本结论限定于本次版本、审查范围和命令，不是对任意未来版本的安全保证。

search.py 的 SHA-256 为 `8373e2dd2d560d9853ec116140de0e0d5bee45a6abe5e041173c84e1c36a7f87`，与来源审计记录一致。

### 实际执行与结果

全部命令从 `E:\长征2` 执行。基础命令如下，退出码 0、返回 1 项 `Parallax Storytelling`：

```powershell
python -B .agents/skills/ui-ux-pro-max/scripts/search.py "cinematic historical museum website" --domain style
```

项目测试使用相同脚本与 `-B`，追加下列查询及参数和 `--json`。没有仅凭退出码判断检索是否命中，同时检查 count、结果类别与场景匹配。

| 项目主题 | 初次查询与模式 | 初次结果 | 一次重试 | 结论 |
| --- | --- | --- | --- | --- |
| 历史数字展馆视觉风格 | `"historical museum immersive" --domain style` | 0 项，无脚本错误 | `"parallax storytelling" --domain style` → 1 项 Parallax Storytelling | 检索可用；命中通用沉浸叙事模式，不是历史展馆专用视觉方案 |
| 深红与暗金配色 | `"deep red antique gold" --domain color` | 3 项，首项 Brewery/Winery | `"burgundy gold" --domain color` → 3 项，首项仍为 Brewery/Winery | 检索可用，只有色调层面部分匹配；没有得到可直接采用的历史展馆完整配色 |
| 电影级滚动叙事 | `"cinematic scroll storytelling" --domain gsap` | 3 项：Scroll Reveal 与 Parallax Scroll | 无需重试 | 场景相关；含滚动驱动、减少动态效果和移动性能提示 |
| React 前端设计规范 | `"component accessibility responsive" --stack react` | 0 项，无脚本错误 | `"effect cleanup" --stack react` → 3 项：Effect 清理、依赖与相关 Hook 规则 | 聚焦生命周期后的检索通过；不代表已覆盖全部响应式和无障碍规范 |
| GSAP 动画设计 | `"scroll reveal reduced motion" --domain gsap` | 3 项 Scroll Reveal：Subtle/Standard/Complex | 无需重试 | 场景相关；含 React 清理和减少动态效果提示 |

共执行 **9 次搜索进程**（基础 1 次、项目初查 5 次、聚焦重试 3 次），退出码全部为 0；两次初查为空、配色仍部分匹配均已保留。查询使用英文关键词以匹配本地英文数据集，本次没有验证中文自然语言检索能力。

结论：Python 3.x 和 UI UX Pro Max 基础/项目检索运行能力已验证，可用于后续辅助设计；每次结果仍需结合本项目判断。未将结果写入设计系统或正式页面，未修改已确认/待确认的视觉令牌，未执行返回的 React/GSAP 代码，也未安装业务依赖。React/GSAP 返回条目的技术时效和实际实现效果留待开发时核验。

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
