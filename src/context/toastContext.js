import { createContext } from 'react'

/** Split from the provider file so Fast Refresh / ESLint stay happy. */
export const ToastContext = createContext(null)
