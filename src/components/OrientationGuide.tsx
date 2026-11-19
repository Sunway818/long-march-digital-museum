import { useEffect, useRef, useState } from 'react'

/** Only changes layout metadata; page, map and animation instances stay mounted. */
export function OrientationGuide() {
  const dialog = useRef<HTMLDialogElement>(null)
  const [portrait, setPortrait] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  useEffect(() => {
    const update = () => {
      const touch = matchMedia('(any-pointer: coarse)').matches || navigator.maxTouchPoints > 0
      const small = innerWidth <= 1024 && (innerHeight <= 600 || touch)
      document.documentElement.dataset.compact = String(small)
      setPortrait(touch && innerWidth < innerHeight && innerWidth <= 600)
    }
    update()
    addEventListener('resize', update)
    visualViewport?.addEventListener('resize', update)
    return () => { removeEventListener('resize', update); visualViewport?.removeEventListener('resize', update); delete document.documentElement.dataset.compact }
  }, [])
  useEffect(() => {
    if (portrait && !dismissed) dialog.current?.showModal()
    else { if (!portrait && dialog.current?.open) setDismissed(true); dialog.current?.close() }
  }, [portrait, dismissed])
  return <dialog ref={dialog} className="orientation-guide" aria-labelledby="orientation-title" onCancel={() => setDismissed(true)}>
    <p className="orientation-brand">伟大征程</p><p>长征胜利九十周年纪念交互网站</p>
    <span className="rotate-device" aria-hidden="true">↻</span>
    <h2 id="orientation-title">请横屏观览</h2><p>旋转手机，开启沉浸式长征历史之旅。</p>
    <button onClick={() => setDismissed(true)}>继续竖屏浏览</button>
  </dialog>
}
