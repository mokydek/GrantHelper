import { Link, Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '../components/ui'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { useAuth } from '../providers/AuthProvider'
import { useProfile } from '../providers/ProfileProvider'
import { signOut } from '../../backend/services/authService'
import Loading from '../components/Loading'
import { cn } from '../../lib/cn'

const TABS = [
  { to: '/app', end: true, labelKey: 'nav.dashboard' },
  { to: '/app/grants', end: false, labelKey: 'nav.grants' },
  { to: '/app/profile', end: false, labelKey: 'nav.profile' },
  { to: '/app/documents', end: false, labelKey: 'nav.documents' },
  { to: '/app/applications', end: false, labelKey: 'nav.applications' },
]

export default function AppLayout() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { profile, loading } = useProfile()

  if (loading) {
    return <Loading full />
  }

  // A profile that has not finished onboarding cannot reach the app tabs.
  if (!profile?.onboarding_completed) {
    return <Navigate to="/app/onboarding" replace />
  }

  const handleSignOut = async () => {
    navigate('/')
    await signOut()
  }

  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="sticky top-0 z-40 border-b border-border bg-bg">
        <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between gap-4 px-6">
          <Link
            to="/app"
            className="font-display text-lg font-bold tracking-[-0.02em]"
          >
            GrantHelper
          </Link>
          <div className="flex items-center gap-3">
            {user?.email && (
              <span className="hidden max-w-[220px] truncate font-mono text-[13px] text-muted sm:inline">
                {user.email}
              </span>
            )}
            <LanguageSwitcher />
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              {t('actions.signOut')}
            </Button>
          </div>
        </div>
      </header>

      <nav className="border-b border-border">
        <div className="mx-auto max-w-[1120px] px-6">
          <div className="-mb-px flex gap-6 overflow-x-auto">
            {TABS.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  cn(
                    'whitespace-nowrap border-b-2 py-3 text-sm transition-colors',
                    isActive
                      ? 'border-fg text-fg'
                      : 'border-transparent text-muted hover:text-fg',
                  )
                }
              >
                {t(tab.labelKey)}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-[1120px] px-6 py-10">
        <Outlet />
      </main>
    </div>
  )
}
