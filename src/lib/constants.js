export const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
export const MO_KEYS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']

export const CURRENCY_FMT = new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
export const INT_FMT      = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })
export const PCT_FMT      = new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

export const fmt = (v, decimals = 1) =>
  v == null || isNaN(v) ? '—' : Number(v).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })

export const VERSION_TYPES = ['ACTUAL','BUDGET','LE1','LE2','LE3']

export const NAV_ITEMS = [
  { id: 'dash',    label: 'Dashboard',        icon: '📊', group: 'Overview' },
  { id: 'flash',   label: 'Flash Report',     icon: '⚡', group: 'Overview' },
  { id: 'is',      label: 'Income Statement', icon: '📋', group: 'Financials' },
  { id: 'bs',      label: 'Balance Sheet',    icon: '🏦', group: 'Financials' },
  { id: 'cf',      label: 'Cash Flow',        icon: '💸', group: 'Financials' },
  { id: 'ratios',  label: 'Ratios',           icon: '📐', group: 'Financials' },
  { id: 'debt',    label: 'Debt Schedule',    icon: '🏛️', group: 'Financials' },
  { id: 'budget',  label: 'Budget / LE',      icon: '🎯', group: 'Planning' },
  { id: 'capex',   label: 'CapEx',            icon: '🏗️', group: 'Planning' },
  { id: 'upload',  label: 'Data Upload',      icon: '⬆️', group: 'Data' },
  { id: 'adm',     label: 'Data Management',  icon: '🗄️', group: 'Data' },
]
