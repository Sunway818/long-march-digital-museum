"""Build OFL-compliant, renamed WOFF2 subsets from verified local sources.

Usage: python -B scripts/prepare-fonts.py <source-directory> <fonttools-directory>
No downloads, no system installation, no background image processing.
"""
import hashlib
import json
from pathlib import Path
import re
import shutil
import sys

sys.path.insert(0, sys.argv[2])
from fontTools import subset
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parent.parent
source = Path(sys.argv[1])
output = root / 'src/assets/fonts'
output.mkdir(parents=True, exist_ok=True)
text = ''.join(path.read_text(encoding='utf-8') for path in (root / 'src').rglob('*.ts*'))
text += (root / 'src/data/exhibition.ts').read_text(encoding='utf-8')
characters = ''.join(sorted(set(re.findall(r'[\u3000-\u9fff]', text))))
characters += ''.join(chr(value) for value in range(32, 127)) + '—·×↗，。；：！？（）《》、'
specs = [
    (root / 'docs/design-review/fonts/ZhiMangXing-Regular.ttf', 'title', 'JourneyBrush', '伟大征程',
     root / 'docs/design-review/fonts/zhimangxing-OFL.txt', 'https://raw.githubusercontent.com/google/fonts/main/ofl/zhimangxing/ZhiMangXing-Regular.ttf'),
    (source / 'SourceHanSerifSC-Regular.otf', 'serif', 'JourneySerifSC', characters,
     source / 'serif-OFL.txt', 'https://raw.githubusercontent.com/adobe-fonts/source-han-serif/release/OTF/SimplifiedChinese/SourceHanSerifSC-Regular.otf'),
    (source / 'SourceHanSansSC-Regular.otf', 'sans', 'JourneySansSC', characters,
     source / 'sans-OFL.txt', 'https://raw.githubusercontent.com/adobe-fonts/source-han-sans/release/OTF/SimplifiedChinese/SourceHanSansSC-Regular.otf'),
]
manifest = []
for file, role, family, glyph_text, license_path, url in specs:
    font = TTFont(file)
    source_name = font['name'].getDebugName(1)
    missing = sorted(set(ord(c) for c in glyph_text) - set(font.getBestCmap()))
    # Decorative arrow is an SVG; textual arrow uses system fallback if not in source.
    required_text = ''.join(c for c in glyph_text if ord(c) in font.getBestCmap())
    options = subset.Options()
    options.flavor = 'woff2'
    options.name_IDs = ['*']
    sub = subset.Subsetter(options=options)
    sub.populate(text=required_text)
    sub.subset(font)
    for record in font['name'].names:
        if record.nameID in (1, 3, 4, 6, 16):
            record.string = family.encode(record.getEncoding())
        elif record.nameID in (2, 17):
            record.string = 'Regular'.encode(record.getEncoding())
    font.flavor = 'woff2'
    target = output / f'journey-{role}.woff2'
    font.save(target)
    check = TTFont(target)
    if role == 'title':
        assert all(ord(c) in check.getBestCmap() for c in '伟大征程')
    license_target = output / f'{role}-OFL.txt'
    shutil.copyfile(license_path, license_target)
    manifest.append({
        'role': role, 'sourceFamily': source_name, 'subsetFamily': check['name'].getDebugName(1),
        'weight': check['OS/2'].usWeightClass, 'variable': 'fvar' in check,
        'sourceURL': url, 'sourceBytes': file.stat().st_size,
        'sourceSha256': hashlib.sha256(file.read_bytes()).hexdigest(),
        'file': target.name, 'bytes': target.stat().st_size,
        'sha256': hashlib.sha256(target.read_bytes()).hexdigest(),
        'characters': required_text, 'missingOptionalCodepoints': missing,
        'license': license_target.name,
    })
(output / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps([{key: row[key] for key in ('role', 'sourceFamily', 'subsetFamily', 'bytes', 'weight')} for row in manifest], ensure_ascii=False, indent=2))
