import { useCallback, useEffect, useMemo, useState } from 'react'
import { DEFAULT_USER_PREFERENCES } from '../constants/userPreferences.js'
import { LS_KEYS } from '../constants/storageKeys.js'
import { LS_EVENT } from '../lib/storage.js'
import { readUserPreferences, writeUserPreferences } from '../lib/preferences.js'
import { PreferencesContext } from './preferencesContext.js'

/**
 * PreferencesProvider — theme, goals, density, and notification toggles in one place.
 *
 * Why a Context instead of many `useLocalStorage` calls?
 * - One write path keeps related settings consistent (export/import, migrations).
 * - Theme needs to touch the DOM (`<html class="dark">`) — doing that in one `useEffect`
 *   avoids multiple components fighting over `document.documentElement`.
 * - Child routes can read preferences without prop-drilling through the layout.
 *
 * Consumer hook: `usePreferences` from `src/hooks/usePreferences.js`.
 */
function getSystemDark() {
  if (typeof window === 'undefined') return true
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/** Applies Tailwind’s class-based dark mode + `color-scheme` for native controls (scrollbars, inputs). */
function applyThemeToDocument(theme) {
  const resolved = theme === 'system' ? (getSystemDark() ? 'dark' : 'light') : theme
  const root = document.documentElement
  root.classList.toggle('dark', resolved === 'dark')
  root.style.colorScheme = resolved === 'dark' ? 'dark' : 'light'
}

export function PreferencesProvider({ children }) {
  const [preferences, setPreferencesState] = useState(() => readUserPreferences())

  const setPreferences = useCallback((updater) => {
    setPreferencesState((prev) => {
      const patch = typeof updater === 'function' ? updater(prev) : updater
      const merged = { ...prev, ...patch }
      if (patch.notifications) {
        merged.notifications = { ...prev.notifications, ...patch.notifications }
      }
      writeUserPreferences(merged)
      return readUserPreferences()
    })
  }, [])

  const setPreference = useCallback(
    (key, value) => {
      setPreferences((prev) => ({ ...prev, [key]: value }))
    },
    [setPreferences],
  )

  useEffect(() => {
    applyThemeToDocument(preferences.theme)
  }, [preferences.theme])

  useEffect(() => {
    if (preferences.theme !== 'system') return undefined
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyThemeToDocument('system')
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [preferences.theme])

  useEffect(() => {
    const sync = (event) => {
      if (event.type === LS_EVENT && event.detail?.key !== LS_KEYS.userPreferences) return
      if (event.type === 'storage' && event.key && event.key !== LS_KEYS.userPreferences) return
      setPreferencesState(readUserPreferences())
    }
    window.addEventListener(LS_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(LS_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const value = useMemo(
    () => ({
      preferences,
      setPreferences,
      setPreference,
      resetPreferences: () => {
        writeUserPreferences({ ...DEFAULT_USER_PREFERENCES })
        setPreferencesState(readUserPreferences())
        applyThemeToDocument(DEFAULT_USER_PREFERENCES.theme)
      },
    }),
    [preferences, setPreferences, setPreference],
  )

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}
