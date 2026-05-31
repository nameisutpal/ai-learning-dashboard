import { motion } from 'framer-motion'

/**
 * StatCard — analytics-style metric tile (glass + icon + motion reveal).
 *
 * `value` can be a string **or** any React node — pass `<AnimatedCounter />` fragments
 * when you want the “count up” polish on dashboard KPIs.
 */
export function StatCard({ title, value, hint, icon: Icon, motionDelay = 0 }) {
  return (
    <motion.article
      className="group relative overflow-hidden rounded-2xl border border-zinc-200/90 bg-white/75 p-5 shadow-lg shadow-violet-500/10 backdrop-blur-xl transition-[transform,box-shadow,border-color] duration-300 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20"
      aria-label={title}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.45, delay: motionDelay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{
        y: -4,
        borderColor: 'rgba(167, 139, 250, 0.45)',
        boxShadow: '0 18px 36px -14px rgba(139, 92, 246, 0.28)',
      }}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-violet-500/20 blur-2xl transition-opacity duration-300 opacity-0 group-hover:opacity-100 dark:bg-violet-500/25"
        aria-hidden
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{title}</p>
          <div className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl dark:text-white">
            {value}
          </div>
          {hint ? <p className="text-sm text-zinc-600 dark:text-zinc-500">{hint}</p> : null}
        </div>
        {Icon ? (
          <motion.span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-200/80 bg-gradient-to-br from-violet-500/15 to-indigo-500/15 text-violet-700 dark:border-white/10 dark:from-violet-500/25 dark:to-indigo-500/20 dark:text-violet-200"
            whileHover={{ scale: 1.08, rotate: -4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
          >
            <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </motion.span>
        ) : null}
      </div>
    </motion.article>
  )
}
