/**
 * Button — primary actions with loading + disabled states.
 */
const base =
  'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/55 disabled:pointer-events-none disabled:opacity-45'

const variants = {
  primary:
    'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/25 hover:brightness-110 active:brightness-95',
  secondary:
    'border border-zinc-200/90 bg-white/90 text-zinc-800 hover:border-violet-400/50 hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-zinc-100 dark:hover:border-violet-400/45 dark:hover:bg-white/10',
  ghost: 'text-violet-700 hover:bg-violet-500/10 dark:text-violet-200 dark:hover:bg-white/5',
  danger:
    'border border-rose-500/45 bg-rose-500/15 text-rose-800 hover:bg-rose-500/25 dark:text-rose-50 dark:hover:bg-rose-500/25',
}

const sizes = {
  sm: 'h-9 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-sm',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingLabel = 'Saving…',
  className = '',
  disabled,
  ...rest
}) {
  return (
    <button
      className={`${base} ${variants[variant] ?? variants.primary} ${sizes[size] ?? sizes.md} ${
        loading ? 'animate-pulse' : ''
      } ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? loadingLabel : children}
    </button>
  )
}
