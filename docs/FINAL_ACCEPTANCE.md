# 《伟大征程》课堂交付与评审入口

从项目根目录运行 `npm ci`、`npm run build`、`npm run preview`，访问终端提示的地址。课堂同网访问可运行 `npm run preview -- --host 0.0.0.0`，使用演示机的 Wi‑Fi 地址；不需要公开发布，也不应共享研究目录。

| 演示 | 在预览地址后追加 | 老师可复核的内容 |
| --- | --- | --- |
| 首页 | `/#home` | 艺术示意近图标识；四章入口；环境光可暂停 |
| 十月开播 | `/#map` | 起点 1934.10.10；按播放即显示当期方向；拖动日期或筛选部队后可回到总览 |
| 遵义会议 | `/#map?archive=EVT-001` | 直接打开档案；图片是当代复原陈列，图注可点来源；关闭后回事件 |
| 四渡赤水 | `/#map?archive=EVT-023&topic=chishui` | 完整专题四次渡河，不与一渡单篇混淆 |
| 英雄人物 | `/#people/mao-zedong` | 人物档案、影像年代与出处、关键瞬间可回地图 |
| 精神传承 | `/#legacy` | 首屏阅读入口先到导读，叙事解释长征与杭电为何同页 |
| 青春答卷 | `/#legacy/answer` | 选词后可立即写作，生成并保存本机 PNG；刷新清除答卷 |

[课程实践报告](COURSE_PRACTICE_REPORT.md) · [影像来源和权利清单](FINAL_MEDIA_REGISTER.md) · [手机触控性能证据](MAP_TOUCH_PERFORMANCE.md) · [任务看板](TASK_BOARD.md)

生产构建（含严格类型）与工程校验已通过。最终构建在 Windows Chrome／Edge 分别验证首日已展开路线及开篇说明、档案链接复制与新会话、专题直达、地图筛选、滚轮／拖拽、双指触摸和短横屏答卷，[专项 12/12](../output/playwright/final-acceptance/final-12.json)。先前含六档纪念笺、审阅模式隔离与触摸的相关回归 [20/20](../output/playwright/final-acceptance/verified-20.json)；短横屏手机为触摸模拟。首轮较广检查的历史起点断言、漏出的版本后缀、时序取样和后续校正均保留[原始结果](../output/playwright/final-acceptance/initial-86.json)，不冒称单次全量全绿。

实际截图：[十月开播](../output/playwright/final-acceptance/chrome-1920-october.png) · [遵义档案与来源](../output/playwright/final-acceptance/chrome-1920-zunyi.png) · [740×320 横屏答卷](../output/playwright/final-acceptance/chrome-1920-landscape-answer.png)。

评审时应区分课堂功能验收与互联网发布。精准历史地理复原、全部素材对外转载许可、Android/iPhone 真机课堂网络和系统保存尚未验收；未把自动化模拟结果写成真机结果。个人姓名、班级、真实分工与学校格式由提交人确认。
