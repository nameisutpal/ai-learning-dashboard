import { NavLink, Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

const linkBase =
  'flex w-full min-h-[44px] items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]'
const linkIdle =
  'text-zinc-600 hover:bg-violet-500/10 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-100'
const linkActive =
  'bg-gradient-to-r from-violet-600/25 to-indigo-600/20 text-violet-900 shadow-inner shadow-violet-500/10 ring-1 ring-violet-300/50 dark:from-violet-600/35 dark:to-indigo-600/25 dark:text-white dark:ring-white/10'

/**
 * App sidebar — glass panel with route links (React Router NavLink).
 * Mobile drawer uses GPU-friendly `translate` + backdrop (smooth on low-end phones).
 */
export function Sidebar({ items, mobileOpen, onCloseMobile }) {
  return (
    <>
      <button
        type="button"
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] dark:bg-black/60 lg:hidden ${
          mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-label="Close menu"
        onClick={onCloseMobile}
      />

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-[min(17rem,88vw)] flex-col border-r border-zinc-200/90 bg-white/90 backdrop-blur-xl will-change-transform transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] dark:border-white/10 dark:bg-zinc-950/90 lg:static lg:z-0 lg:w-64 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none lg:pointer-events-auto'
        }`}
        aria-label="Main navigation"
      >
        <Link
          to="/"
          onClick={onCloseMobile}
          className="flex items-center gap-2 border-b border-zinc-200/90 px-5 py-6 transition hover:bg-violet-500/5 dark:border-white/10 dark:hover:bg-white/[0.03]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/25">
            <Sparkles className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">AI Learn</p>
            <p className="truncate text-xs text-zinc-500">Dashboard</p>
          </div>
        </Link>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.path === '/'}
                onClick={() => onCloseMobile?.()}
                className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}
              >
                <Icon className="h-5 w-5 shrink-0 opacity-90" strokeWidth={1.75} aria-hidden />
                <span className="truncate">{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="border-t border-zinc-200/90 p-4 dark:border-white/10">
          <p className="text-xs leading-relaxed text-zinc-500">
            Routes use React Router — swap placeholders for real features anytime.
          </p>
        </div>
      </aside>
    </>
  )
}
