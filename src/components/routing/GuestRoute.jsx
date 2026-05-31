import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { AuthStateLoader } from './AuthStateLoader.jsx'

/**
 * Login / Signup only. If Firebase already has a user, skip straight to the dashboard.
 */
export function GuestRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return <AuthStateLoader />
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
