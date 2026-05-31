import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'

/**
 * Premium welcome hero — gradient text, ambient glows, and two CTAs.
 */
export function DashboardHero({ userName = 'there', tagline }) {
  return (
    <motion.section
      className="relative overflow-hidden rounded-3xl border border-zinc-200/90 bg-white/75 p-6 shadow-2xl shadow-violet-500/20 backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.045] dark:shadow-violet-950/40 md:p-10"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl dark:bg-violet-600/30"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl dark:bg-indigo-600/25"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-[120%] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-fuchsia-500/10 to-transparent blur-2xl dark:via-fuchsia-500/10"
        aria-hidden
      />

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl space-y-4">
          <motion.p
            className="inline-flex items-center gap-2 rounded-full border border-violet-300/50 bg-violet-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-violet-800 dark:border-violet-400/25 dark:text-violet-200/95"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12, duration: 0.4 }}
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Live workspace
          </motion.p>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl lg:text-[2.65rem] lg:leading-tight dark:text-white">
              Welcome back,{' '}
              <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 bg-clip-text text-transparent dark:from-violet-200 dark:via-fuchsia-200 dark:to-indigo-200">
                {userName}
              </span>
            </h1>
            <p className="text-sm leading-relaxed text-zinc-600 sm:text-base dark:text-zinc-400">
              {tagline ??
                'Your AI learning cockpit — track focus time, course momentum, and assistant usage in one polished surface.'}
            </p>
          </div>
        </div>

        <motion.div
          className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.45 }}
        >
          <Link
            to="/courses"
            className="group inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition hover:brightness-110"
          >
            Continue learning
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
          </Link>
          <Link
            to="/assistant"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-zinc-200/90 bg-white/90 px-5 py-3 text-sm font-semibold text-zinc-800 backdrop-blur-md transition hover:border-violet-400/50 hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-zinc-100 dark:hover:border-violet-400/40 dark:hover:bg-white/10"
          >
            <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-300" aria-hidden />
            Ask AI
          </Link>
        </motion.div>
      </div>
    </motion.section>
  )
}
