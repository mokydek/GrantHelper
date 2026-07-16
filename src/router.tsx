import { lazy, Suspense } from 'react'
import {
  createBrowserRouter,
  Outlet,
  type RouteObject,
} from 'react-router-dom'
import Loading from './frontend/components/Loading'
import ScrollToTop from './frontend/components/ScrollToTop'

// Every route component is lazy loaded so each renders as its own JS chunk.
const LandingPage = lazy(() => import('./landing/LandingPage'))
const LoginPage = lazy(() => import('./frontend/pages/auth/LoginPage'))
const SignupPage = lazy(() => import('./frontend/pages/auth/SignupPage'))
const AppLayout = lazy(() => import('./frontend/layouts/AppLayout'))
const DashboardPage = lazy(() => import('./frontend/pages/DashboardPage'))
const GrantsPage = lazy(() => import('./frontend/pages/GrantsPage'))
const GrantDetailPage = lazy(() => import('./frontend/pages/GrantDetailPage'))
const ProfilePage = lazy(() => import('./frontend/pages/ProfilePage'))
const DocumentsPage = lazy(() => import('./frontend/pages/DocumentsPage'))
const EssayEditorPage = lazy(() => import('./frontend/pages/EssayEditorPage'))
const ApplicationsPage = lazy(() => import('./frontend/pages/ApplicationsPage'))
const OnboardingPage = lazy(() => import('./frontend/pages/OnboardingPage'))
const NotFoundPage = lazy(() => import('./frontend/pages/NotFoundPage'))
const GuestRoute = lazy(() => import('./frontend/components/GuestRoute'))
const ProtectedRoute = lazy(() => import('./frontend/components/ProtectedRoute'))

// A single top level Suspense boundary wraps every lazy route.
function RootSuspense() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<Loading full />}>
        <Outlet />
      </Suspense>
    </>
  )
}

// The UI kit showcase is a development only tool. The dynamic import lives
// inside the DEV guard so it is tree shaken out of the production bundle.
const devOnlyRoutes: RouteObject[] = import.meta.env.DEV
  ? [
      {
        path: '/ui-kit',
        lazy: async () => ({
          Component: (await import('./frontend/pages/UiKitPage')).default,
        }),
      },
    ]
  : []

export const router = createBrowserRouter([
  {
    element: <RootSuspense />,
    children: [
      { path: '/', element: <LandingPage /> },
      ...devOnlyRoutes,
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
          // Onboarding is protected but rendered outside the app shell.
          { path: 'onboarding', element: <OnboardingPage /> },
          {
            element: <AppLayout />,
            children: [
              { index: true, element: <DashboardPage /> },
              { path: 'grants', element: <GrantsPage /> },
              { path: 'grants/:grantId', element: <GrantDetailPage /> },
              { path: 'profile', element: <ProfilePage /> },
              { path: 'documents', element: <DocumentsPage /> },
              { path: 'documents/new', element: <EssayEditorPage /> },
              { path: 'documents/:id/edit', element: <EssayEditorPage /> },
              { path: 'applications', element: <ApplicationsPage /> },
            ],
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
