import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import { AppShell } from '@/components/layout/AppShell'
import Login from '@/pages/Login'
import './index.css'

export default function App() {
  const { session, setSession, setVersions } = useAppStore()

  // Auth listener — always starts on Dashboard, never restores last pane
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Load all versions once authenticated
  useEffect(() => {
    if (!session) return
    supabase
      .from('fpa_versions')
      .select('id, version_label, version_type, fiscal_year, is_locked')
      .order('fiscal_year', { ascending: false })
      .then(({ data }) => setVersions(data ?? []))
  }, [session])

  if (!session) return <Login />
  return <AppShell />
}
