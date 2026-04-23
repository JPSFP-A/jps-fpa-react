/**
 * useLines — loads fpa_dim_line once and caches globally.
 * Returns { lines, loading, error }
 * lines is an array sorted by statement → sort_order.
 */
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

let _cache = null
let _promise = null

export function useLines() {
  const [lines,   setLines]   = useState(_cache ?? [])
  const [loading, setLoading] = useState(!_cache)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (_cache) { setLines(_cache); setLoading(false); return }
    if (!_promise) {
      _promise = supabase
        .from('fpa_dim_line')
        .select('*')
        .order('statement')
        .order('sort_order')
        .then(({ data, error }) => {
          if (error) throw error
          _cache = data ?? []
          return _cache
        })
    }
    _promise
      .then(data => { setLines(data); setLoading(false) })
      .catch(e  => { setError(e.message); setLoading(false) })
  }, [])

  return { lines, loading, error }
}
