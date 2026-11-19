import media from './round2-media.json' with {type:'json'}
import type {MemorialPerson,Portrait} from '../../../features/people/types'
const portrait=(id:string,sourceId:string):Portrait=>{
 const record=media.find(item=>item.id===id)
 if(!record)throw Error('Registered portrait missing: '+id)
 return {id:record.id,url:record.url,width:record.width,height:record.height,date:record.date,place:record.place,caption:record.caption,sourceId,longMarchPhoto:record.longMarchPhoto,rights:record.rights,verificationStatus:'pending'}
}
const person=(id:string,name:string,role:string,introduction:string,biography:string,imageId:string,imageSource:string,bioSources:string[]):MemorialPerson=>({
 id,name,role,introduction,biography,biographySourceIds:bioSources,portrait:portrait(imageId,imageSource),chapters:[],milestones:[],events:[],publicationStatus:'draft',
})
export const additionalPeople:MemorialPerson[]=[
 person('peng-dehuai','彭德怀','红三军团的阻击与回师','一支部队怎样为全军争取时间，又怎样在回师中改变战局？从湘江的阻击到娄山关的进攻，读彭德怀承担的军团任务。','彭德怀领导平江起义，长期指挥红三军团。长征中率部阻击、回师并北上，后任陕甘支队司令员，1936年继续参与接应其他主力。','POR-PENG-01','PR-PENG-IMAGE',['PR-PENG','PR-PENG-YEAR']),
 person('nie-rongzhen','聂荣臻','为先遣队组织共同前进','政治委员的工作怎样进入渡河、开路和行军？从红一军团到北上先遣队，聂荣臻的经历让这些职责具体可见。','聂荣臻早年赴法、赴苏学习，参加多次革命军事活动。长征时任红一军团政治委员，参与先遣、大渡河及后续北上接应。','POR-NIE-01','PR-NIE-IMAGE',['PR-NIE','PR-NIE-YEAR']),
 person('lin-biao','林彪','前锋军团的作战任务','红一军团在全军行进中承担怎样的任务？本档案限定1934—1936年，按任职和行动考察林彪的军事经历。','林彪长征时任红一军团军团长，与聂荣臻共同领导部队。后任陕甘支队副司令员兼第一纵队司令员，1936年转任红大校长。','POR-LIN-01','PR-LIN',['PR-LIN','PR-LIN-REF']),
 person('he-long','贺龙','红二、六军团的协同转移','出发时间不同，所走的道路也不同。从湘西根据地到乌蒙回旋，再到甘孜会合，读贺龙与两军团共同转移的经历。','贺龙领导湘鄂西地区武装斗争，1934年与红六军团会合后率两军团行动。1935年11月长征，1936年7月任红二方面军总指挥。','POR-HE-REN-01','PR-HE-REN-IMAGE',['PR-HE']),
 person('ren-bishi','任弼时','转移中的政治与组织工作','让不同来源的部队形成共同方向，需要怎样的政治工作？任弼时的长征经历，连接着意见沟通、组织建设和北上的选择。','任弼时早年从事共青团和中央工作，后进入根据地。与贺龙等共同领导红二、六军团长征，1936年7月任红二方面军政治委员。','POR-HE-REN-01','PR-HE-REN-IMAGE',['PR-REN','PR-HE-REN']),
 person('xu-xiangqian','徐向前','川西北的作战与方向抉择','渡江、会合、包座作战，随后又经历南下与再次北上。徐向前的行程，显示战场指挥与战略分歧怎样交织。','徐向前曾就读黄埔军校，长期领导红四方面军。1935年指挥嘉陵江、包座等作战，经历两军会合后的分路，1936年率部北上。','POR-XUX-01','PR-XUX-IMAGE',['PR-XUX']),
 person('xu-haidong','徐海东','独立转战到率先到达陕北','一支与中央失去联系的队伍，如何在转战中寻找新的立足地区？从独树镇到永坪，读徐海东与红二十五军的独立征途。','徐海东由鄂豫皖地区的军事斗争走上长征，出发时任红二十五军副军长。到达陕北后任红十五军团军团长，继续作战巩固根据地。','POR-XUH-01','PR-XUH-HISTORY',['PR-XUH','PR-XUH-HISTORY']),
 person('cheng-zihua','程子华','从军事指挥到政治组织','长征不仅是走过一段路，也包含建立新的根据地。程子华的职责变化，让作战、地方工作与会师后的组织联系起来。','程子华由中央派赴鄂豫皖，任红二十五军军长，参与领导长征及鄂豫陕根据地创建。1935年9月转任政治委员，后任红十五军团政委。','POR-CHENG-01','PR-CHENG-REF',['PR-CHENG','PR-CHENG-REF']),
]
