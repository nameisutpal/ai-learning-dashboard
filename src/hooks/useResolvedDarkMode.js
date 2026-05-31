import { useEffect, useState } from 'react'
import { usePreferences } from '../hooks/usePreferences.js'

/**
 * Resolves `light` / `dark` / `system` into a boolean for chart tooltips and other non-Tailwind UI.
 */
export function useResolvedDarkMode() {
  const { preferences } = usePreferences()
  const [dark, setDark] = useState(true)

  useEffect(() => {
    const run = () => {
      if (preferences.theme === 'dark') setDark(true)
      else if (preferences.theme === 'light') setDark(false)
      else setDark(window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
    run()
    if (preferences.theme !== 'system') return undefined
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    mql.addEventListener('change', run)
    return () => mql.removeEventListener('change', run)
  }, [preferences.theme])

  return dark
}
