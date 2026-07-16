import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../providers/AuthProvider'
import { ProfileProvider } from '../providers/ProfileProvider'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">Loading</div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Everything behind the auth wall has access to the current profile.
  return (
    <ProfileProvider>
      <Outlet />
    </ProfileProvider>
  )
}
