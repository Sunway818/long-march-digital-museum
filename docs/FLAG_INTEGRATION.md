# 首页旗帜正式集成与环境动效统一控制

日期：2026-11-08。任务基线：1164555；分支 feature/continuous-flag-motion。仅本地开发与提交，未部署或 push。地图等其他模块仍未开发。

## 最终行为

正式首页只用用户确认的 C 档 16px；1672×941 原图坐标、8 秒连续周期、原始斜向连接边外 28px 固定区、6px 网格间隔和原型位移方程全部保留。没有增加风力档位或更强波形；波峰从旗杆传向自由端，纹理/图案共用网格，末端位移采样最大约 15.999px，周期两端位移一致。没有动画结束后归零或只播放一次的逻辑。

首屏片头完成、分层资源与 WebGL 就绪后自动播放，不依赖鼠标、点击或滚动。唯一“暂停环境动效/播放环境动效”按钮控制旗帜、三层雾、两层朝阳，文字配安静的米金色图标、44px 最小高度、既有焦点样式；不改标题、导航、木牌及构图。

React 的 ambientMotionEnabled 保存用户意图，限定范围的 createAmbientAnimations 管理实际状态。唯一 ticker 回调只累加有效 elapsed；同一回调手动采样 paused GSAP 光雾时间线，并调用无独立时钟的 flagRenderer.render(elapsed)。手动暂停即移除 ticker，保留当前帧；恢复重建时间基准，不追赶暂停/后台时间。React 普通重渲染不重建动画。首页部分滚动继续，完全离屏或浏览器后台暂停，返回自动恢复，但不覆盖用户手动暂停。reduce 隐藏三种持续装饰效果、显示完整原图，初始 reduce 不创建 WebGL 渲染器。

## 图层与资源

原始完整图始终保留在底部。仅当旗面、Clean Plate、固定前景解码及第一次 WebGL 绘制全部成功时，原子显示分层：普通 Clean Plate 图 → 透明局部旗面 canvas → 普通固定前景图。其上延续阅读遮罩、光雾和 UI。初始化、纹理失败或 Context Lost 均隐藏整个分层，完整回退原图，不留下无旗背景。Context Lost 后本次挂载不重复重试，刷新可重建；后台切换无需重建。

GPU 仅上传 636×504 的 RGBA 旗面无损裁片，缓冲区 672×536（含16px运动余量），9,095 顶点/17,808 三角形；背景与前景不进 WebGL。canvas 与两张图同属原图运动容器，按居中的 cover 比例统一定位；ResizeObserver 重排暂停画面但不推进时间。使用预乘 Alpha、线性采样及 ONE/ONE_MINUS_SRC_ALPHA，不加模糊、重绘或新光照；裁片 Alpha 直接继承已验收 RGBA，蒙版与 Alpha 已在第一阶段验证相同。

src/assets/flag/manifest.json 记录原始输入与输出哈希。Clean Plate/前景为字节相同副本，旗面仅无损裁切；五份首阶段原件及 pictures 原图未覆盖。scripts/prepare-flag-assets.py 是可选本地准备步骤，需此前 artifacts/flag-separation-draft 输入和已有 Pillow；常规 clone/install/build 使用已提交生产素材，不需要实验目录或 Python。未新增依赖。

正式首页没有 A/B/C/D、幅度、底色、相位、图层或独立播放调试控件。此前独立实验保留，未混入正式包。旧 AmbientScene 不再导入，也不创建旧旗帜 tween。

## 实际检查与结果

命令：node scripts/verify-setup.mjs、npm run typecheck、npm run build、npm run test:browser、git diff --check。全部通过。首次测试发现 -0/0 断言差异及边缘接触视口时 IntersectionObserver 的零面积问题，已修正并完整复跑。

完整集成 E2E：**64 passed，5.8 分钟，0 failed/skipped/flaky**，原始报告另存 full-suite-results.json。随后最终截图发现雾图边界，给图像增加20%的等比裁切余量，避免漂移时露出矩形边。该样式修正后四组光雾针对性回归 **4 passed（1.3分钟）**、最终截图通过；不将前一轮完整回归冒称为样式修正后的全量重跑。Chrome 157.0.8103.38、Edge 157.0.4341.42，各 CSS viewport 1920×1080、1366×768，Windows headless，DPR 1。各组 16 项，包含原有导航、片头、木牌入口、说明对话框、深链接、缺图、reduce，以及：

- 无输入自动运行超过16.2秒，覆盖两个完整旗帜周期，实际旗面 canvas 像素变化；16px 固定参数，正式界面没有调试控件。
- 暂停500ms，旗面像素/时间、朝阳 opacity、云雾 transform 全部不变；打开/关闭说明引起 React 重渲染仍保持；恢复三项都推进且没有时间追赶。
- 部分滚动继续；离屏暂停/返回恢复；模拟 document.hidden 暂停且恢复不追赶，手动暂停不会被滚动或 reduce 切换覆盖。后台分支为明确模拟，不冒称实体标签切换测试。
- 缩窗后画布定位误差小于0.01 CSS px；补充1440×900；WebGL不可用、纹理失败、Context Lost整体原图回退。
- 160相位有向面积检查无翻转，连接点位移0，末端位移≤16px，8秒周期接缝数值连续。

额外运行 scripts/check-ambient-lifecycle.mjs：模拟 setup→立即cleanup→再次setup 的解码竞争，然后销毁。2个 Buffer、1个 Texture、2个 Shader、1个 Program、1个 VAO 创建/删除相等，存活数0，时钟停止；事件监听、ResizeObserver、IntersectionObserver、matchMedia和ticker均有卸载清理。

## 性能与视觉证据

运行 scripts/capture-integrated-flag.mjs，在完整回归结束后单独采集生产预览。证据位于 output/playwright/flag-integrated/：四组0/4/8秒附近自然时间截图与暂停帧、report.json；lifecycle.json 为清理记录。文件名为目标采样点，真实旗帜时间另存JSON（截图有开销），不是强制 seek。已实际查看1920和1366捕获帧检查画面融合与按钮。

设备：Windows 10.0.26200、Intel Core i7-9750H、ANGLE Intel UHD Graphics 630 / D3D11。最终四组各4秒、240个RAF间隔；均值16.659—16.660ms，P95 16.8—16.9ms，最大17ms，约60fps；WebGL error 0，正常页面无pageerror/console error。未测GPU timer、长期实体显示器、DPI/浏览器缩放或完整Lighthouse，因此不把RAF当GPU耗时或全站性能验收。暂停缓冲使用 preserveDrawingBuffer:true，仅局部画布，保证当前帧可保留。

构建：JS357.66KB/gzip121.73KB，CSS34.36KB/gzip10.15KB。资源还保留原图2.80MB、Clean Plate2.68MB、局部旗面232KB、前景45.6KB；首屏传输预算未达原规划，不能因流畅就声称加载性能达标。本轮按用户验收素材保持画质，未擅自改成压缩版本。

## Skills 与网页审查

已实际读取 frontend-design、cinematic-scroll-storytelling、ui-ux-pro-max 的项目 SKILL.md。前两者用于保持原画构图、单一克制运动与生命周期；UI/UX只读搜索 animation pause control / ux 返回自动内容控制和可取消状态切换，采用暂停语义和真实取消，未套用轮播的 hover 停止，也未安装图标库或创建新设计系统。

按项目规则读取 web-design-guidelines，并获取2026-11-08最新[官方规则](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md)。针对本次 Hero/FlagScene/ambient 样式检查：语义button、可见文字、aria-pressed、装饰图标/画布隐藏、图片尺寸、焦点/hover、reduce与持续动画停止符合本轮检查。无新表单/列表/拖拽；未进行完整读屏器和WCAG审计。

## 尚存限制

Clean Plate 既有的局部重建笔触在放大后仍可察觉，本轮未修改；正常首页截图未见明显的整旗残影/大面积裂口或黑白边。16px为用户确认方案，不以实现集成反推背景重建完全无瑕疵。原蒙版细碎边缘点、图片权利信息和首屏传输预算仍为既有待办。正式地图、全站内容及最终课程报告不在本轮实现范围。
