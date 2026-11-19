import type { YouthKeyword } from '../../data/history/legacy/content'
import { keepsakeMarkRatio, loadKeepsakeMark } from './keepsakeBrand'
const segmenter = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter('zh', { granularity: 'grapheme' }) : null
export const splitCharacters = (text: string) => segmenter ? Array.from(segmenter.segment(text), item => item.segment) : Array.from(text)
export const limitAnswer = (text: string) => splitCharacters(text.replace(/\r\n?/g, '\n')).slice(0, 200).join('')
export function keepsakeText(keyword: YouthKeyword, answer: string) {
 return `伟大征程 · 青春纪念笺\n\n${keyword.word}\n在杭电的这几年，我希望……\n${answer}\n\n国家大事，千万尽力。\n长征胜利90周年 · 杭电建校70周年\n2026 · 我的青春征途\n笃学力行，守正求新。`
}
function wrapText(context: CanvasRenderingContext2D, text: string, width: number) {
 const lines: string[] = []
 for (const paragraph of text.split('\n')) {
  const paragraphStart=lines.length
  let line = ''
  for (const character of splitCharacters(paragraph)) {
   if (line && context.measureText(line + character).width > width) {
    // 中文句末标点不落在新行行首，左括号与引号不悬在上一行末尾。
    const characters=splitCharacters(line)
    const last=characters[characters.length-1]!
    if(characters.length>1&&(/^[，。！？；：、）》」』】〕〉…,.!?;:%]/u.test(character)||/^[（《「『【〔〈“‘]$/u.test(last))){
     lines.push(characters.slice(0,-1).join(''));line=last
    }else{lines.push(line);line=''}
   }
   line += character
  }
  lines.push(line)
  // 自动换行只剩一两个字时，优先在语句停顿处重排末两行；用户手动换行保持原样。
  if(lines.length-paragraphStart>=2&&splitCharacters(line).length<=4){
   const joined=splitCharacters(lines[lines.length-2]!+line)
   let split=Math.floor(joined.length/2)
   const pauses=joined.flatMap((character,index)=>/[，、；：,;:]/u.test(character)&&index>joined.length*.25&&index<joined.length*.75?[index+1]:[])
   if(pauses.length)split=pauses.reduce((best,index)=>Math.abs(index-joined.length/2)<Math.abs(best-joined.length/2)?index:best,pauses[0]!)
   while(split>1&&(/^[，。！？；：、）》」』】〕〉…,.!?;:%]/u.test(joined[split]!)||/^[（《「『【〔〈“‘]$/u.test(joined[split-1]!)))split--
   const first=joined.slice(0,split).join(''),last=joined.slice(split).join('')
   if(context.measureText(first).width<=width&&context.measureText(last).width<=width){lines[lines.length-2]=first;lines[lines.length-1]=last}
  }
 }
 return lines
}
/** 预览与导出共用同一绘制函数；校标仅来自已加载的同源官方原件。 */
export function paintKeepsake(canvas: HTMLCanvasElement, keyword: YouthKeyword | null, answer: string, mark: HTMLImageElement, preview = false) {
 const context=canvas.getContext('2d')
 if(!context)throw Error('此浏览器暂不支持图片绘制，请复制文字保存。')
 context.font='34px LegacySerif, "Songti SC", "Microsoft YaHei", serif'
 const body=answer || (keyword?'在左侧写下你的想法。':'每一份青春，都有自己的征途。')
 const lines=wrapText(context,body,816)
 canvas.width=1080;canvas.height=Math.max(1440,930+lines.length*52)
 const height=canvas.height
 context.fillStyle='#19251f';context.fillRect(0,0,1080,height)
 context.fillStyle='#cbb484';context.font='26px LegacySerif, serif';context.fillText('伟大征程 · 青春纪念笺',112,88)
 // 原图等比绘制，右边缘与正文/页脚对齐；年份下移，给校标完整留白。
 const markWidth=288,markHeight=markWidth/keepsakeMarkRatio
 context.drawImage(mark,968-markWidth,49,markWidth,markHeight)
 context.textAlign='right';context.font='39px LegacySerif, serif';context.fillText('2026',968,167)
 if(preview){context.font='21px LegacySerif, serif';context.fillStyle='#c0c1ae';context.fillText(keyword?'实时预览':'示例预览',968,208)}
 context.textAlign='left';context.fillStyle='#e3c58c';context.font='148px LegacyBrush, serif';context.fillText(keyword?.word??'青春',104,292)
 context.fillStyle='#c0c1ae';context.font='27px LegacySerif, serif';context.fillText('在杭电的这几年，我希望……',112,366)
 context.fillStyle='#f0e8d6';context.font='34px LegacySerif, "Songti SC", "Microsoft YaHei", serif'
 lines.forEach((line,index)=>context.fillText(line,112,448+index*52))
 // 历史路线沿书写区外侧前行，在页脚逐渐规整为电路，正文与装饰不相交。
 const routeY=height-370
 context.strokeStyle='#a85c4b';context.lineWidth=4;context.lineJoin='round'
 context.beginPath();context.moveTo(29,309);context.lineTo(53,333);context.lineTo(43,377);context.lineTo(71,401);context.lineTo(52,436);context.lineTo(69,469);context.lineTo(49,503);context.lineTo(65,routeY-72);context.lineTo(48,routeY-31);context.lineTo(96,routeY+1);context.lineTo(188,routeY+1);context.lineTo(219,routeY-30);context.lineTo(303,routeY-30);context.lineTo(334,routeY+1);context.lineTo(617,routeY+1);context.lineTo(649,routeY-31);context.lineTo(759,routeY-31);context.lineTo(791,routeY+1);context.lineTo(908,routeY+1);context.stroke()
 context.strokeStyle='#a98c59';context.lineWidth=2
 context.beginPath();context.moveTo(617,routeY+1);context.lineTo(617,routeY-66);context.lineTo(654,routeY-103);context.lineTo(783,routeY-103);context.lineTo(812,routeY-74);context.lineTo(877,routeY-74);context.lineTo(897,routeY-54);context.lineTo(908,routeY-54);context.moveTo(759,routeY-31);context.lineTo(759,routeY+53);context.lineTo(818,routeY+53);context.lineTo(852,routeY+19);context.lineTo(908,routeY+19);context.stroke()
 context.strokeRect(908,routeY-65,64,86);context.strokeRect(920,routeY-53,40,62)
 for(const offset of [-48,-30,-12,6]){context.beginPath();context.moveTo(896,routeY+offset);context.lineTo(908,routeY+offset);context.moveTo(972,routeY+offset);context.lineTo(991,routeY+offset);context.stroke()}
 for(const [x,y] of [[617,routeY-66],[759,routeY+53],[303,routeY-30]]){context.beginPath();context.arc(x!,y!,5,0,Math.PI*2);context.fillStyle='#19251f';context.fill();context.stroke()}
 context.fillStyle='#e3c58c';context.font='47px LegacyBrush, serif';context.fillText('国家大事，千万尽力。',112,height-201)
 context.fillStyle='#d5c9ad';context.font='25px LegacySerif, serif';context.fillText('长征胜利90周年 · 杭电建校70周年',112,height-128)
 context.font='24px LegacySerif, serif';context.fillText('2026 · 我的青春征途',112,height-79)
 context.textAlign='right';context.font='21px LegacySerif, serif';context.fillText('笃学力行，守正求新。',968,height-79)
 context.textAlign='left';context.fillStyle='#c0c1ae';context.font='18px LegacySerif, serif';context.fillText('学生课程实践作品',112,height-34)
 return {width:canvas.width,height:canvas.height}
}
/** 等待同源校标成功加载再导出，缺图时明确失败，避免保存不完整的纪念笺。 */
export async function renderKeepsake(keyword: YouthKeyword, answer: string): Promise<Blob> {
 const [mark]=await Promise.all([loadKeepsakeMark(),Promise.allSettled([document.fonts.load('40px LegacySerif'),document.fonts.load('100px LegacyBrush')])])
 const canvas=document.createElement('canvas')
 paintKeepsake(canvas,keyword,answer,mark)
 return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('图片暂未导出，请重试或复制文字。')),'image/png'))
}
