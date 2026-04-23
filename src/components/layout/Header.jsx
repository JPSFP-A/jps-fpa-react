import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'

export function Header() {
  const { session, toggleSidebar, activeVersion, versions, setActiveVersionId, activeVersionId, showToast } = useAppStore()
  const [user, setUser] = useState(null)

  useEffect(() => {
    setUser(session?.user ?? null)
  }, [session])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    showToast('Signed out', 'info')
  }

  return (
    <header className="bg-surface border-b border-border px-4 py-2.5 flex items-center gap-3 flex-shrink-0 z-10">
      {/* Hamburger */}
      <button
        onClick={toggleSidebar}
        className="text-muted hover:text-fg bg-transparent border-0 cursor-pointer text-lg leading-none p-1"
        title="Toggle sidebar"
      >
        ☰
      </button>

      {/* Brand */}
      <span className="text-[15px] font-bold text-white whitespace-nowrap">⚡ JPS FP&amp;A</span>

      {/* Version selector */}
      <div className="flex items-center gap-2 ml-2">
        <span className="text-[11px] text-muted">Version:</span>
        <select
          value={activeVersionId ?? ''}
          onChange={e => setActiveVersionId(e.target.value || null)}
          className="bg-surface2 border border-border text-fg text-[12px] px-2 py-1 rounded-md cursor-pointer outline-none"
        >
          <option value="">— select —</option>
          {versions.map(v => (
            <option key={v.id} value={v.id}>
              {v.version_label} ({v.version_type} {v.fiscal_year})
            </option>
          ))}
        </select>
        {activeVersion && (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
            activeVersion.version_type === 'ACTUAL'
              ? 'bg-accent2/10 border-accent2 text-accent2'
              : activeVersion.version_type === 'BUDGET'
              ? 'bg-accent/10 border-accent text-accent'
              : 'bg-accent3/10 border-accent3 text-accent3'
          }`}>
            {activeVersion.version_type}
          </span>
        )}
      </div>

      <div className="ml-auto flex items-center gap-3">
        {user && (
          <span className="text-[11px] text-muted hidden sm:block">
            {user.email}
          </span>
        )}
        <Button variant="ghost" size="sm" onClick={handleSignOut}>Sign out</Button>
      </div>
    </header>
  )
}
