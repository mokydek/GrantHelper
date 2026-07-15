import { Outlet } from 'react-router-dom'

// Shell for authenticated pages. Renders its child routes for now.
export default function AppLayout() {
  return <Outlet />
}
