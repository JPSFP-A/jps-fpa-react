import { useState, useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useLines }    from '@/hooks/useLines'
import { useFacts }    from '@/hooks/useFacts'

/* ─── helpers ──────────────────────────────────────────── */
const sum = (arr) => arr.reduce((a, v) => a + (v ?? 0), 0)
const neg = (arr)  => arr.map(v => -(Math.abs(v ?? 0)))
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

/* ─── IS builder — pure fn ─────────────────────────────── */
function buildISRows(monthly) {
  const rows = []
  const sec  = (label)        => rows.push({ _type: 'section', label })
  const row  = (label, vals, opts = {}) =>
    rows.push({ _type: 'row', label, vals: vals.map(v => v ?? 0), ...opts })
  const der  = (label, fn, opts = {}) =>
    rows.push({ _type: 'row', label, vals: Array.from({ length: 12 }, (_, m) => fn(m)), derived: true, ...opts })
  const div  = ()             => rows.push({ _type: 'divider' })

  const get  = (id)           => Array.from({ length: 12 }, (_, i) => monthly(id)[i] ?? 0)

  // ── Regulated Business ───────────────────────────────────
  sec('Regulated Business')
  const fuelRev  = get('fuel_rev')
  const fuelCost = neg(get('fuel_cost'))
  row('Fuel Revenue',             fuelRev,  { color: '#4ade80' })
  row('Fuel Costs',               fuelCost, { color: '#f87171' })
  der('Fuel Surplus / (Penalty)', (m) => fuelRev[m] + fuelCost[m], { sub: true })

  const nfRev   = get('nonfuel')
  const otherOp = get('other_r')
  const opex    = neg(get('opex'))
  row('Non-Fuel Revenue',         nfRev,   { color: '#6c7bff' })
  row('Other Operating Revenue',  otherOp)
  row('Operating Expense (O&M)',  opex,    { color: '#f87171' })

  const regEb = Array.from({ length: 12 }, (_, m) =>
    fuelRev[m] + fuelCost[m] + nfRev[m] + otherOp[m] + opex[m])
  rows.push({ _type: 'row', label: 'Regulated EBITDA', vals: regEb, sub: true, bold: true, color: '#facc15' })

  // ── Purchased Power ──────────────────────────────────────
  sec('Purchased Power')
  const ippFR   = get('ipp_fr')
  const ippNR   = get('ipp_nr')
  const ippCost = neg(get('ipp_cost'))
  row('IPP Fuel Revenue',      ippFR,   { color: '#4ade80' })
  row('IPP Non-Fuel Revenue',  ippNR,   { color: '#4ade80' })
  row('Fuel & IPP Costs',      ippCost, { color: '#f87171' })
  der('PP Contribution', (m) => ippFR[m] + ippNR[m] + ippCost[m],
    { sub: true, bold: true, color: '#facc15' })

  // ── Non-Regulated ────────────────────────────────────────
  sec('Non-Regulated Business')
  const nrRev  = get('nr_rev')
  const nrCost = neg(get('nr_cost'))
  row('Non-Regulated Revenue', nrRev,  { color: '#4ade80' })
  row('Non-Regulated Costs',   nrCost, { color: '#f87171' })
  der('Non-Reg Contribution', (m) => nrRev[m] + nrCost[m],
    { sub: true, bold: true, color: '#facc15' })

  // ── TOTAL EBITDA ─────────────────────────────────────────
  div()
  const ppCon = rows.find(r => r.label === 'PP Contribution')?.vals   ?? Array(12).fill(0)
  const nrCon = rows.find(r => r.label === 'Non-Reg Contribution')?.vals ?? Array(12).fill(0)
  const ebitda = Array.from({ length: 12 }, (_, m) => regEb[m] + ppCon[m] + nrCon[m])
  rows.push({ _type: 'row', label: 'TOTAL EBITDA', vals: ebitda, tot: true, bold: true, color: '#facc15' })

  // ── Below EBITDA ─────────────────────────────────────────
  sec('Below EBITDA')
  const depn = neg(get('depn'))
  const imp  = neg(get('impairment'))
  row('Depreciation (IAS 16)', depn, { color: '#94a3b8' })
  row('Impairment (IAS 36)',   imp,  { color: '#fb923c' })
  const ebit = Array.from({ length: 12 }, (_, m) => ebitda[m] + depn[m] + imp[m])
  rows.push({ _type: 'row', label: 'Operating Income (EBIT)', vals: ebit, sub: true, bold: true })

  // ── Net Financing Costs ──────────────────────────────────
  sec('Net Financing Costs')
  const intInc  = get('nfc_int_inc')
  const intExp  = neg(get('nfc_int_exp'))
  const lnFees  = neg(get('nfc_fees'))
  const lsInt   = neg(get('nfc_lease'))
  const prefDiv = neg(get('nfc_pref'))
  row('Interest Income',          intInc,  { color: '#4ade80' })
  row('Interest Expense',         intExp,  { color: '#f87171' })
  row('Loan Financing Fees',      lnFees,  { color: '#f87171' })
  row('Lease Interest (IFRS 16)', lsInt,   { color: '#f472b6', derived: true })
  row('Preference Dividends',     prefDiv, { color: '#94a3b8' })
  const nfcVals = Array.from({ length: 12 }, (_, m) =>
    intInc[m] + intExp[m] + lnFees[m] + lsInt[m] + prefDiv[m])
  rows.push({ _type: 'row', label: 'Total Net Financing Costs', vals: nfcVals,
    sub: true, bold: true, derived: true, color: '#facc15' })
  der('Operating Profit After NFC', (m) => ebit[m] + nfcVals[m], { sub: true, bold: true })

  // ── Other Income ─────────────────────────────────────────
  sec('Other Income / Expense — Taxable')
  const othTax = get('oth_tax')
  row('Other Income (Taxable)', othTax)
  der('Subtotal Taxable', (m) => othTax[m], { sub: true })

  sec('Other Income / Expense — Non-Taxable')
  const othNTax = get('oth_ntax')
  row('Other Income (Non-Taxable)', othNTax)
  der('Subtotal Non-Taxable', (m) => othNTax[m], { sub: true })

  // ── NPBT / Tax / NPAT ────────────────────────────────────
  div()
  const opAfNFC = rows.find(r => r.label === 'Operating Profit After NFC')?.vals ?? Array(12).fill(0)
  const npbt    = Array.from({ length: 12 }, (_, m) => opAfNFC[m] + othTax[m] + othNTax[m])
  rows.push({ _type: 'row', label: 'Net Profit Before Tax', vals: npbt, tot: true, bold: true })
  const taxVals = npbt.map(v => -Math.round(v * 0.3333))
  row('Income Tax', taxVals, { color: '#f87171' })
  const npat = Array.from({ length: 12 }, (_, m) => npbt[m] + taxVals[m])
  rows.push({ _type: 'row', label: 'Net Profit After Tax', vals: npat, tot: true, bold: true, color: '#facc15' })

  return rows
}

/* ─── Number cell ───────────────────────────────────────── */
function Num({ v, color, bold, tot }) {
  if (v == null) return <td className="text-right px-2 py-1 text-[11px] text-muted/40 w-[58px]">—</td>
  const rounded = Math.round(v)
  const isNeg   = rounded < 0
  return (
    <td
      className={`text-right px-2 py-1 text-[11px] tabular-nums w-[58px] ${bold || tot ? 'font-bold' : ''}`}
      style={{ color: color ?? '#e2e8f0' }}
    >
      {rounded === 0
        ? <span className="text-white/20">—</span>
        : isNeg
        ? <span className="text-red-400/80">({Math.abs(rounded).toLocaleString()})</span>
        : rounded.toLocaleString()
      }
    </td>
  )
}

/* ─── Variance cell ─────────────────────────────────────── */
function VarNum({ act, bud }) {
  const diff = (act ?? 0) - (bud ?? 0)
  const rd   = Math.round(diff)
  return (
    <td className="text-right px-2 py-1 text-[11px] tabular-nums w-[70px] font-semibold">
      {rd === 0
        ? <span className="text-white/20">—</span>
        : rd > 0
        ? <span className="text-accent2">+{rd.toLocaleString()}</span>
        : <span className="text-danger">({Math.abs(rd).toLocaleString()})</span>}
    </td>
  )
}

/* ─── KPI bar ───────────────────────────────────────────── */
function KpiBar({ rows }) {
  const find = (label) => rows.find(r => r.label === label)?.vals ?? Array(12).fill(0)
  const kpis = [
    { label: 'Non-Fuel Revenue',     color: '#6c7bff' },
    { label: 'TOTAL EBITDA',         color: '#facc15' },
    { label: 'Operating Income (EBIT)', color: '#fb923c' },
    { label: 'Net Profit After Tax', color: '#4ade80' },
  ]
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {kpis.map(({ label, color }) => {
        const total = sum(find(label))
        const neg   = total < 0
        return (
          <div key={label} className="bg-surface border border-border rounded-xl px-4 py-3">
            <div className="text-[10px] text-muted uppercase tracking-wide font-semibold mb-1 truncate">{label}</div>
            <div className="text-xl font-bold tabular-nums" style={{ color: neg ? '#f87171' : color }}>
              {neg
                ? `(${Math.abs(Math.round(total)).toLocaleString()})`
                : Math.round(total).toLocaleString()}
            </div>
            <div className="text-[10px] text-muted mt-0.5">USD $'000 · Annual</div>
          </div>
        )
      })}
    </div>
  )
}

/* ─── Main component ────────────────────────────────────── */
export default function IncomeStatement() {
  const { activeVersionId, versions } = useAppStore()
  const [year,     setYear]     = useState(new Date().getFullYear())
  const [mode,     setMode]     = useState('single')   // single | both | variance
  const [budVerId, setBudVerId] = useState('')

  const { monthly, periods, loading: factsLoading } = useFacts(activeVersionId, year)
  const { monthly: budMonthly, loading: budLoading } = useFacts(budVerId || null, year)

  const budVersions = versions.filter(v =>
    ['BUDGET','LE1','LE2','LE3'].includes(v.version_type) &&
    v.fiscal_year === year &&
    v.id !== activeVersionId
  )

  const isRows = useMemo(
    () => (activeVersionId ? buildISRows(monthly) : []),
    [monthly, activeVersionId]
  )

  const loading = factsLoading || budLoading
  const closedCount = periods.filter(p => p.is_closed).length
  const totalCols   = 1 + 12 + (mode === 'single' ? 1 : 2)

  if (!activeVersionId) {
    return (
      <div className="flex items-center justify-center h-64 text-muted text-sm">
        Select a version from the header to view the Income Statement.
      </div>
    )
  }

  return (
    <div className="space-y-3">

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-3 bg-surface border border-border rounded-xl px-4 py-2.5">
        {/* Year pills */}
        <div className="flex items-center gap-1.5">
          {[2024, 2025, 2026, 2027, 2028].map(y => (
            <button
              key={y}
              onClick={() => setYear(y)}
              className={`px-2.5 py-0.5 rounded text-[11px] font-semibold cursor-pointer border-0 transition-all ${
                year === y ? 'bg-accent text-white' : 'bg-surface2 text-muted hover:text-fg'
              }`}
            >
              {y}
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-border" />

        {/* View mode */}
        <div className="flex items-center gap-1.5">
          {[['single','LE Only'],['both','LE + Budget'],['variance','Variance']].map(([v, lbl]) => (
            <button
              key={v}
              onClick={() => setMode(v)}
              className={`px-2.5 py-0.5 rounded text-[11px] font-semibold cursor-pointer border-0 transition-all ${
                mode === v
                  ? 'bg-surface2 text-accent ring-1 ring-accent'
                  : 'bg-surface2 text-muted hover:text-fg'
              }`}
            >
              {lbl}
            </button>
          ))}
        </div>

        {/* Comparison version (shown in both/variance modes) */}
        {mode !== 'single' && (
          <>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted">vs:</span>
              <select
                value={budVerId}
                onChange={e => setBudVerId(e.target.value)}
                className="bg-surface2 border border-border text-fg text-[11px] px-2 py-1 rounded-md outline-none"
              >
                <option value="">— select —</option>
                {budVersions.map(v => (
                  <option key={v.id} value={v.id}>{v.version_label}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Period status + loader */}
        <div className="ml-auto flex items-center gap-2">
          <div className="flex gap-0.5" title={`${closedCount} of 12 months closed`}>
            {Array.from({ length: 12 }, (_, i) => {
              const p = periods[i]
              return (
                <div
                  key={i}
                  title={p ? `${p.month_name} — ${p.is_closed ? 'Closed' : 'Open'}` : ''}
                  className={`w-2 h-2 rounded-full ${p?.is_closed ? 'bg-accent2' : 'bg-border'}`}
                />
              )
            })}
          </div>
          <span className="text-[10px] text-muted">{closedCount}/12 closed</span>
          {loading && <span className="text-[11px] text-accent animate-pulse ml-1">Loading…</span>}
        </div>
      </div>

      {/* ── KPI bar ── */}
      {isRows.length > 0 && <KpiBar rows={isRows} />}

      {/* ── Main table ── */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: 960 }}>
            {/* Header */}
            <thead>
              <tr className="bg-surface2">
                <th className="sticky left-0 bg-surface2 px-3 py-2 text-left text-[11px] text-muted font-semibold border-b border-border"
                    style={{ minWidth: 210, maxWidth: 210 }}>
                  Line Item
                </th>
                {MONTHS_SHORT.map(m => (
                  <th key={m} className="text-right px-2 py-2 text-[10px] text-muted font-semibold border-b border-border w-[58px]">
                    {m}
                  </th>
                ))}
                <th className="text-right px-2 py-2 text-[10px] text-accent font-bold border-b border-border w-[72px]">
                  Annual
                </th>
                {mode === 'both' && (
                  <th className="text-right px-2 py-2 text-[10px] text-accent/50 font-semibold border-b border-border w-[72px]">
                    Bud Ann
                  </th>
                )}
                {mode === 'variance' && (
                  <th className="text-right px-2 py-2 text-[10px] text-warn font-semibold border-b border-border w-[72px]">
                    Var $'000
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {/* Empty state */}
              {isRows.length === 0 && !loading && (
                <tr>
                  <td colSpan={totalCols} className="text-center py-16 text-muted text-sm">
                    No data for {year}. Check the selected version or upload actuals.
                  </td>
                </tr>
              )}

              {isRows.map((row, i) => {
                // Divider
                if (row._type === 'divider') {
                  return (
                    <tr key={i}>
                      <td colSpan={totalCols} className="h-px bg-border" />
                    </tr>
                  )
                }
                // Section header
                if (row._type === 'section') {
                  if (!row.label) return null
                  return (
                    <tr key={i} className="bg-surface2">
                      <td
                        colSpan={totalCols}
                        className="sticky left-0 bg-surface2 px-4 py-1 text-[10px] font-bold text-muted uppercase tracking-widest"
                      >
                        {row.label}
                      </td>
                    </tr>
                  )
                }

                // Data row
                const bgColor = row.tot ? '#22263a' : row.sub ? '#1e2235' : '#1a1d27'
                const lColor  = row.color ?? '#94a3b8'
                const annVal  = sum(row.vals)
                const annBud  = budVerId
                  ? sum(Array.from({ length: 12 }, (_, m) => budMonthly(row._lineId ?? '')[m] ?? 0))
                  : null

                return (
                  <tr key={i} className={`border-b border-[#1e2235] ${!row.tot && !row.sub ? 'hover:bg-white/[0.015]' : ''}`}>
                    {/* Label */}
                    <td
                      className="sticky left-0 px-3 py-1.5 text-[11px] whitespace-nowrap"
                      style={{
                        backgroundColor: bgColor,
                        color: lColor,
                        paddingLeft: row.tot || row.sub ? 12 : 24,
                        fontStyle: row.italic ? 'italic' : 'normal',
                        fontWeight: row.bold || row.tot ? 700 : 'normal',
                        minWidth: 210, maxWidth: 210,
                      }}
                    >
                      {row.label}
                      {row.derived && (
                        <span className="ml-1 text-[8px] text-accent2 opacity-60">⇐</span>
                      )}
                    </td>

                    {/* Monthly values */}
                    {MONTHS_SHORT.map((_, mi) => {
                      const v    = row.vals[mi] ?? 0
                      const budV = budVerId
                        ? (budMonthly(row._lineId ?? '')[mi] ?? 0)
                        : null

                      if (mode === 'variance' && budV != null) {
                        return <VarNum key={mi} act={v} bud={budV} />
                      }
                      return <Num key={mi} v={v} color={lColor} bold={row.bold} tot={row.tot} />
                    })}

                    {/* Annual */}
                    {mode === 'variance'
                      ? <VarNum act={annVal} bud={annBud} />
                      : <Num v={annVal} color={lColor} bold={true} tot={row.tot} />
                    }
                    {mode === 'both' && (
                      <Num v={annBud} color="#6c7bff80" bold={true} />
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-border flex items-center gap-4 text-[10px] text-muted flex-wrap">
          <span>All values USD $'000</span>
          <span>Negatives shown as (n)</span>
          <span className="text-accent2">⇐ Derived / calculated</span>
          <span className="ml-auto">
            {versions.find(v => v.id === activeVersionId)?.version_label ?? '—'} · FY{year}
          </span>
        </div>
      </div>
    </div>
  )
}
