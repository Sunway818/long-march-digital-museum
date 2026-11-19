"""复用现有OFL原件；不改原字体或其他章节子集。"""
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
texts = [x.read_text(encoding='utf-8') for directory in ['src/features/legacy', 'src/data/history/legacy'] for x in (root / directory).rglob('*') if x.suffix in ['.ts', '.tsx']]
all_text = ''.join(texts)
records = []
for role, source, family, text in [
    ('title', root / 'docs/design-review/fonts/ZhiMangXing-Regular.ttf', 'LegacyBrush', '征途未止精神之路传承信念坚韧求实团结人民薪火相传国家大事千万尽力我的青春答卷山河已新笃学力行守正求担当，。'),
    ('serif', root / 'research/people_20261116/originals/SourceHanSerifSC-Regular.otf', 'LegacySerif', all_text),
]:
    font = TTFont(source)
    supported = font.getBestCmap()
    chars = ''.join(sorted(set(c for c in text if ord(c) in supported)))
    options = subset.Options(); options.name_IDs = ['*']
    worker = subset.Subsetter(options=options); worker.populate(text=chars); worker.subset(font)
    for record in font['name'].names:
        if record.nameID in (1,3,4,6,16): record.string = family.encode(record.getEncoding())
    if 'CFF ' in font:
        font['CFF '].cff.fontNames = [family]
        for dictionary in font['CFF '].cff.topDictIndex:
            dictionary.FamilyName = family
            dictionary.FullName = family
    target = root / f'src/assets/fonts/legacy-{role}.woff2'
    font.flavor = 'woff2'; font.save(target)
    records.append(dict(file=target.name, family=family, characters=chars, bytes=target.stat().st_size, sha256=hashlib.sha256(target.read_bytes()).hexdigest(), source=str(source.relative_to(root)), sourceSha256=hashlib.sha256(source.read_bytes()).hexdigest(), license=f'{role if role == "serif" else "title"}-OFL.txt'))
(root / 'src/assets/fonts/legacy-font-manifest.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
license_directory = root / 'public/legacy-font-licenses'
license_directory.mkdir(parents=True, exist_ok=True)
for filename in ['title-OFL.txt', 'serif-OFL.txt']:
    (license_directory / filename).write_bytes((root / f'src/assets/fonts/{filename}').read_bytes())
(license_directory / 'NOTICE.txt').write_text('LegacyBrush: subset of Zhi Mang Xing, Copyright 2018 The Zhi Mang Xing Project Authors.\nLegacySerif: renamed subset of Source Han Serif SC, Copyright 2017-2022 Adobe.\nOriginal copyrights and OFL 1.1 licenses are retained in the accompanying files.\n',encoding='utf-8')
print([(record['file'],record['bytes']) for record in records])
