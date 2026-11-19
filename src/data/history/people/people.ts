import type { MemorialPerson, Portrait } from '../../../features/people/types'
import {additionalPeople} from './additional-people'
import {centralLeadership} from './central-leadership'
import {organizationRecords} from './organization-records'
import {fieldCommanders} from './field-commanders'
import {otherArmies} from './other-armies'

const photo = (id: string, url: string, width: number, height: number, date: string, caption: string, sourceId: string): Portrait => ({ id, url, width, height, date, caption, sourceId, longMarchPhoto:false, rights:'来源机构保留权利；独立公开再授权待确认', verificationStatus:'pending' })
const zunyi = (relation: string, sourceId: string) => ({ id:'EVT-001', title:'遵义会议', relation, sourceId })
const firstRoundPeople: MemorialPerson[] = [
  {
    id:'mao-zedong', name:'毛泽东', role:'在转折中探索新的方向', publicationStatus:'draft',
    introduction:'遵义的讨论，指向一支军队怎样从挫折中重新找到行动方向。毛泽东进入新的中央领导分工，是理解这一转折的重要线索。',
    biography:'毛泽东是遵义会议的重要参与者。1935年1月被增选为中央政治局常委；会议及其后续调整，推动形成新的中央领导格局。', biographySourceIds:['PS-ZUNYI'],
    portrait:photo('POR-MAO-01','/people-media/POR-MAO-01.jpg',550,895,'1936年，到达陕北后','到达陕北后的毛泽东。保留来源原图的水印及图注；不作为行军现场照片。','PI-MAO'),
    chapters:[
      { id:'turn', title:'从失利中重新讨论道路', paragraphs:['第五次反“围剿”的失利与长征初期的损失，使军事指挥问题成为必须面对的现实。1935年1月15日至17日，中共中央政治局扩大会议在遵义举行，集中讨论军事和组织问题。'], sourceIds:['PS-ZUNYI'] },
      { id:'decision', title:'遵义：领导分工的改变', paragraphs:['会议增选毛泽东为中央政治局常委，并委托张闻天依据会议多数意见起草决议。决议对过去军事指挥的错误作出总结，毛泽东的军事主张在这一过程中获得支持。'], sourceIds:['PS-ZUNYI'] },
      { id:'reading', title:'把转折放回历史过程', kind:'interpretation', paragraphs:['理解遵义，不宜把一次会议写成已经完成所有后续调整。决议的形成、传达与行动中的检验，构成了转折逐步展开的过程。'], sourceIds:['PS-ZUNYI'] },
    ], milestones:[{date:'1935年1月',text:'遵义会议增选为中央政治局常委',sourceId:'PS-ZUNYI'}], events:[zunyi('会议增选为中央政治局常委。','PS-ZUNYI')],
  },
  {
    id:'zhou-enlai', name:'周恩来', role:'在组织与指挥之间担当', publicationStatus:'draft',
    introduction:'战略转移不仅是方向的选择，也是一项细致的组织工作。从出发前的准备到遵义的讨论，周恩来的经历连接着这两种责任。',
    biography:'周恩来参与长征准备、组织实施与军事指挥。在遵义会议上支持纠正军事指挥错误，会后继续与朱德承担军事指挥责任。', biographySourceIds:['PS-ZHOU'],
    portrait:photo('POR-ZHOU-01','/people-media/POR-ZHOU-01.jpg',1080,1519,'1936年，西安事变期间','西安事变期间的周恩来；拍摄于长征结束后。据陈云纪念馆原图注。','PI-ZHOU'),
    chapters:[
      { id:'prepare', title:'出发之前的组织工作', paragraphs:['长征前，周恩来参与战略转移的准备和实施。他主持指导与陈济棠方面的秘密谈判，为红军通过广东军队控制区域创造条件。'], sourceIds:['PS-ZHOU'] },
      { id:'responsibility', title:'遵义会议上的担当', paragraphs:['遵义会议上，周恩来对军事指挥中的问题作了自我批评，支持毛泽东的意见。会议取消原来的“三人团”，仍由朱德、周恩来担任军事指挥者。'], sourceIds:['PS-ZHOU'] },
      { id:'reading', title:'决策怎样成为行动', kind:'interpretation', paragraphs:['组织协调不只存在于会议桌旁。把不同意见转化为能够执行的决定，是观察长征领导工作的一条具体线索。'], sourceIds:['PS-ZHOU'] },
    ], milestones:[{date:'1934年',text:'参与长征准备与组织实施',sourceId:'PS-ZHOU'},{date:'1935年1月',text:'参加遵义会议，继续承担军事指挥责任',sourceId:'PS-ZHOU'}], events:[zunyi('参与会议并支持纠正军事指挥错误。','PS-ZHOU')],
  },
  {
    id:'zhang-wentian', name:'张闻天', role:'在讨论与文献中留下转折', publicationStatus:'draft',
    introduction:'一场会议如何成为可以传达、可以执行的共同认识？从遵义会议的报告与决议出发，读张闻天在长征中的工作。',
    biography:'张闻天1925年入党，1934年参加长征，受托起草遵义会议决议。延安时期从事理论宣传、干部教育，并开展农村调查。', biographySourceIds:['PS-ZHANG','PS-ZUNYI'],
    portrait:photo('POR-ZHANG-01','/people-media/POR-ZHANG-01.jpg',183,263,'拍摄年代待考','张闻天像（资料照片）。来源未注明拍摄年份，不认定为长征时期肖像。','PS-ZHANG'),
    chapters:[
      { id:'journey', title:'从理论工作走上征途', paragraphs:['张闻天1925年加入中国共产党，曾赴苏联学习。1933年进入江西中央革命根据地，1934年10月参加长征。'], sourceIds:['PS-ZHANG'] },
      { id:'resolution', title:'报告与决议', paragraphs:['遵义会议上，张闻天作了反对“左”倾军事错误的报告。会议委托他起草决议，将讨论形成的认识整理为文献，随后向部队传达。'], sourceIds:['PS-ZHANG','PS-ZUNYI'] },
      { id:'investigation', title:'延续到调查研究', paragraphs:['延安时期，张闻天从事理论宣传与干部教育。1941年整风开始后，他到陕北、晋西北开展农村调查，写成调查研究报告。'], sourceIds:['PS-ZHANG'] },
    ], milestones:[{date:'1934年10月',text:'参加长征',sourceId:'PS-ZHANG'},{date:'1935年1月',text:'遵义会议作报告，受托起草决议',sourceId:'PS-ZUNYI'}], events:[zunyi('作反对错误军事指挥的报告，并受托起草决议。','PS-ZUNYI')],
  },
  {
    id:'zhu-de', name:'朱德', role:'统率行军，维护共同方向', publicationStatus:'draft',
    introduction:'从中央红军的转战，到与红四方面军共同经历的征途，朱德的长征经历跨越了不同部队的行动。',
    biography:'朱德是中国工农红军总司令。1928年率部在井冈山与毛泽东领导的部队会师；长征中参与军事指挥，1936年与红二、红四方面军共同北上。', biographySourceIds:['PS-ZHU'],
    portrait:photo('POR-ZHU-01','/people-media/POR-ZHU-01.jpg',586,817,'到达陕北时，具体年代待考','到达陕北时的朱德。全文展示地理环境与人物，不从正文会师日期推定拍摄日期。','PI-ZHU'),
    chapters:[
      { id:'before', title:'从井冈山到战略转移', paragraphs:['朱德1922年在德国加入中国共产党。1928年率领南昌起义保留下来的部队和湘南起义农军到达井冈山，与毛泽东领导的部队会师。1934年参加长征。'], sourceIds:['PS-ZHU'] },
      { id:'command', title:'遵义之后的转战', paragraphs:['朱德在遵义会议上支持毛泽东的主张，参与指挥四渡赤水、巧渡金沙江等行动。总司令的工作连接着战场指挥与部队整体行动。'], sourceIds:['PS-ZHU'] },
      { id:'north', title:'继续向北', paragraphs:['红一、四方面军会合后，朱德与红军总部随左路军行动。1936年，他与红二、红四方面军共同北上，最终在陕甘地区实现主力会师。'], sourceIds:['PS-ZHU'] },
    ], milestones:[{date:'1935年1月',text:'参加遵义会议',sourceId:'PS-ZHU'},{date:'1936年',text:'随红二、红四方面军北上',sourceId:'PS-ZHU'}], events:[zunyi('在会议上支持毛泽东的主张。','PS-ZHU'),{id:'EVT-042',title:'巧渡金沙江',relation:'参与指挥金沙江行动。',sourceId:'PS-ZHU'}],
  },
  {
    id:'chen-yun', name:'陈云', role:'从亲历者到长征的记录者', publicationStatus:'draft',
    introduction:'长征既留下行军的足迹，也需要留下可以被外界读到的记录。陈云在途中的工作与后来写下的见闻，连接着这两种历史。',
    biography:'陈云参加中央红军长征，参与遵义会议与金沙江渡河组织。奉命离队执行任务后，写下《随军西行见闻录》，向外界介绍亲历的长征。', biographySourceIds:['PS-CHEN','PS-JINSHA'],
    portrait:photo('C-02 / AST-0006','/history-media/AST-0006.jpg',785,1000,'青年时期，具体年份待考','陈云青年时期肖像；具体拍摄年份尚无明确记载。','PI-CHEN'),
    chapters:[
      { id:'march', title:'作为亲历者出发', paragraphs:['1934年10月，陈云参加中央红军长征。遵义会议后，他承担向部队传达会议精神的工作。在巧渡金沙江时，他担任渡河政治委员，与渡河司令员刘伯承共同工作。'], sourceIds:['PS-CHEN','PS-JINSHA'] },
      { id:'task', title:'离开队伍，执行新的任务', paragraphs:['1935年5月，陈云奉命离开长征队伍前往上海，随后赴苏联。《随军西行见闻录》依据他亲历的长征写成，1936年开始发表。'], sourceIds:['PS-CHEN'] },
      { id:'record', title:'记录的边界', kind:'interpretation', paragraphs:['陈云的叙述使长征经验得到传播。阅读亲历者文字时，也应区分亲历范围、写作时间和发表时间，不把他离队后的行程写成全程随军。'], sourceIds:['PS-CHEN'] },
    ], milestones:[{date:'1935年1月',text:'参加遵义会议并传达会议精神',sourceId:'PS-CHEN'},{date:'1935年5月',text:'奉命离队执行任务',sourceId:'PS-CHEN'}], events:[zunyi('参加会议，起草传达提纲。','PS-CHEN'),{id:'EVT-042',title:'巧渡金沙江',relation:'担任渡河政治委员。',sourceId:'PS-JINSHA'}],
  },
  {
    id:'liu-bocheng', name:'刘伯承', role:'在险阻之间打开通路', publicationStatus:'draft',
    introduction:'突破江河、组织先遣，往往决定后续大部队能否前进。刘伯承的长征经历，可以从这些具体任务读起。',
    biography:'刘伯承是红军总参谋长。长征初期在红五军团担任后卫工作，复任总参谋长后参加遵义会议，参与金沙江、大渡河等先遣与渡河行动。', biographySourceIds:['PS-LIU'],
    portrait:photo('L-03 / POR-LIU-03','/people-media/POR-LIU-03.jpg',252,378,'1937年，延安','陕西省档案馆藏，1937年延安照片；拍摄于长征结束后，完整保留馆方网页图像。','PI-LIU'),
    chapters:[
      { id:'rear', title:'后卫与先遣', paragraphs:['长征初期，刘伯承在红五军团执行后卫任务，后来复任总参谋长。1935年1月参与突破乌江、攻取遵义，随后参加遵义会议。'], sourceIds:['PS-LIU'] },
      { id:'river', title:'在金沙江组织渡河', paragraphs:['巧渡金沙江期间，刘伯承在皎平渡组织渡河，与政治委员陈云共同承担渡河指挥任务。这一工作使后续部队得以接续通过。'], sourceIds:['PS-LIU','PS-JINSHA'] },
      { id:'dadu', title:'继续打开北上的通道', paragraphs:['1935年5月，刘伯承率领先遣部队进入大凉山，与彝族首领小叶丹结盟。随后，他参与指挥强渡大渡河。'], sourceIds:['PS-LIU'] },
    ], milestones:[{date:'1935年1月',text:'参加遵义会议',sourceId:'PS-LIU'},{date:'1935年5月',text:'参与金沙江渡河与大渡河行动',sourceId:'PS-LIU'}], events:[zunyi('以总参谋长身份参加会议。','PS-LIU'),{id:'EVT-042',title:'巧渡金沙江',relation:'担任渡河司令员，在皎平渡组织渡河。',sourceId:'PS-JINSHA'},{id:'EVT-047',title:'强渡大渡河',relation:'参与先遣与渡河指挥。',sourceId:'PS-LIU'}],
  },
  {
    id:'wang-jiaxiang', name:'王稼祥', role:'在关键讨论中作出选择', publicationStatus:'draft',
    introduction:'在长征的重要转折中，王稼祥既是讨论的参与者，也是军事领导工作的一员。这里从会议与组织分工的线索进入他的经历。',
    biography:'王稼祥在遵义会议上支持毛泽东的军事主张，随后参与军事指挥小组。新中国成立后，任中国首任驻苏联大使。', biographySourceIds:['PS-WANG'],
    portrait:photo('W-02 / AST-0009','/history-media/AST-0009.jpg',350,500,'1941年，与朱仲丽合影','王稼祥与朱仲丽合影。原合影完整呈现，非长征时期照片，不裁成单人像。','PI-WANG'),
    chapters:[
      { id:'choice', title:'遵义会议上的选择', paragraphs:['王稼祥在长征途中支持毛泽东的军事主张，在遵义会议上支持纠正错误的军事指挥。他的态度是会议讨论中的重要一环。'], sourceIds:['PS-WANG'] },
      { id:'group', title:'参与军事领导工作', paragraphs:['遵义会议后，王稼祥与毛泽东、周恩来组成军事指挥小组。这是会后领导分工进一步调整的结果，不应与会议前原有的“三人团”混为一谈。'], sourceIds:['PS-WANG'] },
      { id:'later', title:'从长征走向新的岗位', paragraphs:['后来，王稼祥继续从事党的工作。新中国成立后，他出任中国首任驻苏联大使，转入新的外交工作岗位。'], sourceIds:['PS-WANG'] },
    ], milestones:[{date:'1935年1月',text:'参加遵义会议，支持毛泽东主张',sourceId:'PS-WANG'},{date:'遵义会议后',text:'参与军事指挥小组',sourceId:'PS-WANG'}], events:[zunyi('支持毛泽东的军事主张。','PS-WANG')],
  },
  {
    id:'bo-gu', name:'博古', alias:'秦邦宪', role:'在历史转折中理解责任', publicationStatus:'draft',
    introduction:'人物档案也应如实面对失误。理解博古，需要把长征初期的领导责任、遵义会议的批评和他后来的工作放在各自的历史位置上。',
    biography:'博古原名秦邦宪，曾承担中央领导工作。遵义会议批评其军事指导错误；后来从事新闻出版工作，1941年至1946年任新华社社长。', biographySourceIds:['PS-BO','PS-BO-NEWS'],
    portrait:photo('B-01 / AST-0010','/history-media/AST-0010.jpg',235,294,'拍摄年代待考','秦邦宪（博古）单人照；最初摄影出处与拍摄年份待考。','PI-BO'),
    chapters:[
      { id:'responsibility', title:'长征初期的领导责任', paragraphs:['博古原名秦邦宪，曾在苏联学习，回国后进入中共中央领导层。长征初期，他是承担中央领导工作的主要负责人之一。其军事指导错误成为遵义会议批评的对象。'], sourceIds:['PS-BO','PS-ZUNYI'] },
      { id:'conference', title:'遵义：报告受到批评', paragraphs:['博古在遵义会议所作报告，主要从客观条件解释失利。会议多数意见转而强调军事指挥中的错误，并通过组织调整改变了此前的领导格局。'], sourceIds:['PS-BO','PS-ZUNYI'] },
      { id:'press', title:'后来投身新闻出版', paragraphs:['1941年至1946年，博古担任新华社社长，并参与领导《解放日报》等新闻出版工作。这部分经历与他在长征初期承担的责任，应分别考察。'], sourceIds:['PS-BO-NEWS'] },
    ], milestones:[{date:'1935年1月',text:'遵义会议作报告，会议批评其军事指导错误',sourceId:'PS-ZUNYI'},{date:'1941—1946年',text:'从事新华社等新闻出版领导工作',sourceId:'PS-BO-NEWS'}], events:[zunyi('在会上作报告；其军事指导错误受到批评。','PS-BO')],
  },
]
const research={...centralLeadership,...organizationRecords,...fieldCommanders,...otherArmies}
export const memorialPeople:MemorialPerson[]=[...firstRoundPeople,...additionalPeople].map(person=>{
 const record=research[person.id]
 if(!record)throw Error('Person research missing: '+person.id)
 return {...person,research:record,chapters:record.chapters,milestones:record.moments.map(item=>({date:item.date,text:item.title,sourceId:item.sourceIds[0]!}))}
})
export const personById = new Map(memorialPeople.map(person => [person.id, person]))
