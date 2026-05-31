import { useContext } from 'react'
import { AuthContext } from '../contexts/authContext.js'

/** Read Firebase user + auth helpers from any component under `<AuthProvider>`. */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return ctx
}
