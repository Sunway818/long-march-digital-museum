import { useEffect, useRef } from 'react'

export function SourceDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal()
    else if (!open && dialog.current?.open) dialog.current.close()
  }, [open])
  return <dialog ref={dialog} className="source-dialog" aria-labelledby="source-heading" onClose={onClose} onCancel={onClose} onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <div className="source-dialog-inner">
      <span className="eyebrow">影像说明</span><h2 id="source-heading">关于首页影像</h2>
      <p>首页山河与行军画面为长征主题艺术示意，不是真实历史档案照片。红旗、云雾与光影用于展陈，不对应特定人物、地点或事件。</p>
      <p>首页原图由项目组提供，原作者与创作方式未能确认。本展为杭电学生课程实践作品，不代表学校官方发布。</p>
      <button className="text-button" onClick={onClose} autoFocus>关闭说明 <span aria-hidden="true">×</span></button>
    </div>
  </dialog>
}
