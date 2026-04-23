/**
 * useFacts — fetches fpa_facts for a given versionId + year.
 * Returns { facts, periods, loading, error, reload }
 *
 * facts  — { [lineId]: { [month 1-12]: value } }
 * periods — sorted array of fpa_dim_period rows for that year
 */
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export function useFacts(versionId, year) {
  const [facts,   setFacts]   = useState({})
  const [periods, setPeriods] = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const load = useCallback(async () => {
    if (!versionId || !year) { setFacts({}); setPeriods([]); return }
    setLoading(true)
    setError(null)
    try {
      // Periods for this year
      const { data: pdata, error: pe } = await supabase
        .from('fpa_dim_period')
        .select('id, month_num, month_name, fiscal_year, is_closed')
        .eq('fiscal_year', year)
        .order('month_num')
      if (pe) throw pe

      const pids = (pdata ?? []).map(p => p.id)
      setPeriods(pdata ?? [])

      if (!pids.length) { setFacts({}); setLoading(false); return }

      // Facts for this version + these periods
      const { data: fdata, error: fe } = await supabase
        .from('fpa_facts')
        .select('line_id, period_id, value')
        .eq('version_id', versionId)
        .in('period_id', pids)
      if (fe) throw fe

      // Build lookup: { lineId: { month: value } }
      const periodToMonth = {}
      pdata.forEach(p => { periodToMonth[p.id] = p.month_num })

      const idx = {}
      ;(fdata ?? []).forEach(f => {
        const month = periodToMonth[f.period_id]
        if (!month) return
        if (!idx[f.line_id]) idx[f.line_id] = {}
        idx[f.line_id][month] = Number(f.value)
      })
      setFacts(idx)
    } catch (e) {
      setError(e.message ?? String(e))
    } finally {
      setLoading(false)
    }
  }, [versionId, year])

  useEffect(() => { load() }, [load])

  // Helper: get 12-element array for a line (0 for missing)
  const monthly = (lineId) => Array.from({ length: 12 }, (_, i) => facts[lineId]?.[i + 1] ?? 0)

  // Helper: annual sum for a line
  const annual = (lineId) => monthly(lineId).reduce((a, v) => a + v, 0)

  return { facts, periods, loading, error, reload: load, monthly, annual }
}
