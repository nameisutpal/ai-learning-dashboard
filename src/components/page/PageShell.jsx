/**
 * Shared wrapper for secondary pages — matches the dashboard glass / neon look in both themes.
 */
export function PageShell({ icon: Icon, title, description, highlights = [], children = null }) {
  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-10">
      <section className="relative overflow-hidden rounded-3xl border border-zinc-200/90 bg-white/75 p-6 shadow-xl shadow-violet-500/15 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/30 md:p-8">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-violet-500/15 blur-3xl dark:bg-violet-600/20"
          aria-hidden
        />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-zinc-200/80 bg-gradient-to-br from-violet-500/25 to-indigo-600/20 text-violet-700 shadow-lg shadow-violet-500/20 dark:border-white/10 dark:from-violet-500/30 dark:to-indigo-600/25 dark:text-violet-100 dark:shadow-violet-900/30">
              {Icon ? <Icon className="h-7 w-7" strokeWidth={1.6} aria-hidden /> : null}
            </span>
            <div className="min-w-0 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-violet-700/90 dark:text-violet-300/90">
                Workspace
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl dark:text-white">{title}</h1>
              <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 md:text-base dark:text-zinc-400">
                {description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {highlights.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
          {highlights.map((item) => (
            <li
              key={item.title}
              className="rounded-2xl border border-zinc-200/90 bg-white/70 p-5 shadow-lg shadow-violet-500/10 backdrop-blur-xl transition duration-300 hover:border-violet-400/40 hover:bg-white/90 dark:border-white/10 dark:bg-white/[0.03] dark:shadow-black/20 dark:hover:border-violet-400/30 dark:hover:bg-white/[0.06]"
            >
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">{item.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-500">{item.text}</p>
            </li>
          ))}
        </ul>
      ) : null}

      {children}
    </div>
  )
}
