import { motion } from 'framer-motion'

function EmptyIllustration() {
  return (
    <svg
      viewBox="0 0 120 100"
      className="mx-auto h-24 w-32 text-violet-400/90 dark:text-violet-500/80"
      aria-hidden
    >
      <defs>
        <linearGradient id="empty-neon" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.75" />
        </linearGradient>
      </defs>
      <rect x="8" y="12" width="104" height="72" rx="14" fill="url(#empty-neon)" opacity="0.12" />
      <rect x="16" y="22" width="56" height="8" rx="4" fill="currentColor" opacity="0.35" />
      <rect x="16" y="36" width="88" height="6" rx="3" fill="currentColor" opacity="0.2" />
      <rect x="16" y="48" width="72" height="6" rx="3" fill="currentColor" opacity="0.2" />
      <circle cx="88" cy="68" r="14" fill="currentColor" opacity="0.25" />
      <path
        d="M82 68 L86 72 L96 60"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
    </svg>
  )
}

/**
 * EmptyState — friendly placeholder when lists have no rows yet.
 */
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-violet-300/60 bg-gradient-to-b from-violet-50/80 to-white/60 px-6 py-12 text-center dark:border-white/15 dark:from-violet-500/5 dark:to-white/[0.02]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      role="status"
    >
      <EmptyIllustration />
      {Icon ? (
        <Icon className="mx-auto mt-3 h-8 w-8 text-violet-600 dark:text-violet-400/90" strokeWidth={1.25} aria-hidden />
      ) : null}
      <p className="mt-4 text-base font-semibold text-zinc-900 dark:text-white">{title}</p>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-600 dark:text-zinc-500">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </motion.div>
  )
}
