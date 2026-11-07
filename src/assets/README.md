# 首页资源

背景直接由 resources.ts 导入项目原件 pictures/山河壮阔的长征旗帜.png，未移动、覆盖、重绘或压缩。原件 SHA-256 为 f9dd8a4659a5ddb27c909e791a0630e8e4a5b054b00cd9fd73fa51d151935c37。Vite 打包会复制相同字节到 dist/assets 的带哈希文件名，不是另制视觉素材；本次未部署。作者、创作方式和公开授权待补充，页面影像说明如实展示。

字体是已核实源字体的 WOFF2 字符子集，实际 sourceFamily、源 URL/SHA、字重、大小和覆盖见 fonts/manifest.json。源为志莽行书、Source Han Serif SC Regular、Source Han Sans SC Regular，均原生 400、非变量字体。CSS 中的家族别名对应这些真实来源。

子集视作修改版，内部家族名改为 JourneyBrush/JourneySerifSC/JourneySansSC，保留原版权和 OFL 文本，遵守保留名称条件，不将修改版冒称官方原始完整字库。三个 *-OFL.txt 随源代码及字体一同保留。字形未拉伸、未描边伪造粗体。其他两套书法评审字体未打进首页。

复现需从 manifest 的官方 URL 获取对应源文件到项目外目录，安装 fonttools 4.68.0 与 brotli 1.2.1 到独立工具目录，再执行 scripts/prepare-fonts.py；源下载和工具路径显式传参，不作为网站运行依赖。首页新增中文时需要重新生成宋体/黑体子集并核验缺字，不能仅更新 JSX 而忽略字符覆盖。

源字体原件约 4.06MB/24.54MB/16.53MB，本页子集约 1.93KB/82.20KB/57.68KB。标题小于 Vite 默认内联阈值，生产 CSS 内联其 WOFF2；其余两份为本地静态资源。当前只加载本首页需要的字形，不访问线上字体 API。
