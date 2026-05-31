import { Moon, Sun, Monitor } from 'lucide-react'
import { usePreferences } from '../../hooks/usePreferences.js'

const cycle = { light: 'dark', dark: 'system', system: 'light' }

const icons = { light: Sun, dark: Moon, system: Monitor }

/**
 * Cycles light → dark → system — state persists via PreferencesContext / LocalStorage.
 */
export function ThemeToggle({ className = '' }) {
  const { preferences, setPreference } = usePreferences()
  const theme = preferences.theme
  const Icon = icons[theme] ?? Moon

  return (
    <button
      type="button"
      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200/90 bg-white/90 text-zinc-700 shadow-sm transition hover:border-violet-400/50 hover:text-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/55 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:border-violet-400/40 dark:hover:text-white ${className}`.trim()}
      aria-label={`Theme: ${theme}. Click to switch.`}
      onClick={() => setPreference('theme', cycle[theme] ?? 'dark')}
    >
      <Icon className="h-5 w-5" aria-hidden />
    </button>
  )
}
