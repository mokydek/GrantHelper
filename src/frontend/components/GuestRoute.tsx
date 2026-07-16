import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../providers/AuthProvider'
import Loading from './Loading'

export default function GuestRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return <Loading full />
  }

  if (user) {
    return <Navigate to="/app" replace />
  }

  return <Outlet />
}
