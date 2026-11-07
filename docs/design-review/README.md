# 桌面标题字体评审资产

2026-11-07。此目录是设计规范附件，不是网站源码目录。主设计画幅 1920×1080，1366×768 为笔记本检查画幅。

- [font-comparison.png](font-comparison.png)：1800×1200 纯文字对比图，三套真实字体；每套上行 156px 米白、下行 112px 暗金，均 6px 字距、原生 400；不同字体不可仅按视觉大小误判字号。
- [font-render-report.json](font-render-report.json)：字体 SHA-256、内部家族名、四字 glyph ID 和绘制 bounds。所有字形非零，未裁断。
- [font-comparison.html](font-comparison.html)：仅供本机打开的构图评审工具，读取 ../../pictures/ 原图并叠加实时文字，可切换字体、调整字距；不保存或导出合成图，无网络请求。需保持原项目目录结构。原图文件本身未加入 Git，复制仓库不自动拥有原图。
- [render-fonts.ps1](render-fonts.ps1)：使用 Windows System.Drawing/PresentationCore 读取本地 TTF、生成文字 PNG 与报告的复现脚本，不读取背景图，不安装字体；从项目根运行 `pwsh -NoProfile -File docs/design-review/render-fonts.ps1`。

字体来源均为 Google Fonts 官方仓库的 main/ofl 目录。实际文件 SHA 和字节数由 FONT_SOURCES.json 固定；未来远端 main 可能变化，不能以更新下载替代当前证据。每套保留对应 OFL.txt、METADATA.pb，字体文件不作修改，不单独出售，不把书法软件名误作另一份字体授权。

目录级 .gitattributes 保留官方字体、许可和元数据原始换行及空白，不为消除上游 OFL 的行末空格而编辑其文本；自建文档、HTML 和评审脚本继续接受空白检查。

1. [Zhi Mang Xing 官方元数据](https://raw.githubusercontent.com/google/fonts/main/ofl/zhimangxing/METADATA.pb)，实际文件 fonts/ZhiMangXing-Regular.ttf，内部中文名“钟齐志莽行书”。
2. [Ma Shan Zheng 官方元数据](https://raw.githubusercontent.com/google/fonts/main/ofl/mashanzheng/METADATA.pb)，实际文件 fonts/MaShanZheng-Regular.ttf。
3. [Liu Jian Mao Cao 官方元数据](https://raw.githubusercontent.com/google/fonts/main/ofl/liujianmaocao/METADATA.pb)，实际文件 fonts/LiuJianMaoCao-Regular.ttf。

已完成实际 GDI+ 字形渲染和人工查看；网页字体抗锯齿、Chrome/Edge 实际构图和性能尚未验收。当前三份 TTF 为全量评审材料，不代表未来网页需加载全部约 15MB 字体；正式采用后再选择一套、核验合法子集/格式和性能。

PNG 为固定 6px 字距的公平字号对照；本地 HTML 的字距滑块以 1920 画幅折算，在更窄画幅按比例收缩，仍可用 0—16px 调整。二者不要作为完全相同的浏览器像素截图比较。背景不进入 PNG；用户可本机查看 HTML 对照构图，但用户已确认选择 A 钟齐志莽行书，具体字号、间距和位置仍待原型验证。

用户背景仅以本地 HTML 的 img 元素读取，原始 SHA-256 为 f9dd8a4659a5ddb27c909e791a0630e8e4a5b054b00cd9fd73fa51d151935c37。未授权前禁止导出含背景像素的合成截图、另存裁切/压缩/放大版本或公开发布。
