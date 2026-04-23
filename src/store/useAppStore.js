import { create } from 'zustand'

export const useAppStore = create((set, get) => ({
  // Auth
  session: null,
  setSession: (session) => set({ session }),

  // Active navigation
  activePane: 'dash',
  setActivePane: (pane) => set({ activePane: pane }),

  // Version context
  versions: [],
  activeVersionId: null,
  setVersions: (versions) => set({ versions }),
  setActiveVersionId: (id) => set({ activeVersionId: id }),
  get activeVersion() {
    return get().versions.find(v => v.id === get().activeVersionId) ?? null
  },

  // Period context
  activePeriodId: null,
  setActivePeriodId: (id) => set({ activePeriodId: id }),

  // Sidebar
  sidebarCollapsed: false,
  toggleSidebar: () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  // Toast
  toast: null,
  showToast: (message, type = 'info') => {
    set({ toast: { message, type, id: Date.now() } })
    setTimeout(() => set({ toast: null }), 3500)
  },
}))
