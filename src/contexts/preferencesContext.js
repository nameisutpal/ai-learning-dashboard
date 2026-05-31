import { createContext } from 'react'

/** See `PreferencesProvider` in `PreferencesContext.jsx` — split so Fast Refresh stays happy with hooks in `usePreferences.js`. */
export const PreferencesContext = createContext(null)
