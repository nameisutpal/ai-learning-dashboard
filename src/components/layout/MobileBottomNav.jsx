import { NavLink } from 'react-router-dom'
import { navItems } from '../../data/navItems.js'

const MOBILE_IDS = new Set(['dashboard', 'tracker', 'tasks', 'settings'])

/**
 * Bottom tab bar on small screens — keeps core flows reachable with the thumb.
 * Desktop navigation stays in the sidebar (`lg:hidden` on this component).
 */
export function MobileBottomNav() {
  const items = navItems.filter((item) => MOBILE_IDS.has(item.id))

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200/90 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/90 lg:hidden"
      aria-label="Mobile primary"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around gap-1 px-2 pt-2">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.id} className="flex-1">
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex min-h-[48px] flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 text-[11px] font-medium transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/55 ${
                    isActive
                      ? 'text-violet-700 dark:text-violet-200'
                      : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100'
                  }`
                }
              >
                <Icon className="h-5 w-5 shrink-0 opacity-90" strokeWidth={1.75} aria-hidden />
                <span className="truncate">{item.label.split(' ')[0]}</span>
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
