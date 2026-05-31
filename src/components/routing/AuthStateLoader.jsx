import { Loader2 } from 'lucide-react'

/** Full-screen blocker while Firebase reports the initial session (prevents auth route flicker). */
export function AuthStateLoader() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 px-4 dark:bg-dashboard-bg"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Checking sign-in status"
    >
      <Loader2 className="h-10 w-10 animate-spin text-violet-600 dark:text-violet-400" aria-hidden />
      <p className="text-sm text-zinc-600 dark:text-zinc-400">Checking your session…</p>
    </div>
  )
}
