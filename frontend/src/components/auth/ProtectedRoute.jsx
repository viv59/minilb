import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore.js'

export function ProtectedRoute({ children, adminOnly = false }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  const isAdmin = useAuthStore((s) => s.isAdmin())
  const initializing = useAuthStore((s) => s.initializing)
  const location = useLocation()

  if (initializing) {
    // still confirming a persisted token against the backend - don't
    // make a redirect decision that might be wrong a moment later
    return (
      <div className="flex min-h-screen items-center justify-center bg-app-bg text-text-faint text-sm">
        Loading...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}