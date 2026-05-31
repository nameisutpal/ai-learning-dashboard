import { Loader2 } from 'lucide-react'

/**
 * Full-route Suspense fallback — shown while `React.lazy` chunks download.
 * Shown briefly on fast networks; still worth a polished shell for interviews.
 */
export function PageLoader() {
  return (
    <div
      className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading page"
    >
      <Loader2 className="h-10 w-10 animate-spin text-violet-500 dark:text-violet-400" aria-hidden />
      <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading module…</p>
    </div>
  )
}
