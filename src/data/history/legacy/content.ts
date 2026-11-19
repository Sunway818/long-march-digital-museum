export interface LegacySource { id: string; title: string; institution: string; url: string; locator: string }
export const legacySources: LegacySource[] = [
 {id:'LS-01',title:'在纪念红军长征胜利80周年大会上的讲话',institution:'新华社／中央网信办，2016-10-21',url:'https://www.cac.gov.cn/2016-10/21/c_1119765784.htm',locator:'“伟大长征精神”五方面阐述；有关湘江、雪山草地、遵义与人民的段落'},
 {id:'LS-02',title:'学校简介',institution:'杭州电子科技大学国际教育学院',url:'https://intedu.hdu.edu.cn/12708/list.htm',locator:'首段：1956年创办、1980年改建、2004年更名、电子信息特色与人才培养'},
 {id:'LS-03',title:'校训',institution:'杭州电子科技大学，2016-10-28',url:'https://www.hdu.edu.cn/news/2016/1028/c8410a189021/page.htm',locator:'“笃学力行，守正求新”校训及释义'},
 {id:'LS-04',title:'2026架无人机点亮杭电夜空 校友捐赠表演秀献礼建校70周年',institution:'杭州电子科技大学，2026-10-19',url:'https://www.hdu.edu.cn/2026/1019/c720a301651/page.htm',locator:'首段：10月16日问鼎广场；第三段：蒋葆增身份、真空管研究与遗训；正文现场图'},
 {id:'LS-05',title:'历任校长',institution:'杭州电子科技大学',url:'https://www.hdu.edu.cn/767/list.htm',locator:'蒋葆增任期1980.5—1982.12'},
 {id:'LS-06',title:'〖甲子校庆〗成电建校教授群体印象展开展',institution:'电子科技大学成电新闻网，2016-09-19',url:'https://news.uestc.edu.cn/info/1003/7275.htm',locator:'蒋葆增.jpg及其生平：1930、1936年求学与电子教育经历；摄影年代未注明'},
 {id:'LS-07',title:'杭州电子科技大学校园胜景（下沙校区）',institution:'杭州电子科技大学',url:'https://www.hdu.edu.cn/773/list.htm',locator:'“问鼎广场”“学校南大门”各独立图页，2017-08-17刊载'},
 {id:'LS-08',title:'牢记嘱托，担当奋进！杭州电子科技大学建校70周年高质量发展大会举行',institution:'杭州电子科技大学，2026-10-26',url:'https://www.hdu.edu.cn/news/2026/1026/c7511a302247/page.htm',locator:'2026年建校70周年及10月25日大会'},
 {id:'LS-10',title:'从手摇计算机到万机校园网：学院计算机设备条件建设筑基之路',institution:'杭州电子科技大学档案馆，2025-06-19',url:'https://dangan.hdu.edu.cn/2025/0619/c13300a280393/page.htm',locator:'早期计算机建设；1980年DJS-130计算机房原图及相邻图注'},
 {id:'LS-11',title:'魅力山乡丨“半条被子”的故事在这里延续',institution:'新华社，2026-07-10',url:'https://www.xinhuanet.com/20260710/eadd7e44b7e3429c899b953cfdee1cbb/c.html',locator:'第一幅老屋内景与相邻7月1日图注；三名女红军借宿、剪被故事'},
 {id:'LS-12',title:'汝城县“半条被子的温暖”专题陈列馆',institution:'湖南省人民政府门户网站；中共湖南省委宣传部、湖南人民出版社供稿',url:'https://www.hunan.gov.cn/hnszf/c101482/202108/t20210830_20409697.html',locator:'历史寻迹：沙洲村徐解秀旧居与半条被子故事；本站不扩写年代细节'},
 {id:'LS-09',title:'2016年纪念讲话中的军民关系与“半条被子”',institution:'新华社／中央网信办',url:'https://www.cac.gov.cn/2016-10/21/c_1119765784.htm',locator:'讲话中“半条被子”故事段；本站地图EVT-009保留原来源和日期精度'},
]
export const legacyChapters = [
 {id:'prologue',label:'回望来路'}, {id:'road',label:'精神之路'}, {id:'relay',label:'薪火相传'},
 {id:'entrust',label:'前辈嘱托'}, {id:'answer',label:'青春答卷'}, {id:'epilogue',label:'征途未止'},
] as const
/** 本站原创叙事；历史事实与创作边界见来源及editorial-register。 */
export const legacyNarrative = {
 introHeading:'一代人有一代人的长征',
 introParagraphs:[
  '1936年，红军走完了一段艰苦卓绝的革命征途。长征的胜利留给后人的，有镌刻于山河之间的足迹，也有关于信念、责任与奋斗的精神遗产。',
  '二十年后，杭电的前身于1956年创办。国家建设需要工业、技术和人才。另一代奋斗者走进工厂、实验室与课堂，在新的领域走上自己的征途。',
  '今天，我们在杭电的课堂里继续学习与探索。属于我们的长征，是把知识学扎实，把本领用起来，在需要的地方尽一份自己的力量。',
 ],
 introNote:'本章以精神价值串联不同年代，不主张长征与杭电建校有直接历史因果或组织承继。当代学习与革命战争的历史代价不能简单等同。开篇山河为艺术化场景，校园与人物影像为真实照片。',
 roadLead:'沿着五个词，重读长征路上的人与事。',
 relayLead:['走过山川的足迹，转为建设年代的走线。','路在向前，书写它的人换了一代。'],
 relayNote:'原创艺术示意，非真实长征路线或可工作的电路。',
 schoolHeading:'工厂需要人才，课堂就有了方向。',
 schoolParagraph:'1956年，杭州航空工业财经学校创办。此后，学校历经改建与更名，逐步形成电子信息特色。1980年的计算机房，留下了早期教学与设备建设的一个侧面。今天的课堂和实验室，继续着教与学的日常。',
 entrustLead:'把一生所学，交给国家需要的地方。',
 entrustClosing:'一代人有一代人的长征，也有一代人必须回答的时代课题。',
 droneHeading:'九十年后的这个夜晚',
 droneParagraphs:[
  '2026年10月16日，杭电下沙校区的夜空中，蒋葆增先生的肖像与“国家大事，千万尽力”八个字再次出现。',
  '九十年前，红军将士用脚步走出了一条革命之路。今天，在我们熟悉的校园里，前辈的嘱托提醒着我们：一代人有一代人的使命，也有一代人的长征。',
  '当夜空重新归于平静，答卷还在我们手中。往后每一次踏实的学习、认真的探索和负责任的选择，都是走好这一代人长征路的一步。',
 ],
 youthQuestion:'读过长征红军先辈的事迹和上一代人长征的嘱托，你希望用怎样的所学，走好我们这一代人的长征路？',
 youthInvitation:'一门想学好的课程，一个想弄懂的问题，一件准备认真完成的小事，都可以写在这里。',
 youthPlaceholder:'例如：学好专业基础，认真完成一次实验…',
 youthResultLead:'属于你的青春纪念笺',
 endingParagraphs:[
  '先辈的足迹，留在山河之间。前辈的嘱托，留在我们每天走进的校园。',
  '而这一代人的答卷，将写在今后的学习、工作与生活里。',
 ],
} as const
export const spiritDimensions = [
 {id:'belief',word:'信念',lead:'湘江之后，路向何方',summary:'坚定理想信念',body:'湘江战役带来了沉重的牺牲，队伍还要继续前行。道路怎样走、方向怎样定，成为必须面对的问题。读到这里，信念有了分量：在尚看不到出路的时候，仍为寻找出路而行动。',eventId:'EVT-015',eventLabel:'中央红军抢渡湘江',assetId:'AST-0027',image:'/history-media/AST-0027.jpg',caption:'湘江战役界首渡口 · 现代遗址照片，拍摄日未注明',sourceIds:['LS-01'],evidence:'原地图SRC-0028、SRC-0029；EVT-015'},
 {id:'tenacity',word:'坚韧',lead:'山很高，路还要往前走',summary:'不畏艰难',body:'缺氧、严寒，饥饿与补给困难，都是行军中切身的考验。不同部队在不同时间翻越雪山、穿过草地。照片中的夹金山，让今天的我们得以看见这段征途所面对的山势；当年的艰难，仍需回到史料中理解。',eventId:'EVT-051',eventLabel:'翻越夹金山',extraEventId:'EVT-059',extraEventLabel:'右路军穿越草地',assetId:'AST-0080',image:'/history-media/AST-0080.jpg',caption:'夹金山垭口 · 现代地理环境照片，拍摄日未注明',sourceIds:['LS-01'],evidence:'原地图SRC-0040、SRC-0041、SRC-0056；不作为草地照片'},
 {id:'truth',word:'求实',lead:'在实际情况中，重新判断',summary:'独立自主、实事求是',body:'遵义会议直面军事指挥中的问题。四渡赤水期间，红军又根据敌情和地形不断调整行动。会议中的讨论与行军中的选择，留下了两种相连的求实经验：看清问题，让判断接受实践的检验。',eventId:'EVT-001',eventLabel:'遵义会议',extraEventId:'EVT-023',extraEventLabel:'四渡赤水专题',assetId:'AST-0002',image:'/history-media/AST-0002.jpg',caption:'红军总参谋部在遵义时的作战室 · 原图拍摄年代未注明',sourceIds:['LS-01'],evidence:'原地图EVT-001、EVT-023及其原有来源'},
 {id:'unity',word:'团结',lead:'走过不同的路，向着共同的目标',summary:'顾全大局、紧密团结',body:'长征中，各部队有各自的出发、转战与会师历程。会宁与将台堡，见证了不同部队的相聚。把这些经历放在一起，才能看见共同目标下的协同，也看见每支队伍走过的路。',eventId:'EVT-076',eventLabel:'会宁 · 红一、红四方面军会师',extraEventId:'EVT-077',extraEventLabel:'将台堡 · 红一、红二方面军会师',assetId:'AST-0072',image:'/history-media/AST-0072.jpg',caption:'会宁西关 · 遗址照片，拍摄年代未注明',sourceIds:['LS-01'],evidence:'EVT-076/077不合并日期或地域；此图仅对应会宁'},
 {id:'people',word:'人民',lead:'一条被子，留下了一半',summary:'军民患难与共',body:'1934年11月，三位女红军借宿湖南汝城沙洲村徐解秀家。临行前，她们想留下仅有的行军被，徐解秀不肯收，女红军便将被子剪成两半，留下一半。今天走进这间老屋，这个故事仍把军民情谊落在一张床、一条被子和几个具体的人身上。',eventId:'EVT-009',eventLabel:'半条被子军民故事',assetId:'LEG-06',image:'/legacy-media/shazhou-old-house.jpg',sourceUrl:'https://www.xinhuanet.com/20260710/eadd7e44b7e3429c899b953cfdee1cbb/c.html',caption:'沙洲村徐解秀旧居 · 现代遗址及陈设 · 新华社2026年7月刊载',sourceIds:['LS-09','LS-11','LS-12'],evidence:'新华社2026-07-10报道第一幅老屋内景及图注；陈设不认定为1934年原物'},
] as const
export const schoolMilestones = [
 {year:'1956',title:'为国家建设育才',text:'学校前身杭州航空工业财经学校创办，以专业教育培养行业所需人才。'},
 {year:'1980',title:'在电子工业中开拓',text:'经国务院批准改建为杭州电子工业学院，办学迈入高等教育阶段。'},
 {year:'2004',title:'向新的科技领域进发',text:'更名为杭州电子科技大学，在电子信息特色基础上推进多学科发展。'},
 {year:'2026',title:'接过时代的答卷',text:'建校七十周年。回望办学历程，也想一想：今天所学，准备在今后用来做些什么？'},
] as const
export const youthKeywords = [
 {id:'study',word:'笃学',meaning:'沉下心来，真正掌握自己所学的知识。'},
 {id:'practice',word:'力行',meaning:'将课堂上的知识转化为解决实际问题的能力。'},
 {id:'integrity',word:'守正',meaning:'尊重事实，坚持原则，对自己的选择负责。'},
 {id:'innovate',word:'求新',meaning:'保持好奇心，在未知领域中不断探索。'},
 {id:'responsibility',word:'担当',meaning:'思考自己的能力能够为他人和社会带来什么。'},
] as const
export type YouthKeyword = typeof youthKeywords[number]
export const entrustSections = [
 {title:'以信念开路',body:'长征年代，红军将士在艰难险阻中寻找民族的出路。对目标的坚守，落在面对困难时继续行动的勇气里。'},
 {title:'以知识报国',body:'蒋葆增先生是我国第一批真空管的主要研制者、电子工业教育事业的开拓者之一。他投身电子技术研究与人才培养。“国家大事，千万尽力”，为这份毕生的选择留下了八个字。'},
 {title:'以青春作答',body:'今天的征途，可以从学好一门课程、做好一次实验、解决一个真实问题开始。把知识学扎实，把事情做好，把专业能力用在真正需要它的地方。'},
] as const
