"""Reproducible local extraction; never rewrite the workbook or original map JSON."""
from pathlib import Path
import hashlib, json, zipfile, math

root = Path(__file__).resolve().parents[1]
research = root / 'research/map_reference_20261111'
with zipfile.ZipFile(root / 'research/map_stage1_20261110/CN.zip') as archive:
    records = {row[0]: row for row in (line.split('\t') for line in archive.read('CN.txt').decode().splitlines())}

# Explicit reviewed identities; no fuzzy match or inferred historical coordinates.
choices = [
    ('PLC-0013', '1805849', '界首聚落', '仅为界首地域，非湘江战役实际渡口或战线。'),
    ('PLC-0022', '1792435', '习水土城镇', '一渡发生于土城、元厚等多处；用土城地域代表，不合并各纵队渡口。'),
    ('PLC-0028', '6912719', '古蔺二郎聚落', '二渡涉及太平渡、二郎滩等地；用二郎地域代表，非渡口确址。'),
    ('PLC-0029', '1802219', '娄山关山口地域', '仅代表娄山关方向，不把桐梓、娄山关、遵义战斗合为一个确址。'),
    ('PLC-0033', '1801143', '茅台聚落', '三渡在茅台及附近多处，非某座纪念碑或实际渡船位置。'),
    ('PLC-0034', '6912719', '古蔺二郎聚落', '四渡再次经过二郎滩、太平渡地域，与二渡保留不同事件和时间。'),
    ('PLC-0036', '1809461', '贵阳市域', '表示佯攻方向，不表示红军占领或进入贵阳市区。'),
    ('PLC-0042', '1806028', 'Jiaopingdu聚落', '金沙江皎平渡地域参考，渡口、河岸与今聚落不可视为同一点。'),
]
locations = []
for place_id, record_id, name, note in choices:
    row = records[record_id]
    locations.append(dict(placeId=place_id, geonamesId=record_id, referenceName=name,
                          longitude=float(row[5]), latitude=float(row[4]), featureCode=row[7],
                          scopeNote=note, coordinateSystem='WGS84', sourceId='SRC-0079'))
sources = [
    dict(id='SRC-0080', title='中国共产党大事记·1935年', institution='中国共产党新闻网／中共中央党史研究室',
         url='https://cpc.people.com.cn/GB/64162/64164/4415983.html', author='中共中央党史研究室编', date_text='原页未注明发布日期',
         status='四次渡河与重占遵义的日期、次序已对照；不作为精确坐标证据，待负责人审核'),
    dict(id='SRC-0081', title='DataV GeoAtlas全国地理轮廓', institution='阿里云DataV GeoAtlas',
         url='https://geo.datav.aliyun.com/areas_v3/bound/100000.json', author='DataV GeoAtlas', date_text='2026-11-11获取',
         status='仅供独立全国参照小图；按DataV坐标系处理，不叠加到WGS84行军主图，非历史行政界线'),
]
target = root / 'src/data/history/map/route-enrichment.json'
event_anchors = [dict(eventId='EVT-029', date='1935-02-28', sourceIds=['SRC-0080'],
    note='原事件仍为2月下旬。按大事记2月28日重占遵义，作为本战役阶段的收束显示锚点；不表示娄山关战斗恰在当日发生。')]
target.write_text(json.dumps(dict(locations=locations, sources=sources, eventAnchors=event_anchors), ensure_ascii=False, indent=2) + '\n', encoding='utf8')

# A separate SVG frame uses DataV's ORIGINAL coordinate geometry. Never pass its
# GCJ-02 outline to MapLibre's WGS84 route source or use it as a historical route.
raw = (research / 'china-outline-original.geojson').read_bytes()
country = json.loads(raw)
polygons = country['features'][0]['geometry']['coordinates']
points = [p for poly in polygons for ring in poly for p in ring]
cosine = math.cos(math.radians(35))
west, east = min(p[0] for p in points), max(p[0] for p in points)
south, north = min(p[1] for p in points), max(p[1] for p in points)
scale = min(164 / ((east-west)*cosine), 118/(north-south))
offset_x = (180-(east-west)*cosine*scale)/2
offset_y = (134-(north-south)*scale)/2
def project(point):
    return f'{offset_x+(point[0]-west)*cosine*scale:.2f},{offset_y+(north-point[1])*scale:.2f}'
paths = [''.join('M' + 'L'.join(project(p) for p in ring) + 'Z' for ring in poly) for poly in polygons]
svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 134"><title>中国现代地理轮廓参照</title><g fill="#dcc087" stroke="#73512d" stroke-width=".8" fill-rule="evenodd" stroke-linejoin="round">' + ''.join(f'<path d="{p}"/>' for p in paths) + '</g></svg>\n'
(root / 'public/assets/map/china-reference.svg').write_text(svg, encoding='utf8')
(research / 'extraction-check.json').write_text(json.dumps(dict(locations=locations, countrySha256=hashlib.sha256(raw).hexdigest(),
    note='参考项目部分v坐标与GeoNames不一致，不沿用其核验结论；安顺场检索命中四川北部同名聚落，已排除。'), ensure_ascii=False, indent=2), encoding='utf8')
print(f'Extracted {len(locations)} regional references; original data untouched; separate China SVG generated.')
