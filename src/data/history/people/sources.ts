import type { PersonSource } from '../../../features/people/types'
import { roundTwoSources } from './round2-sources'

export const personSources: PersonSource[] = [
  ...roundTwoSources,
  { id:'PS-ZUNYI', title:'遵义会议决议：伟大历史转折的纲领性文献', institution:'中央党史和文献研究院网站 · 学习时报', url:'https://www.dswxyjy.org.cn/n1/2026/0123/c219021-40651460.html', locator:'洪敏，2026-01-23；会议日期、毛泽东增选常委、张闻天起草决议、陈云传达' },
  { id:'PS-ZHOU', title:'周恩来与遵义会议和红军长征的胜利', institution:'人民网 · 周恩来纪念网', url:'https://zhouenlai.people.com.cn/n1/2019/0314/c409117-30976567.html', locator:'孙家荣、徐向群，2019-03-14；长征准备、遵义会议、军事组织指挥各节' },
  { id:'PS-ZHANG', title:'张闻天：忠于党、忠于人民的一生', institution:'共产党员网 · 新华社', url:'https://www.12371.cn/2019/08/26/ARTI1566780338404706.shtml', locator:'郭敬丹、吴振东，2019-08-26；生平、遵义会议报告及延安调查' },
  { id:'PS-ZHU', title:'朱德', institution:'中国共产党新闻网 · 党史人物', url:'https://cpc.people.com.cn/GB/64162/126778/126780/7489937.html', locator:'人物生平：1922年入党、井冈山、长征指挥与1936年北上' },
  { id:'PS-CHEN', title:'谁是向世界介绍红军长征第一人', institution:'中央党史和文献研究院网站 · 新华社', url:'https://www.dswxyjy.org.cn/n1/2016/0929/c222139-28749929.html', locator:'刘子君、马艺、陈连鑫，2016-09-29；参加长征、遵义传达、离队任务与随军西行见闻录' },
  { id:'PS-JINSHA', title:'第一本讲述长征的书——陈云《随军西行见闻录》', institution:'中央党史和文献研究院网站', url:'https://www.dswxyjy.org.cn/n1/2019/0228/c423731-30940087.html', locator:'韩晓青；巧渡金沙江，渡河司令员刘伯承、政治委员陈云' },
  { id:'PS-LIU', title:'刘伯承', institution:'中国共产党新闻网 · 党史人物', url:'https://cpc.people.com.cn/GB/64162/126778/126780/7490151.html', locator:'人物生平：长征后卫、复任总参谋长、遵义会议、皎平渡及大渡河' },
  { id:'PS-WANG', title:'革命是我终身的寄托', institution:'中央党史和文献研究院网站 · 学习时报', url:'https://www.dswxyjy.org.cn/n1/2024/0119/c244516-40162513.html', locator:'戴和圣，2024-01-19；遵义会议及军事指挥小组、后来外交工作' },
  { id:'PS-BO', title:'“不堪重负的党中央总负责”——博古', institution:'人民网 · 党史频道', url:'https://dangshi.people.com.cn/n/2015/1204/c85037-27890254.html', locator:'2015-12-04；原名秦邦宪、临时中央、遵义会议报告与组织调整' },
  { id:'PS-BO-NEWS', title:'博古与新华社', institution:'人民网 · 党史博览', url:'https://dangshi.people.com.cn/n1/2018/0419/c85037-29936487.html', locator:'2018-04-19；1941—1946年新闻出版工作' },
  { id:'PI-MAO', title:'长征到达陕北后的毛泽东', institution:'人民网 · 毛主席纪念堂', url:'https://cpc.people.com.cn/GB/143527/143544/8851300.html', locator:'原图alt及1936年斯诺采访文字，保留原图水印与原图注' },
  { id:'PI-ZHOU', title:'深切缅怀敬爱的周恩来总理', institution:'陈云纪念馆', url:'https://www.cyjng.net/h-nd-557.html', locator:'data-index=9图，图注“1936年西安事变期间的周恩来”' },
  { id:'PI-ZHU', title:'始终与人民群众心连心——论朱德的群众思想', institution:'人民网 · 党史频道', url:'http://dangshi.people.com.cn/n1/2017/0426/c85037-29236524.html', locator:'首图：“图为到达陕北时的朱德”；具体拍摄年月未注明' },
  { id:'PI-CHEN', title:'陈云生平影像', institution:'中央党史和文献研究院网站', url:'https://www.dswxyjy.org.cn/GB/427277/460592/index.html', locator:'青年时期的陈云，既有AST-0006 / C-02采用记录' },
  { id:'PI-LIU', title:'党的领导人在延安', institution:'陕西省档案馆', url:'http://daj.shaanxi.gov.cn/Article/View?id=1785', locator:'编研处李艳，2021-04-25；正文说明本组为1937年，紧邻第五图“刘伯承”；照片珍藏于陕西省档案馆' },
  { id:'PI-WANG', title:'王稼祥与朱仲丽', institution:'人民网 · 党史频道', url:'https://dangshi.people.com.cn/n/2014/0213/c85037-24345288.html', locator:'1941年合影，沿用AST-0009 / W-02，完整双人照片' },
  { id:'PI-BO', title:'秦邦宪（博古）照片线索', institution:'红色文化网（原登记来源）', url:'https://www.hswh.org.cn/wzzx/llyd/ls/2025-06-24/94633.html', locator:'沿用AST-0010 / B-01；原图单人像，年代与最初摄影出处仍待考，不借用文章跨度推定拍摄年' },
]
export const personSourceById = new Map(personSources.map(source => [source.id, source]))
