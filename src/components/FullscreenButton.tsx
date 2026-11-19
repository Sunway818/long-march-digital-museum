import { useEffect, useState } from 'react'

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null
  webkitExitFullscreen?: () => void | Promise<void>
}
type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => void | Promise<void>
}

const currentFullscreen = () => {
  const page = document as FullscreenDocument
  return page.fullscreenElement ?? page.webkitFullscreenElement ?? null
}

export function FullscreenButton() {
  const [fullscreen, setFullscreen] = useState(() => Boolean(currentFullscreen()))
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const change = () => { setFullscreen(Boolean(currentFullscreen())); setMessage('') }
    document.addEventListener('fullscreenchange', change)
    document.addEventListener('webkitfullscreenchange', change)
    return () => {
      document.removeEventListener('fullscreenchange', change)
      document.removeEventListener('webkitfullscreenchange', change)
    }
  }, [])

  const toggle = async () => {
    const page = document as FullscreenDocument
    const root = document.documentElement as FullscreenElement
    setMessage('')
    setBusy(true)
    try {
      // Fullscreen the document so navigation to the map keeps the entire site visible.
      if (currentFullscreen()) {
        const exit = page.exitFullscreen ?? page.webkitExitFullscreen
        if (!exit) throw new Error('Fullscreen exit unavailable')
        await exit.call(page)
      } else {
        const enter = root.requestFullscreen ?? root.webkitRequestFullscreen
        if (!enter) {
          setMessage('当前浏览器不支持网页全屏，请尝试浏览器菜单中的全屏功能。')
          return
        }
        await enter.call(root)
      }
      setFullscreen(Boolean(currentFullscreen()))
    } catch {
      setMessage('浏览器未能切换全屏，请重试或使用浏览器菜单中的全屏功能。')
    } finally {
      setBusy(false)
    }
  }

  return <div className="home-fullscreen">
    <button type="button" className="home-fullscreen-button" onClick={() => { void toggle() }} disabled={busy} aria-pressed={fullscreen}>
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d={fullscreen ? 'M9 3v6H3m18 0h-6V3M3 15h6v6m6 0v-6h6' : 'M9 3H3v6m12-6h6v6M3 15v6h6m6 0h6v-6'} />
      </svg>
      <span>{fullscreen ? '退出全屏' : '全屏'}</span>
    </button>
    {message && <div className="home-fullscreen-message"><p role="status">{message}</p><button type="button" aria-label="关闭全屏提示" onClick={() => setMessage('')}>×</button></div>}
  </div>
}
