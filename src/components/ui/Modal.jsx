import { useEffect } from 'react'
import { Button } from './Button'

export function Modal({ open, onClose, title, children, footer, wide = false }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose?.() }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}
    >
      <div className={`bg-surface border border-border rounded-xl flex flex-col max-h-[85vh] ${wide ? 'w-[900px]' : 'w-[680px]'} max-w-[95vw]`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-[15px] font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-muted hover:text-fg bg-transparent border-0 text-xl cursor-pointer leading-none">✕</button>
        </div>
        <div className="p-5 overflow-y-auto flex-1">{children}</div>
        {footer && (
          <div className="px-5 py-3 border-t border-border flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
