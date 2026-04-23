import { useAppStore } from '@/store/useAppStore'
import { NAV_ITEMS } from '@/lib/constants'

export function Sidebar() {
  const { activePane, setActivePane, sidebarCollapsed } = useAppStore()

  // Group items
  const groups = NAV_ITEMS.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = []
    acc[item.group].push(item)
    return acc
  }, {})

  return (
    <aside
      className="bg-surface border-r border-border flex-shrink-0 overflow-y-auto transition-all duration-200"
      style={{ width: sidebarCollapsed ? 52 : 200 }}
    >
      {Object.entries(groups).map(([group, items]) => (
        <div key={group}>
          {!sidebarCollapsed && (
            <div className="px-3.5 pt-3 pb-1 text-[10px] font-bold text-muted uppercase tracking-widest">
              {group}
            </div>
          )}
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePane(item.id)}
              title={sidebarCollapsed ? item.label : undefined}
              className={[
                'w-full flex items-center gap-2.5 px-3.5 py-2 text-left border-l-[3px] transition-all duration-150 cursor-pointer bg-transparent border-t-0 border-b-0 border-r-0',
                activePane === item.id
                  ? 'border-l-accent bg-surface2 text-fg'
                  : 'border-l-transparent text-muted hover:bg-surface2 hover:text-fg',
              ].join(' ')}
            >
              <span className="text-base w-[18px] text-center flex-shrink-0">{item.icon}</span>
              {!sidebarCollapsed && <span className="text-[12px] font-medium truncate">{item.label}</span>}
            </button>
          ))}
        </div>
      ))}
    </aside>
  )
}
