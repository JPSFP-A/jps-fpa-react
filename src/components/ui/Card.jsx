export function Card({ children, className = '' }) {
  return (
    <div className={`bg-surface border border-border rounded-xl ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ icon, title, description, children }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
      {icon && <span className="text-lg">{icon}</span>}
      <div className="flex-1 min-w-0">
        <h2 className="text-sm font-bold text-white">{title}</h2>
        {description && <p className="text-[11px] text-muted mt-0.5">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-2 ml-auto">{children}</div>}
    </div>
  )
}

export function CardBody({ children, className = '' }) {
  return <div className={`p-4 ${className}`}>{children}</div>
}
