import { lazy, Suspense } from 'react'
import { createBrowserRouter, Outlet } from 'react-router-dom'

// Every route component is lazy loaded so each renders as its own JS chunk.
const LandingPage = lazy(() => import('./landing/LandingPage'))
const LoginPage = lazy(() => import('./frontend/pages/auth/LoginPage'))
const SignupPage = lazy(() => import('./frontend/pages/auth/SignupPage'))
const AppLayout = lazy(() => import('./frontend/layouts/AppLayout'))
const DashboardPage = lazy(() => import('./frontend/pages/DashboardPage'))
const UiKitPage = lazy(() => import('./frontend/pages/UiKitPage'))

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
      { path: '/login', element: <LoginPage /> },
      { path: '/signup', element: <SignupPage /> },
      { path: '/ui-kit', element: <UiKitPage /> },
      {
        path: '/app',
        element: <AppLayout />,
        children: [{ index: true, element: <DashboardPage /> }],
      },
    ],
  },
])
