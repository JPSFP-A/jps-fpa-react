import { Suspense, lazy } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { Toast } from '@/components/ui/Toast'

// Lazy-load each page so bundles stay small
const PAGES = {
  dash:   lazy(() => import('@/pages/Dashboard')),
  flash:  lazy(() => import('@/pages/Flash')),
  is:     lazy(() => import('@/pages/IncomeStatement')),
  bs:     lazy(() => import('@/pages/BalanceSheet')),
  cf:     lazy(() => import('@/pages/CashFlow')),
  ratios: lazy(() => import('@/pages/Ratios')),
  debt:   lazy(() => import('@/pages/DebtSchedule')),
  budget: lazy(() => import('@/pages/Budget')),
  capex:  lazy(() => import('@/pages/CapEx')),
  upload: lazy(() => import('@/pages/DataUpload')),
  adm:    lazy(() => import('@/pages/DataManagement')),
}

function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center text-muted">
      <div className="text-center">
        <div className="text-3xl mb-3 animate-pulse">⚡</div>
        <div className="text-sm">Loading…</div>
      </div>
    </div>
  )
}

export function AppShell() {
  const activePane = useAppStore(s => s.activePane)
  const Page = PAGES[activePane] ?? PAGES.dash

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-bg p-4">
          <Suspense fallback={<PageLoader />}>
            <Page />
          </Suspense>
        </main>
      </div>
      <Toast />
    </div>
  )
}
