import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '../components/ui'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { useAuth } from '../providers/AuthProvider'
import { signOut } from '../../backend/services/authService'

// Shell for authenticated pages: a top bar plus the routed content below.
export default function AppLayout() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleSignOut = async () => {
    // Navigate to the public landing first, then clear the session. Doing it
    // the other way lets ProtectedRoute redirect to /login before we leave.
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

      <main className="mx-auto max-w-[1120px] px-6 py-10">
        <Outlet />
      </main>
    </div>
  )
}
