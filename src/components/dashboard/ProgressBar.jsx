import { motion } from 'framer-motion'

/**
 * ProgressBar — labeled bar with animated fill when scrolled into view.
 */
export function ProgressBar({ label, percent, hint, barClassName }) {
  const safe = Math.max(0, Math.min(100, Number(percent) || 0))
  const fillClass =
    barClassName ??
    'bg-gradient-to-r from-violet-500 via-fuchsia-500/90 to-indigo-400 shadow-[0_0_20px_-4px_rgba(167,139,250,0.55)]'

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="truncate font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
        {hint ? <span className="shrink-0 tabular-nums text-zinc-500">{hint}</span> : null}
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-zinc-200/90 ring-1 ring-zinc-300/40 dark:bg-zinc-800/90 dark:ring-white/5"
        role="progressbar"
        aria-valuenow={safe}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <motion.div
          className={`h-full rounded-full ${fillClass}`}
          initial={{ width: 0 }}
          whileInView={{ width: `${safe}%` }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  )
}
