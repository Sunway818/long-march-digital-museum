"""Read public primary geographic datasets; preserve source bytes and provenance."""
from pathlib import Path
import urllib.request,hashlib,json,zipfile,io
root=Path(__file__).resolve().parents[1];research=root/'research/map_stage1_20261110';research.mkdir(parents=True,exist_ok=True)
urls={'CN.zip':'https://download.geonames.org/export/dump/CN.zip','geonames-readme.txt':'https://download.geonames.org/export/dump/readme.txt','openfreemap-style.json':'https://tiles.openfreemap.org/styles/liberty','land.geojson':'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_land.geojson','rivers.geojson':'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_rivers_lake_centerlines.geojson'}
log=[]
for name,url in urls.items():
 target=research/name
 if not target.exists():
  with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'LongMarchMuseumResearch/1.0'}),timeout=50)as r:blob=r.read(90_000_000)
  target.write_bytes(blob)
 blob=target.read_bytes();log.append({'file':name,'url':url,'bytes':len(blob),'sha256':hashlib.sha256(blob).hexdigest(),'retrieved':'2026-11-10'})
 print(json.dumps(log[-1],ensure_ascii=False),flush=True)
(research/'geography-provenance.json').write_text(json.dumps(log,ensure_ascii=False,indent=2),encoding='utf-8')
with zipfile.ZipFile(research/'CN.zip')as z:lines=z.read('CN.txt').decode('utf-8').splitlines()
names=['瑞金','于都','通道','黎平','瓮安','遵义','威信','会理','泸定','小金','松潘','迭部','宕昌','通渭','吴起','会宁','西吉','桑植','芷江','毕节','盘县','丽江','中甸','甘孜','苍溪','阆中','江油','茂县','光山','罗山','方城','丹凤','留坝','凤县','天水','泾川','延川']
found=[]
for line in lines:
 r=line.split('\t')
 if r[6]!='P'and r[7]!='ADM3':continue
 matches=[n for n in names if n in r[3].split(',')or n in r[1]]
 if matches:found.append({'id':r[0],'name':r[1],'names':r[3],'lat':r[4],'lon':r[5],'class':r[6],'code':r[7],'admin1':r[10],'admin2':r[11],'admin3':r[12],'population':r[14],'matches':matches})
(research/'geonames-candidates.json').write_text(json.dumps(found,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'features':len(lines),'candidates':len(found)},ensure_ascii=False))
