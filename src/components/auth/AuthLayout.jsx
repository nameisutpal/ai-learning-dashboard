import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

/**
 * Shared chrome for Login / Signup — keeps the neon glass SaaS look outside the dashboard shell.
 */
export function AuthLayout({ children, footer }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10">
      <div
        className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-violet-500/25 blur-3xl dark:bg-violet-600/30"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl dark:bg-indigo-600/25"
        aria-hidden
      />

      <Link
        to="/login"
        className="mb-8 flex items-center gap-2 rounded-2xl border border-zinc-200/80 bg-white/80 px-4 py-2 text-sm font-semibold text-zinc-900 shadow-lg shadow-violet-500/10 backdrop-blur-xl transition hover:border-violet-400/50 dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:hover:border-violet-400/40"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/30">
          <Sparkles className="h-4 w-4" aria-hidden />
        </span>
        AI Learn
      </Link>

      <div className="relative w-full max-w-md">{children}</div>

      {footer ? <div className="relative mt-8 text-center text-sm text-zinc-500">{footer}</div> : null}
    </div>
  )
}
