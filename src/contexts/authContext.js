import { createContext } from 'react'

/**
 * Global Firebase Auth state — provided by `AuthContext.jsx`.
 * Consumer: `useAuth()` from `src/hooks/useAuth.js`.
 */
export const AuthContext = createContext(null)
