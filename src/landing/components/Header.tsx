import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '../../frontend/components/ui'
import LanguageSwitcher from '../../frontend/components/LanguageSwitcher'

export default function Header() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg">
      <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between px-6">
        <Link
          to="/"
          className="font-display text-lg font-bold tracking-[-0.02em]"
        >
          GrantHelper
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          {/* Ghost "Sign in" collapses away on mobile; wrapper avoids the
              Button base inline-flex overriding a `hidden` utility. */}
          <div className="hidden sm:block">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/login')}
            >
              {t('actions.signIn')}
            </Button>
          </div>
          <Button variant="primary" size="sm" onClick={() => navigate('/signup')}>
            {t('actions.getStarted')}
          </Button>
        </nav>
      </div>
    </header>
  )
}
