import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { fmt, MONTHS } from '@/lib/constants'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const KPI_DEF = [
  { id: 'REV_TOTAL',  label: 'Revenue',          icon: '💰', unit: 'J$M', color: '#6c7bff' },
  { id: 'EBITDA',     label: 'EBITDA',            icon: '📈', unit: 'J$M', color: '#4ade80' },
  { id: 'NETINC',     label: 'Net Income',        icon: '🏆', unit: 'J$M', color: '#fb923c' },
  { id: 'BILLED_GWH', label: 'Billed Sales',      icon: '⚡', unit: 'GWh', color: '#f472b6' },
]

function KpiCard({ label, icon, value, unit, trend, color }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">{icon}</span>
        <span className="text-[11px] text-muted font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white mb-1">
        {value != null ? fmt(value / 1e6) : '—'}
        <span className="text-[13px] text-muted font-normal ml-1">{unit}</span>
      </div>
      {trend != null && (
        <div className={`text-[11px] font-semibold ${trend >= 0 ? 'text-accent2' : 'text-danger'}`}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}% vs prior year
        </div>
      )}
    </div>
  )
}

const TOOLTIP_STYLE = {
  backgroundColor: '#1a1d27',
  border: '1px solid #2d3248',
  borderRadius: 8,
  fontSize: 12,
  color: '#e2e8f0',
}

export default function Dashboard() {
  const { activeVersionId } = useAppStore()
  const [kpis,       setKpis]       = useState({})
  const [chartData,  setChartData]  = useState([])
  const [loading,    setLoading]    = useState(false)
  const [year,       setYear]       = useState(new Date().getFullYear())

  useEffect(() => {
    if (!activeVersionId) return
    fetchData()
  }, [activeVersionId, year])

  async function fetchData() {
    setLoading(true)
    try {
      // Get periods for this year
      const { data: periods } = await supabase
        .from('fpa_dim_period')
        .select('id, month_num, month_name')
        .eq('fiscal_year', year)
        .order('month_num')

      if (!periods?.length) { setLoading(false); return }
      const pids = periods.map(p => p.id)

      // Get facts
      const { data: facts } = await supabase
        .from('fpa_facts')
        .select('period_id, line_id, value')
        .eq('version_id', activeVersionId)
        .in('period_id', pids)

      // Index by period+line
      const idx = {}
      facts?.forEach(f => {
        if (!idx[f.period_id]) idx[f.period_id] = {}
        idx[f.period_id][f.line_id] = f.value
      })

      // Build KPIs (YTD sum)
      const kpiMap = {}
      KPI_DEF.forEach(k => { kpiMap[k.id] = 0 })
      Object.values(idx).forEach(m => {
        KPI_DEF.forEach(k => { kpiMap[k.id] += (m[k.id] ?? 0) })
      })
      setKpis(kpiMap)

      // Build chart data
      const chart = periods.map(p => {
        const m = idx[p.id] ?? {}
        return {
          name: p.month_name ?? MONTHS[(p.month_num ?? 1) - 1],
          Revenue:    (m['REV_TOTAL']  ?? 0) / 1e6,
          EBITDA:     (m['EBITDA']     ?? 0) / 1e6,
          NetIncome:  (m['NETINC']     ?? 0) / 1e6,
          GWh:        (m['BILLED_GWH'] ?? 0),
        }
      })
      setChartData(chart)
    } finally {
      setLoading(false)
    }
  }

  if (!activeVersionId) {
    return (
      <div className="flex items-center justify-center h-full text-muted text-sm">
        Select a version from the header to view the dashboard.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {KPI_DEF.map(k => (
          <KpiCard
            key={k.id}
            label={k.label}
            icon={k.icon}
            unit={k.unit}
            value={kpis[k.id]}
            color={k.color}
          />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader icon="💰" title="Revenue vs EBITDA" description={`Monthly — ${year}`} />
          <CardBody>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3248" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [fmt(v) + ' J$M']} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                <Bar dataKey="Revenue"   fill="#6c7bff" radius={[4,4,0,0]} />
                <Bar dataKey="EBITDA"    fill="#4ade80" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader icon="⚡" title="Billed Sales (GWh)" description={`Monthly — ${year}`} />
          <CardBody>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="gwh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f472b6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f472b6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3248" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [fmt(v) + ' GWh']} />
                <Area type="monotone" dataKey="GWh" stroke="#f472b6" fill="url(#gwh)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Net Income trend */}
      <Card>
        <CardHeader icon="🏆" title="Net Income Trend" description={`Monthly — ${year}`} />
        <CardBody>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3248" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [fmt(v) + ' J$M']} />
              <Line type="monotone" dataKey="NetIncome" stroke="#fb923c" strokeWidth={2} dot={{ fill: '#fb923c', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>
    </div>
  )
}
