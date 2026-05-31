import { createContext } from 'react'

/**
 * Live tasks / notes / study sessions for the signed-in user.
 * Provided by `FirestoreDataContext.jsx` — use `useFirestoreData()` from `src/hooks/useFirestoreData.js`.
 */
export const FirestoreDataContext = createContext(null)
