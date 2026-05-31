import { forwardRef } from 'react'

/**
 * Input / Textarea — labeled field with optional hint + validation message.
 */
export const Input = forwardRef(function Input(
  { label, hint, error, className = '', multiline, id, rows = 4, ...props },
  ref,
) {
  const inputId = id || (label ? `field-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined)

  const sharedClass = `w-full rounded-xl border bg-white/90 px-3 py-2.5 text-sm text-zinc-900 shadow-inner shadow-zinc-200/50 outline-none transition placeholder:text-zinc-400 focus:border-violet-500/55 focus:ring-2 focus:ring-violet-500/30 dark:bg-white/[0.06] dark:text-zinc-100 dark:shadow-inner dark:shadow-black/20 dark:placeholder:text-zinc-600 dark:focus:border-violet-400/50 dark:focus:ring-violet-500/35 ${
    error
      ? 'border-rose-400/70 ring-1 ring-rose-500/25 dark:border-rose-400/55'
      : 'border-zinc-200/90 dark:border-white/10'
  } ${className}`

  return (
    <div className="space-y-1.5">
      {label ? (
        <label htmlFor={inputId} className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {label}
        </label>
      ) : null}
      {multiline ? (
        <textarea ref={ref} id={inputId} rows={rows} className={sharedClass} {...props} />
      ) : (
        <input ref={ref} id={inputId} className={sharedClass} {...props} />
      )}
      {error ? (
        <p className="text-xs text-rose-600 dark:text-rose-300" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-zinc-500">{hint}</p>
      ) : null}
    </div>
  )
})
