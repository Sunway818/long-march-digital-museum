import { readFileSync, existsSync, realpathSync, writeFileSync } from 'node:fs'
import { resolve, sep } from 'node:path'
import { createHash } from 'node:crypto'
import type { Plugin, ViteDevServer, PreviewServer } from 'vite'

/** Serve and bundle only explicitly registered site images, for every device. */
export function historyMediaPlugin(): Plugin {
  const project = process.cwd()
  const research = realpathSync(resolve(project, 'research'))
  const manifest = resolve(research, 'overnight_20261110/images/data/download-results.json')
  interface Entry { id: string; localPath?: string; sha256?: string; format?: string; size?: number }
  const entries = new Map<string, Entry>((JSON.parse(readFileSync(manifest, 'utf8')) as Entry[]).map(r => [r.id, r]))
  interface ImageRow { id: string; saved: boolean; rejected: boolean; local_preview_url: string | null }
  const rows = JSON.parse(readFileSync(resolve(project, 'src/data/history/map/images.json'), 'utf8')) as ImageRow[]
  const assets = new Map<string, { url: string; bytes: Buffer; mime: string }>()
  for (const row of rows.filter(r => r.saved && r.local_preview_url && !r.rejected)) {
    const entry = entries.get(row.id)
    if (!/^AST-\d{4}$/.test(row.id) || !entry?.localPath || !['JPEG', 'PNG'].includes(entry.format ?? '')) throw Error('Missing site image: ' + row.id)
    const filename = realpathSync(resolve(project, entry.localPath))
    if (!filename.startsWith(research + sep)) throw Error('Image outside research directory: ' + row.id)
    const bytes = readFileSync(filename)
    if (bytes.length !== entry.size || createHash('sha256').update(bytes).digest('hex') !== entry.sha256) throw Error('Image integrity mismatch: ' + row.id)
    const png = entry.format === 'PNG'
    assets.set(row.id, { url: `/history-media/${row.id}.${png ? 'png' : 'jpg'}`, bytes, mime: png ? 'image/png' : 'image/jpeg' })
  }
  const indexPath = resolve(project, 'src/data/history/map/media-files.json')
  const index = JSON.stringify(Object.fromEntries([...assets].map(([id, a]) => [id, a.url])), null, 2) + '\n'
  if (!existsSync(indexPath) || readFileSync(indexPath, 'utf8') !== index) writeFileSync(indexPath, index)
  const attach = (server: ViteDevServer | PreviewServer, builtAssets = false) => {
    server.middlewares.use((req, res, next) => {
      const url = (req.url ?? '').split('?')[0]!
      const base = server.config.base
      const path = base !== '/' && url.startsWith(base) ? url.slice(base.length - 1) : url
      const legacy = path.startsWith('/__research-media/')
      if (!legacy && !path.startsWith('/history-media/')) return next()
      if (builtAssets && !legacy) return next()
      const match = legacy ? /^\/__research-media\/(AST-\d{4})$/.exec(path) : /^\/history-media\/(AST-\d{4})\.(?:jpg|png)$/.exec(path)
      const asset = match ? assets.get(match[1]!) : undefined
      if (!['GET', 'HEAD'].includes(req.method ?? '') || !asset || (!legacy && path !== asset.url)) { res.statusCode = 404; res.end('Image unavailable'); return }
      res.setHeader('Content-Type', asset.mime)
      res.setHeader('Content-Length', asset.bytes.length)
      res.setHeader('Cache-Control', 'public, max-age=3600')
      res.setHeader('Cross-Origin-Resource-Policy', 'same-origin')
      res.setHeader('X-Content-Type-Options', 'nosniff')
      res.end(req.method === 'HEAD' ? undefined : asset.bytes)
    })
  }
  return { name: 'registered-history-media', configureServer: server => attach(server), configurePreviewServer: server => attach(server, true),
    buildStart() { for (const asset of assets.values()) this.emitFile({ type: 'asset', fileName: asset.url.slice(1), source: asset.bytes }) },
  }
}
