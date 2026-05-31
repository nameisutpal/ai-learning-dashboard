/**
 * Skip navigation link — first focusable control for keyboard users.
 */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="pointer-events-none fixed left-4 top-4 z-[300] -translate-y-24 rounded-xl border border-violet-500/40 bg-white px-4 py-2 text-sm font-medium text-violet-700 opacity-0 shadow-lg transition focus:pointer-events-auto focus:translate-y-0 focus:opacity-100 dark:bg-zinc-900 dark:text-violet-100"
    >
      Skip to main content
    </a>
  )
}
