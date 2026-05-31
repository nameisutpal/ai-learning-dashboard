import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Menu, Search, ChevronDown, LogOut, User } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { useToast } from '../../hooks/useToast.js'

/**
 * Top bar: mobile menu, search, notifications, profile + account menu (Firebase user).
 */
export function Navbar({ onOpenSidebar }) {
  const { user, signOutUser } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Learner'
  const email = user?.email ?? ''
  const photoUrl = user?.photoURL

  const initials = (displayName || 'U')
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  useEffect(() => {
    if (!menuOpen) return undefined
    function handlePointerDown(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [menuOpen])

  async function handleLogout() {
    setMenuOpen(false)
    try {
      await signOutUser()
      showToast('Signed out')
      navigate('/login', { replace: true })
    } catch {
      showToast('Could not sign out. Try again.', 'error')
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200/90 bg-white/80 backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-zinc-950/75">
      <div className="flex items-center gap-3 px-4 py-3 md:px-6">
        <button
          type="button"
          className="inline-flex h-11 min-w-[44px] items-center justify-center rounded-xl border border-zinc-200/90 bg-white/90 text-zinc-700 transition hover:border-violet-400/50 hover:text-violet-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/55 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:border-violet-400/40 dark:hover:bg-white/10 lg:hidden"
          aria-label="Open navigation menu"
          onClick={onOpenSidebar}
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative min-w-0 flex-1 max-w-xl">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
            aria-hidden
          />
          <input
            type="search"
            placeholder="Search courses, notes, topics…"
            className="h-11 w-full rounded-xl border border-zinc-200/90 bg-white/90 py-2 pl-10 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none ring-violet-500/30 transition focus:border-violet-500/50 focus:ring-2 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-violet-400/50"
            aria-label="Search"
          />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 md:gap-3">
          <ThemeToggle />

          <button
            type="button"
            className="relative inline-flex h-11 min-w-[44px] items-center justify-center rounded-xl border border-zinc-200/90 bg-white/90 text-zinc-600 transition hover:border-violet-400/45 hover:text-violet-800 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:border-violet-400/40 dark:hover:text-white"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-violet-500 shadow shadow-violet-500/80 dark:bg-violet-400 dark:shadow-violet-400/80" />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              aria-controls="account-menu"
              id="account-menu-button"
              className="flex min-h-[44px] items-center gap-2 rounded-xl border border-zinc-200/90 bg-white/90 py-1.5 pl-1.5 pr-2 transition hover:border-violet-400/45 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/55 dark:border-white/10 dark:bg-white/5 dark:hover:border-violet-400/40 dark:hover:bg-white/10 md:pr-3"
            >
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt=""
                  className="h-9 w-9 rounded-lg object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 text-xs font-semibold text-white">
                  {initials}
                </span>
              )}
              <span className="hidden min-w-0 flex-col text-left text-sm md:flex">
                <span className="truncate font-medium text-zinc-900 dark:text-zinc-100">{displayName}</span>
                <span className="truncate text-xs text-zinc-500">{email || 'Signed in'}</span>
              </span>
              <ChevronDown className={`hidden h-4 w-4 text-zinc-500 transition md:block ${menuOpen ? 'rotate-180' : ''}`} aria-hidden />
            </button>

            {menuOpen ? (
              <div
                id="account-menu"
                role="menu"
                aria-labelledby="account-menu-button"
                className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-zinc-200/90 bg-white/95 py-1 shadow-xl shadow-black/15 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/95"
              >
                <div className="border-b border-zinc-200/80 px-3 py-2 dark:border-white/10 md:hidden">
                  <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">{displayName}</p>
                  <p className="truncate text-xs text-zinc-500">{email}</p>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-zinc-700 transition hover:bg-violet-500/10 hover:text-violet-900 dark:text-zinc-200 dark:hover:bg-white/5 dark:hover:text-white"
                  onClick={() => {
                    setMenuOpen(false)
                    navigate('/settings')
                  }}
                >
                  <User className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
                  Settings
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-rose-700 transition hover:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/10"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 shrink-0" aria-hidden />
                  Log out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}
