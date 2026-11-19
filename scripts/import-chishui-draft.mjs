/** 导入用户提供的原创初稿；只生成独立展陈草稿，不改历史登记或路线。 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
const source = readFileSync(process.argv[2], 'utf8')
const body = source.split('# 二、四渡赤水历史叙事初稿')[1]?.split('# 三、沉浸式展陈实施要求')[0]
if (!body) throw Error('未找到用户叙事初稿')
const keys = ['prologue', 'first', 'second', 'third', 'fourth', 'epilogue']
const scenes = []
for (const block of body.split(/^## /m).slice(1)) {
  const lines = block.trim().split(/\r?\n/)
  const title = lines.shift().trim()
  const paragraphs = [], interpretation = []
  let analysis = false, analysisTitle = '', metadata = ''
  for (const raw of lines) {
    const line = raw.trim()
    if (!line || line === '---') continue
    if (/^\*\*本站解读/.test(line)) { analysis = true; analysisTitle = line.replaceAll('**', '').split('｜')[1]; continue }
    if (!paragraphs.length && !metadata && /^\*\*(时间：|1935)/.test(line)) { metadata = line.replaceAll('**', '').replace(/^时间：/, ''); continue }
    const paragraph = { text: line.replaceAll('**', ''), emphasis: line.startsWith('**') }
    ;(analysis ? interpretation : paragraphs).push(paragraph)
  }
  scenes.push({ id: keys[scenes.length], title, metadata, paragraphs, analysisTitle, interpretation })
}
if (scenes.length !== 6) throw Error('应为序章、四章与终章，共六个场景')
mkdirSync('docs/history', { recursive: true })
writeFileSync('docs/history/CHISHUI_USER_NARRATIVE.md', '# 四渡赤水用户原创初稿\n\n来源：2026-11-14用户提供的展陈深化任务。以下保留原文，供逐段审核。\n\n## ' + body.split(/^## /m).slice(1).join('## ').trim() + '\n')
mkdirSync('src/data/history/exhibitions', { recursive: true })
writeFileSync('src/data/history/exhibitions/chishui-draft.json', JSON.stringify({
  title: '四渡赤水', period: '1935年1月至3月', status: 'draft', reviewStatus: 'pending',
  origin: '用户提供的展陈深化任务（2026-11-14），正文完整导入，关键日期、方向和结论未改写',
  sourceSha256: createHash('sha256').update(source).digest('hex'), scenes,
}, null, 2) + '\n')
const selected = ['AST-0012','AST-0013','AST-0014','AST-0017','AST-0018','AST-0020','AST-0027','AST-0030','AST-0033','AST-0034','AST-0035','AST-0036','AST-0037','AST-0038','AST-0039','AST-0040','AST-0041','AST-0042','AST-0045','AST-0052','AST-0053','AST-0054','AST-0061','AST-0072','AST-0074','AST-0075','AST-0080']
const registry = JSON.parse(readFileSync('research/overnight_20261110/images/data/download-results.json', 'utf8'))
writeFileSync('src/data/history/exhibitions/media-dimensions.json', JSON.stringify(Object.fromEntries(registry.filter(i => selected.includes(i.id)).map(i => [i.id, { width: i.width, height: i.height }])), null, 2) + '\n')
console.log(JSON.stringify(scenes.map(s => ({ id: s.id, facts: s.paragraphs.length, interpretation: s.interpretation.length }))))
