import { useEffect, useRef } from 'react'
import { resources } from '../assets/resources'

export function SourceDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal()
    else if (!open && dialog.current?.open) dialog.current.close()
  }, [open])
  return <dialog ref={dialog} className="source-dialog" aria-labelledby="source-heading" onClose={onClose} onCancel={onClose} onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <div className="source-dialog-inner">
      <span className="eyebrow">影像说明</span><h2 id="source-heading">关于首页影像</h2>
      <p>本图为用户提供的长征主题艺术化场景，不是真实历史档案照片。</p>
      <p>作者、创作方式与使用授权信息待补充。图中场景不作为具体历史事件、地点或人物的证据。</p>
      <p className="source-file">原始文件：{resources.heroSource}</p>
      <button className="text-button" onClick={onClose} autoFocus>关闭说明 <span aria-hidden="true">×</span></button>
    </div>
  </dialog>
}
