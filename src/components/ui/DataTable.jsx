/** Generic styled table used across all financial tabs */
export function DataTable({ columns, rows, className = '' }) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border-collapse text-[12px]">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`bg-surface2 px-3 py-2 text-left text-[11px] text-muted font-semibold border-b border-border whitespace-nowrap ${col.align === 'right' ? 'text-right' : ''}`}
                style={col.width ? { width: col.width } : {}}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={`border-b border-[#1e2235] last:border-0 hover:bg-white/[0.02] ${row._rowClass ?? ''}`}>
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-3 py-1.5 align-middle ${col.align === 'right' ? 'text-right font-mono' : ''} ${row._cellClass?.[col.key] ?? ''}`}
                >
                  {row[col.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Tag badge for line types (Input / Derived / Total / Statistical) */
export function TypeTag({ type }) {
  const styles = {
    I: 'bg-accent     text-white',
    D: 'bg-accent2    text-black',
    T: 'bg-accent3    text-white',
    S: 'bg-accent4    text-white',
    A: 'bg-[#a78bfa]  text-white',
  }
  return (
    <span className={`inline-block px-1.5 py-px rounded text-[10px] font-bold ${styles[type] ?? styles.I}`}>
      {type}
    </span>
  )
}
