import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { AuthStateLoader } from './AuthStateLoader.jsx'

/**
 * Wraps every private route (dashboard). Unauthenticated visitors go to `/login`.
 * `state.from` lets you send users back after login (optional enhancement on LoginPage).
 */
export function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <AuthStateLoader />
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
