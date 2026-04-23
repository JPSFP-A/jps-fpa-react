import { useAppStore } from '@/store/useAppStore'

const TYPE_STYLES = {
  ok:   'border-accent2 text-accent2',
  err:  'border-danger  text-danger',
  warn: 'border-warn    text-warn',
  info: 'border-accent  text-accent',
}

export function Toast() {
  const toast = useAppStore(s => s.toast)
  if (!toast) return null
  return (
    <div className={`fixed bottom-6 right-6 bg-surface2 border rounded-lg px-4 py-3 text-[13px] font-semibold z-[9999] max-w-sm shadow-xl transition-all ${TYPE_STYLES[toast.type] ?? TYPE_STYLES.info}`}>
      {toast.message}
    </div>
  )
}
