import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-[1120px] flex-col items-center justify-between gap-3 px-6 py-5 text-[13px] sm:h-16 sm:flex-row sm:py-0">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold">GrantHelper</span>
          <span className="text-muted">{t('landing.footer.copyright')}</span>
        </div>
        <nav className="flex items-center gap-5 text-muted">
          <Link to="/login" className="transition-colors hover:text-fg">
            {t('actions.signIn')}
          </Link>
          <Link to="/signup" className="transition-colors hover:text-fg">
            {t('actions.signUp')}
          </Link>
        </nav>
      </div>
    </footer>
  )
}
