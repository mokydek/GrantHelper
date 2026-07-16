import { lazy, Suspense } from 'react'
import { createBrowserRouter, Outlet } from 'react-router-dom'

// Every route component is lazy loaded so each renders as its own JS chunk.
const LandingPage = lazy(() => import('./landing/LandingPage'))
const LoginPage = lazy(() => import('./frontend/pages/auth/LoginPage'))
const SignupPage = lazy(() => import('./frontend/pages/auth/SignupPage'))
const AppLayout = lazy(() => import('./frontend/layouts/AppLayout'))
const DashboardPage = lazy(() => import('./frontend/pages/DashboardPage'))
const UiKitPage = lazy(() => import('./frontend/pages/UiKitPage'))
const GuestRoute = lazy(() => import('./frontend/components/GuestRoute'))
const ProtectedRoute = lazy(() => import('./frontend/components/ProtectedRoute'))

// A single top level Suspense boundary wraps every lazy route.
function RootSuspense() {
  return (
    <Suspense fallback={<div>Loading</div>}>
      <Outlet />
    </Suspense>
  )
}

export const router = createBrowserRouter([
  {
    element: <RootSuspense />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/ui-kit', element: <UiKitPage /> },
      {
        element: <GuestRoute />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/signup', element: <SignupPage /> },
        ],
      },
      {
        path: '/app',
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [{ index: true, element: <DashboardPage /> }],
          },
        ],
      },
    ],
  },
])
