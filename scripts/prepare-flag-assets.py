"""Copy accepted layers and losslessly crop ONLY the flag texture for local WebGL.
Never changes the accepted stage-one materials or original artwork.
"""
from pathlib import Path
from PIL import Image
import shutil
import hashlib
import json

root = Path(__file__).resolve().parent.parent
source = root / 'artifacts/flag-separation-draft'
target = root / 'src/assets/flag'
target.mkdir(parents=True, exist_ok=True)
report = {'sourceCanvas': [1672, 941], 'textureRect': [192, 0, 828, 504], 'amplitude': 16, 'files': {}}
for name in ['flag-clean-plate.png', 'flag-foreground.png', 'flag-rgba.png']:
    path = source / name
    expected = hashlib.sha256(path.read_bytes()).hexdigest()
    if name == 'flag-rgba.png':
        output = target / 'flag-cloth-local.png'
        Image.open(path).crop((192, 0, 828, 504)).save(output)
    else:
        output = target / name
        shutil.copyfile(path, output)
    assert hashlib.sha256(path.read_bytes()).hexdigest() == expected
    report['files'][output.name] = {'source': str(path.relative_to(root)), 'sourceSha256': expected, 'sha256': hashlib.sha256(output.read_bytes()).hexdigest()}
(target / 'manifest.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print(json.dumps(report, ensure_ascii=False, indent=2))
