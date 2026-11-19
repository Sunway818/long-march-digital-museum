"""Generate draft map data from v8 without editing the workbook. No guessed coordinates."""
from pathlib import Path
from datetime import date
import json,re,hashlib,calendar,shutil
import openpyxl
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'src/data/history/map';OUT.mkdir(parents=True,exist_ok=True)
RESEARCH=ROOT/'research/map_stage1_20261110'
WORKBOOK=ROOT/'research/overnight_20261110/长征历史素材总登记表_工作版_v8.xlsx'
wb=openpyxl.load_workbook(WORKBOOK,read_only=True,data_only=False)
def rows(name,header=1):
 data=list(wb[name].iter_rows(values_only=True));keys=data[header-1]
 return [dict(zip(keys,row))for row in data[header:]if row[0]]
def ids(value,prefix):return list(dict.fromkeys(re.findall(prefix+r'-\d+',str(value or''))))
def write(name,data): (OUT/name).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
places_raw=rows('地点资料',4);events_raw={r['事件编号']:r for r in rows('历史事件')}
images_raw=rows('图片素材');docs_raw=rows('文献资料');sources_raw=rows('史料来源')
army_order=['central','twentyfive','fourth','second']
def armies(p):
 n=int(p['地点编号'].split('-')[1]);text=p['部队/时称']
 if 124<=n<=150:return ['twentyfive']
 if 79<=n<=105 or 154<=n<=155:return ['second','fourth']if n in [100,154,155]else['second']
 if 106<=n<=123:return ['fourth','second']if n in [119,120,122]else['fourth']
 if n==156:return ['fourth']
 if n==76:return ['central','fourth']
 if n==77:return ['central','second']
 return ['central','fourth']if '四方面军'in text or'一、四'in text else['central']
def date_window(raw):
 text=str(raw or'');primary=re.split(r'[；（(]',text)[0]
 year=re.search(r'193[456]',primary)
 if not year:return None,None,'unknown'
 # Keep dates of secondary meetings in the caption, rather than applying their month
 # to a preceding year (e.g. “1934年底—1935年多次；2月19日会议”).
 if '年底' in primary:return year[0]+'-12-01',str(max(map(int,re.findall(r'193[456]',primary))))+'-12-31','range'
 if any(word in primary for word in ['年初','年春','年夏','年秋','年冬']):
  match=re.match(r'(193[456])年(\d{1,2})月',primary)
  return (f'{match[1]}-{int(match[2]):02d}-01',None,'range')if match else(None,None,'unknown')
 fulls=re.findall(r'(193[456]-\d{2}-\d{2})(?:/(\d{2}))?',primary)
 if fulls:
  candidates=[d for d,_ in fulls]+[d[:8]+alt for d,alt in fulls if alt]
  short=re.match(r'(193[456]-\d{2}-)(\d{2})(?:夜)?[—至～](\d{1,2})(?!\d)',primary)
  if short:candidates.append(short[1]+short[3].zfill(2))
  if '前后' not in primary:
   start=min(candidates);end=max(candidates)
   if '起' in primary:return start,None,'range'
   return start,end,'day'if start==end else'range'
 # Chinese fully specified day/range. Approximate wording retains a MONTH envelope.
 chinese=re.match(r'(193[456])年(\d{1,2})月(\d{1,2})(?:[—至～](\d{1,2}))?日',primary)
 if chinese and '前后' not in primary:
  start=f'{chinese[1]}-{int(chinese[2]):02d}-{int(chinese[3]):02d}'
  end=f'{chinese[1]}-{int(chinese[2]):02d}-{int(chinese[4]or chinese[3]):02d}'
  if '起' in primary:return start,None,'range'
  return start,end,'day'if start==end else'range'
 months=re.findall(r'(\d{1,2})月',primary)
 if fulls:months=[fulls[0][0][5:7]]+months
 years=re.findall(r'193[456]',primary);ys=int(years[0]);ye=int(years[-1])
 if not months:return None,None,'unknown'
 ms=int(months[0]);me=int(months[-1])
 if not 1<=ms<=12 or not 1<=me<=12:return None,None,'unknown'
 if ye==ys and me<ms:me=ms
 return f'{ys}-{ms:02d}-01',f'{ye}-{me:02d}-{calendar.monthrange(ye,me)[1]}','month'if len(months)<=1 else'range'
# Manually reviewed name+province matches in the actual GeoNames CN export. These are
# MODERN REGIONAL REFERENCES, never coordinates of a historical building/battlefield.
anchor_ids={1:'1797053',4:'1785956',16:'1792689',17:'1803292',18:'1791513',20:'1783621',25:'1791581',26:'1791581',27:'1791581',44:'1806848',49:'1802142',53:'1790120',54:'1790120',58:'1793997',63:'1793028',64:'1793028',65:'1813874',66:'1792559',72:'1791043',76:'1806817',77:'7576744',84:'1796840',87:'1784524',89:'1816371',95:'1799006',100:'1810271',102:'1813874',106:'1816082',107:'1804485',109:'1806207',111:'1801130',124:'1809880',125:'1801844',128:'1811590',132:'1813883',142:'1803208',143:'1811202',144:'1792892',146:'1805686',150:'1787734'}
gn={r['id']:r for r in json.loads((RESEARCH/'geonames-candidates.json').read_text(encoding='utf-8'))}
# Explicitly confirm two IDs against actual names; a changed workbook fails instead of remapping silently.
for number,expected in [(128,'独树'),(132,'庾家河')]:
 actual=next(p['地点名称']for p in places_raw if int(p['地点编号'][4:])==number)
 if expected not in actual:raise ValueError('人工区域关联需复核:'+actual)
images=[]
for r in images_raw:
 local=r['展示文件路径'];saved=bool(local and(ROOT/local).is_file());rejected='淘汰'in str(r['用户决定'])
 images.append({'id':r['素材编号'],'title':r['图片名称'],'event_ids':ids(r['关联事件编号'],'EVT'),'type':r['素材类型'],'date_text':r['历史年代/形成时间']or'拍摄时间未核','caption':r['图片说明']or'','source_ids':ids(r['原始来源编号'],'SRC'),'source_url':r['原始图片链接']or'','rights':r['版权状态'],'user_decision':r['用户决定'],'local_preview_url':'/__research-media/'+r['素材编号']if saved and not rejected else None,'saved':saved,'rejected':rejected,'publication_status':'draft','verification_status':r['核实状态']or'待核实'})
documents=[{'id':r['文献编号'],'title':r['文献名称'],'creator':r['作者/形成者']or'未注明','date_text':str(r['形成/发表日期']or'未查明'),'source_ids':ids(r['来源编号'],'SRC'),'event_ids':ids(r['关联事件编号'],'EVT'),'url':r['原始网页']or'','nature':r['文献性质'],'scope':r['是否全文']or'未确认','summary':r['内容摘要']or''}for r in docs_raw]
sources=[{'id':r['来源编号'],'title':r['文章/来源名称'],'institution':r['发布机构/网站'],'url':r['来源网页']or'','author':r['作者']or'未注明','date_text':str(r['发布时间']or'未查明'),'status':r['来源可信度']or'待核实'}for r in sources_raw]
sources.append({'id':'SRC-0079','title':'GeoNames CN地名导出（现代地域参考点）','institution':'GeoNames','url':'https://download.geonames.org/export/dump/CN.zip','author':'GeoNames contributors','date_text':'2026-11-10获取','status':'CC BY 4.0；仅核对现代地域记录，不核实历史发生点'})
places=[];events=[]
for p in places_raw:
 eid=p['事件编号'];e=events_raw[eid];n=int(p['地点编号'][4:]);a=armies(p);raw_date=p['发生时间/精度']or e['开始日期'];start,end,precision=date_window(raw_date)
 g=gn.get(anchor_ids.get(n));longitude=float(g['lon'])if g else None;latitude=float(g['lat'])if g else None
 related_images=list(dict.fromkeys(ids(e['关联图片编号'],'AST')+[im['id']for im in images if eid in im['event_ids']]))
 related_docs=list(dict.fromkeys(ids(e['关联文献编号'],'DOC')+[d['id']for d in documents if eid in d['event_ids']]))
 src=ids(e['关联来源编号'],'SRC')or ids(p['来源编号'],'SRC')
 places.append({'id':p['地点编号'],'name':p['地点名称'],'historical_name':p['历史地名'],'modern_location':p['今行政区划']or'待核实','longitude':longitude,'latitude':latitude,'coordinate_precision':'regional'if g else'unverified','coordinate_source_ids':['SRC-0079']if g else[],'coordinate_note':'现代地域参考点，非历史事件发生点；历史确址待核。'if g else'坐标缺失，不在地图上放置位置标记。','coordinate_record_url':f"https://www.geonames.org/{g['id']}/"if g else'','coordinate_record_name':g['name']if g else'','army_ids':a,'related_event_ids':[eid],'image_ids':related_images,'document_ids':related_docs,'source_ids':src,'verification_status':'disputed'if p['差异争议']else'pending','publication_status':'draft'})
 title=e['事件名称'];kind='meeting'if'会议'in title or'决议'in title else'reunion'if'会师'in title else'battle'if any(t in title for t in ['战斗','战役','强渡','飞夺'])else'march'
 important=kind!='march'or n in [1,4,49,53,64,65,66,72,76,77,79,84,106,124,125,128,142,150]
 events.append({'id':eid,'title':title,'start_date':start,'end_date':end,'date_precision':precision,'date_text':raw_date,'anchor_note':''if precision=='day'else'时间轴按可识别历法范围的首端定位；范围端点不是精确发生日。','place_ids':[p['地点编号']],'army_ids':a,'army_text':p['部队/时称'],'summary':e['关键史实概要']or p['经过摘要']or'经过待核实','background':p['历史背景']or'','significance':'','image_ids':related_images,'document_ids':related_docs,'source_ids':src,'verification_status':'disputed'if p['差异争议']else'pending','kind':kind,'important':important,'batch':p['调查批次'],'relation':p['前后/分路关系']or'','disputes':p['差异争议']or'','gaps':p['缺口']or'原件与历史位置待核实','publication_status':'draft'})
place_map={p['id']:p for p in places};event_map={e['id']:e for e in events}
nodes=[]
for index,r in enumerate(rows('行军路线')):
 matches=ids(r['备注'],'PLC');related=ids(r['关联事件编号'],'EVT');p=place_map.get(matches[0])if matches else next((p for p in places if any(e in p['related_event_ids']for e in related)),None)
 if not p:continue
 start,end,precision=date_window(r['日期/时间'])
 for a in p['army_ids']:nodes.append({'route_id':r['路线编号'],'army_id':a,'sequence':index+1,'place_id':p['id'],'date':r['日期/时间'],'start_date':start,'end_date':end,'date_precision':precision,'action':r['行动/路线说明'],'related_event_ids':related,'source_ids':ids(r['关联来源编号'],'SRC')})
# These are independently selected, source-located regional DIRECTION diagrams.
# No adjacent-row algorithm ever creates a geometry. No moving-point interpolation.
evidence=[
 ('central',16,17,['SRC-0032','SRC-0033'],'通道、黎平会议两段，战略方向转向贵州'),
 ('central',17,18,['SRC-0032','SRC-0033'],'黎平、猴场会议两段，会议前奏次序'),
 ('central',18,20,['SRC-0032','SRC-0033'],'猴场会议后北渡乌江、进遵义'),
 ('central',49,53,['SRC-0041'],'第三、四节，夺泸定桥后翻夹金山至懋功；中间山口未定位'),
 ('central',63,65,['SRC-0042'],'俄界、哈达铺两节，9月13日出发经腊子口北上'),
 ('central',65,66,['SRC-0042'],'榜罗镇节，离开哈达铺后渡渭河到榜罗镇'),
 ('central',66,72,['SRC-0042'],'榜罗镇节末，经静宁、隆德、六盘山到吴起；不是直达路径'),
 ('twentyfive',125,128,['SRC-0061','SRC-0062'],'出发节：何家冲经桐柏山区到独树镇，过境细路未定位'),
 ('twentyfive',142,143,['SRC-0061'],'西征北上节：江口休整后进入双石铺；江口日程差异保留'),
 ('twentyfive',143,144,['SRC-0061'],'西征北上节：双石铺后经两当、麦积山到天水'),
 ('twentyfive',144,146,['SRC-0061'],'天水后经静宁兴隆镇到泾川四坡；中间停驻未定位'),
 ('fourth',106,109,['SRC-0058'],'实现懋功会师节：嘉陵江后向梓潼、江油发展，分路不得合为全军精确线'),
 ('fourth',109,111,['SRC-0058'],'实现懋功会师节：由江油地区经北川河谷至茂县'),
 ('fourth',111,53,['SRC-0058'],'实现懋功会师节：茂县派第30、第9军一部南进接应中央红军，仅为接应部队'),
 ('second',84,87,['SRC-0027','SRC-0053'],'桑植突围后至芷江地域；两军团入出境日不同'),
 ('second',87,89,['SRC-0049'],'三次改变战略计划节：便水之后西移黔大毕'),
 ('second',89,95,['SRC-0049'],'三次改变战略计划节：乌蒙回旋后进盘县，非直达或精确回旋轨迹')]
segments=[]
for a,frm,to,src,locator in evidence:
 fp=place_map[f'PLC-{frm:04d}'];tp=place_map[f'PLC-{to:04d}'];fe=event_map[fp['related_event_ids'][0]];te=event_map[tp['related_event_ids'][0]]
 if fp['longitude']is None or tp['longitude']is None:raise ValueError('方向示意端点缺少区域参考点')
 segments.append({'id':f'DIR-{a}-{frm}-{to}','army_id':a,'from_place_id':fp['id'],'to_place_id':tp['id'],'geometry':{'type':'LineString','coordinates':[[fp['longitude'],fp['latitude']],[tp['longitude'],tp['latitude']]]},'geometry_confidence':'regional-direction-only','source_ids':src,'evidence_locator':locator,'display_style':'dashed','start_date':fe['start_date'],'reveal_date':te['end_date']or te['start_date'],'verification_status':'pending','note':'区域间行进方向示意，非具体行军路线；中间停驻、分路和历史确址仍待核验。'})
config={'workbook':WORKBOOK.name,'workbook_sha256':hashlib.sha256(WORKBOOK.read_bytes()).hexdigest(),'generated_date':'2026-11-10','start_date':min(e['start_date']for e in events if e['start_date']),'end_date':max(e['end_date']for e in events if e['end_date']),'armies':[{'id':'central','name':'中央红军','color':'#C65B50'},{'id':'twentyfive','name':'红二十五军','color':'#D6A45D'},{'id':'fourth','name':'红四方面军','color':'#7195AA'},{'id':'second','name':'红二、红六军团','color':'#899A70'}],'online_style':'/assets/map/historical-terrain.json','terrain_url':'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png','notes':'资料工作版：所有历史确址坐标仍待核，地图仅标出现有地名库可对照的现代区域参考点。虚线均为有来源的区域方向示意，不插值移动点。未授权影像只经本机研究预览接口读取，不进入构建目录。'}
for name,data in [('places.json',places),('events.json',events),('routes.json',{'nodes':nodes,'segments':segments}),('map-config.json',config),('images.json',images),('documents.json',documents),('sources.json',sources)]:write(name,data)
base=ROOT/'public/assets/map';base.mkdir(parents=True,exist_ok=True)
for name in ['land.geojson','rivers.geojson']:shutil.copyfile(RESEARCH/name,base/name)
# Keep current map presentation when regenerating historical data.
import subprocess
subprocess.run(['node',str(ROOT/'scripts/style-history-map.mjs')],cwd=ROOT,check=True)
stats={'places':len(places),'events':len(events),'regionalAnchors':sum(p['longitude']is not None for p in places),'missingCoordinates':sum(p['longitude']is None for p in places),'verifiedHistoricalCoordinates':0,'routeNodes':len(nodes),'directionDiagrams':len(segments),'preciseRouteSegments':0,'savedImages':sum(i['saved']for i in images),'workbookSha256':config['workbook_sha256']}
(RESEARCH/'conversion-audit.json').write_text(json.dumps(stats,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(stats,ensure_ascii=False))
