const VARIANTS = {
  primary: 'bg-accent text-white hover:opacity-85',
  success: 'bg-accent2 text-black hover:opacity-85',
  warn:    'bg-warn text-black hover:opacity-85',
  danger:  'bg-danger text-white hover:opacity-85',
  ghost:   'bg-transparent border border-border text-muted hover:text-fg hover:border-muted',
}

const SIZES = {
  sm: 'px-2.5 py-1 text-[11px]',
  md: 'px-3.5 py-1.5 text-[12px]',
  lg: 'px-5 py-2 text-[13px]',
}

export function Button({ children, variant = 'primary', size = 'md', className = '', disabled, ...props }) {
  return (
    <button
      disabled={disabled}
      className={[
        'rounded-md font-semibold transition-opacity cursor-pointer border-0 inline-flex items-center gap-1.5 whitespace-nowrap',
        VARIANTS[variant] ?? VARIANTS.primary,
        SIZES[size] ?? SIZES.md,
        disabled ? 'opacity-40 cursor-not-allowed' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
