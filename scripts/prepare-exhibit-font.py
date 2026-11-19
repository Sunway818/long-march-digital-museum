"""仅为专题标题生成本地 OFL 字体子集，不修改首页字体或系统环境。

用法：python -B scripts/prepare-exhibit-font.py <fonttools-directory>
"""
import hashlib
import json
from pathlib import Path
import sys
import subprocess
import types

sys.path.insert(0, sys.argv[1])
# 本机 Python 3.15 无匹配的 Brotli 扩展时，使用项目 Node 内置压缩器；不安装软件。
try:
    import brotli
    brotli_version = brotli.__version__
except ImportError:
    brotli = types.ModuleType('brotli')
    brotli.MODE_FONT = 2
    def node_brotli(data, decompress=False, **_options):
        operation = 'brotliDecompressSync' if decompress else 'brotliCompressSync'
        code = f"const fs=require('node:fs'),z=require('node:zlib');process.stdout.write(z.{operation}(fs.readFileSync(0)));"
        return subprocess.run(['node', '-e', code], input=data, capture_output=True, check=True).stdout
    brotli.compress = node_brotli
    brotli.decompress = lambda data: node_brotli(data, decompress=True)
    sys.modules['brotli'] = brotli
    brotli_version = 'Node built-in zlib'
from fontTools import subset
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parent.parent
source = root / 'docs/design-review/fonts/ZhiMangXing-Regular.ttf'
target = root / 'src/assets/fonts/exhibit-title.woff2'
text = '一二三四渡赤水湘江战役通道转兵黎平会议遵义巧金沙强大飞夺泸定桥翻越夹山右路军穿草地懋功会宁将台堡师毛儿盖与出发芦花及组织安排窝'
font = TTFont(source)
assert all(ord(c) in font.getBestCmap() for c in text)
options = subset.Options()
options.name_IDs = ['*']
subsetter = subset.Subsetter(options=options)
subsetter.populate(text=text)
subsetter.subset(font)
for record in font['name'].names:
    if record.nameID in (1, 3, 4, 6, 16):
        record.string = 'JourneyExhibitBrush'.encode(record.getEncoding())
font.flavor = 'woff2'
font.save(target)
assert all(ord(c) in TTFont(target).getBestCmap() for c in text)
manifest = {
    'sourceFamily': 'Zhi Mang Xing', 'subsetFamily': 'JourneyExhibitBrush',
    'source': 'docs/design-review/fonts/ZhiMangXing-Regular.ttf',
    'sourceSha256': hashlib.sha256(source.read_bytes()).hexdigest(),
    'file': target.name, 'characters': text, 'bytes': target.stat().st_size,
    'sha256': hashlib.sha256(target.read_bytes()).hexdigest(),
    'license': 'title-OFL.txt', 'fontToolsVersion': '4.68.0', 'brotliVersion': brotli_version,
}
(target.parent / 'exhibit-font-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps(manifest, ensure_ascii=False))
