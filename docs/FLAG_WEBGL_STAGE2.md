# 旗帜第二阶段：独立动态预览与边界压力测试

日期：2026-11-08。基线 HEAD：1164555。实验产物待用户视觉验收；未接入正式首页、未提交 Git。

## 实现与打开方式

入口：[独立预览](../artifacts/flag-webgl-preview/index.html)，证据汇总：[审阅页](../artifacts/flag-webgl-preview/review.html)。运行既有 `npm run dev` 后访问 http://127.0.0.1:5173/artifacts/flag-webgl-preview/index.html 。不能用 file:// 执行 ES module；直接双击现在显示原位静态回退和动态入口，不再只留下黑画布。本轮未能复现用户原先黑屏的确切环境，已分别验证直接文件打开、WebGL2 不可用与上下文丢失三条回退路径。

原生 WebGL2、9,095 顶点、17,808 三角形、6 原图像素网格间隔。Clean Plate → 受约束旗面 → 固定前景。所有首阶段文件只读；flag-mask 独立采样作为 Alpha。纹理上传预乘 Alpha，使用 ONE / ONE_MINUS_SRC_ALPHA 混合。暂停审阅保留 drawing buffer，后续生产集成再评估该取舍。不新增库、光照或模糊，不变形背景。并非物理布料求解器。

按人工路径 left_limit 构造斜向连接边，额外 28 px 锁定区；幅度包络从连接区平滑增至末端，8 秒周期，相位随距离增加、随时间减少，因此波峰向自由端传播。图案与原有纹理使用同一网格，无独立图案漂移层。

实际读取并使用 frontend-design 与 cinematic-scroll-storytelling：原画为唯一视觉主体，审阅工具保持安静；慢速、连续、无弹性回跳，不引入预加载器、滚动驱动或 Lenis。默认 8 px 自动播放；reduce 默认静止，允许显式播放；手动暂停、后台暂停、相位滑块、静态/黑底/白底/Alpha 检查可用。

## 实测证据

全部证据在 `output/playwright/flag-stage2/`，汇总 JSON 为 results.json、pixel-checks.json、fallback-video-checks.json。capture.mjs 使用项目既有 Playwright 捕获方式，不是新增正式产品 E2E；review_outputs.py 仅处理捕获帧，不读写原始素材输出。

| 幅度 | 采样末端最大位移 | 最小有向面积比 | 图案区域最大主应变 | 建议 |
| --- | --- | --- | --- | --- |
| 0 | 0 | 1 | 0 | 静态比较基线 |
| 8 | 7.9996 px | 0.97745 | 1.31% | 保守首页候选，当前推荐 |
| 16 | 15.9992 px | 0.95492 | 2.63% | 更明显，但扩大背景暴露 |
| 24 | 23.9988 px | 0.93238 | 3.97% | 压力档，不作为视觉通过 |

每档覆盖 160 相位，合计 11,397,120 次三角形有向面积检查，翻转 0；锁定区采样位移 0。应变通过图案包围区位移场的局部 Jacobian 奇异值估计，不是艺术效果评分。

0 档 WebGL 合成对首阶段静态合成的全幅 RGB 均差 0.000283/255。正反极值四档画面的固定不透明前景最大时间差 0，旗面范围外最大时间差 0。说明旗杆/背景静止，不意味着 Clean Plate 重建纹理已通过视觉验收。

Alpha 阈值连通检查在 24 px 捕获帧中检出 12 个完全透明包围像素、2 个半透明阈值包围像素；原蒙版本身对应为 41/3。细碎点已存在于源蒙版附近，不能误报为网格三角裂缝，也不能声称旗面没有任何微小透明点。人工检查黑白底、破边、五角星及连接处，没有观察到大面积新裂口或黑白光晕。未逐根纤维验收。

Clean Plate 未见整片红旗残影，但尾端附近的天空/山脊局部重建偏平滑，在 24 px 正反极值放大图可察觉衔接。未用模糊掩盖，也未覆盖首阶段素材；当前通过降低候选幅度到 8 px 控制暴露，不允许据此宣称 24 px 视觉通过。若后续选择 16/24 px，需另存测试版 Clean Plate 修补并重新验收。

## 浏览器与性能

本机 Windows、Node 24.21.0；Chrome 157.0.8103.38、Edge 157.0.4341.42；两者各测 CSS viewport 1920×1080、1366×768，DPR 1。ANGLE Intel UHD Graphics 630 / Direct3D11，非 SwiftShader。原画缓冲区始终 1672×941。

4 组各约 4.2 秒、252—253 帧，24 px 压力档：RAF 均值 16.66ms，P95 16.8—16.9ms；JS 网格更新及 GPU 提交 CPU 耗时均值 1.57—2.10ms，P95 2.1—2.6ms。没有测 GPU timer；RAF 不能替代 GPU 完成时间、长期性能或实体显示器观感。

四组均无 pageerror/console error/WebGL error，幅度控件、暂停稳定、reduce、无横溢出、回退隐藏检查通过。另行验证后台停止、context loss 静态回退、WebGL 不支持回退、file:// 静态可见。

8/16/24 px 各有真实 captureStream(30)+MediaRecorder VP9 录屏，实测时长约 8.16—8.18s、1672×941。已重新解码检查画面亮度及不同时刻像素差，非黑屏或静帧。GIF 为 48 帧固定相位 WebGL 捕获，6fps/8s，仅供快速审阅，不作为实时性能证据。

运行 `node scripts/verify-setup.mjs`、`npm run typecheck`、`npm run build` 均通过。未重新运行首页 40 项 E2E；正式首页源码未改。保护哈希检查确认正式资源/源码和五份首阶段主素材未变化。

## 复现与范围

保持 Vite 服务运行后，可运行 `node artifacts/flag-webgl-preview/capture.mjs`、`node artifacts/flag-webgl-preview/check-fallback.mjs`，并用既有 Pillow/NumPy 解释器运行 `review_outputs.py`。浏览器本地访问在沙箱中受限，本轮实际采集经授权沙箱外执行；未安装依赖或修改系统。

本页是实验，不包含完整产品级 WebGL 生命周期恢复/质量自适应，也未测全站性能。下一步等待用户评审 8/16/24 录屏与暴露区，第三阶段正式接入尚未开始。

技术核对：[MDN 纹理预乘 Alpha](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/pixelStorei)、[混合因子](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendFunc)、[canvas 录屏源](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/captureStream)。
