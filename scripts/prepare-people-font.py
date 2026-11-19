"""复用本地OFL原字体与既有临时fontTools，仅生成本馆标题子集。"""
from pathlib import Path
import sys, types, subprocess, json, hashlib
sys.path.insert(0, sys.argv[1])
try:
    import brotli
except ImportError:
    brotli = types.ModuleType('brotli')
    brotli.MODE_FONT = 2
    def codec(data, decompress=False, **_):
        operation = 'brotliDecompressSync' if decompress else 'brotliCompressSync'
        return subprocess.run(['node', '-e', f"const fs=require('node:fs'),z=require('node:zlib');process.stdout.write(z.{operation}(fs.readFileSync(0)));"], input=data, capture_output=True, check=True).stdout
    brotli.compress = codec
    brotli.decompress = lambda data: codec(data, decompress=True)
    sys.modules['brotli'] = brotli
from fontTools import subset
from fontTools.ttLib import TTFont
root = Path(__file__).resolve().parent.parent
source = root / 'docs/design-review/fonts/ZhiMangXing-Regular.ttf'
target = root / 'src/assets/fonts/people-title.woff2'
text = '长征中的脊梁毛泽东周恩来张闻天朱德陈云刘伯承王稼祥博古秦邦宪彭怀聂荣臻林贺龙任弼时徐向前海程子华'
font = TTFont(source)
assert all(ord(c) in font.getBestCmap() for c in text)
options = subset.Options()
options.name_IDs = ['*']
worker = subset.Subsetter(options=options)
worker.populate(text=text)
worker.subset(font)
for record in font['name'].names:
    if record.nameID in (1,3,4,6,16): record.string = 'PeopleMemorialBrush'.encode(record.getEncoding())
font.flavor = 'woff2'
font.save(target)
assert all(ord(c) in TTFont(target).getBestCmap() for c in text)
manifest = dict(source=str(source.relative_to(root)), characters=text, bytes=target.stat().st_size, sourceSha256=hashlib.sha256(source.read_bytes()).hexdigest(), sha256=hashlib.sha256(target.read_bytes()).hexdigest(), license='title-OFL.txt')
(target.parent / 'people-font-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(manifest,ensure_ascii=False))

# 原首页子集只覆盖首页文案。为本馆新增文字复用同一原字体，避免逐字回落为另一宋体。
source_serif = root / 'research/people_20261116/originals/SourceHanSerifSC-Regular.otf'
source_record = next(x for x in json.loads((root / 'src/assets/fonts/manifest.json').read_text(encoding='utf-8')) if x['role'] == 'serif')
assert hashlib.sha256(source_serif.read_bytes()).hexdigest() == source_record['sourceSha256']
texts = [x.read_text(encoding='utf-8') for directory in ['src/features/people', 'src/data/history/people'] for x in (root / directory).rglob('*') if x.suffix in ['.ts', '.tsx']]
text_serif = ''.join(sorted(set(''.join(texts) + '人物档案纪念馆深入阅读查看完整影像返回肖像墙历史暂未加载关闭来源一二三四五六七八→←↗×')))
font = TTFont(source_serif)
supported = font.getBestCmap()
text_serif = ''.join(x for x in text_serif if ord(x) in supported)
worker = subset.Subsetter(options=options)
worker.populate(text=text_serif)
worker.subset(font)
for record in font['name'].names:
    if record.nameID in (1,3,4,6,16): record.string = 'PeopleMemorialSerif'.encode(record.getEncoding())
target_serif = root / 'src/assets/fonts/people-serif.woff2'
font.flavor = 'woff2'
font.save(target_serif)
manifest_serif = dict(source=str(source_serif.relative_to(root)), sourceURL=source_record['sourceURL'], sourceSha256=source_record['sourceSha256'], file=target_serif.name, characters=text_serif, bytes=target_serif.stat().st_size, sha256=hashlib.sha256(target_serif.read_bytes()).hexdigest(), license='serif-OFL.txt')
(target.parent / 'people-serif-manifest.json').write_text(json.dumps(manifest_serif,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('People Serif glyphs',len(text_serif),'bytes',target_serif.stat().st_size)
