import { useTranslation } from 'react-i18next'
import { useAuth } from '../providers/AuthProvider'

export default function DashboardPage() {
  const { t } = useTranslation()
  const { user } = useAuth()

  return (
    <div className="space-y-2">
      <h1 className="font-display text-3xl font-bold">{t('nav.dashboard')}</h1>
      <p className="text-muted">
        {t('auth.signedInAs', { email: user?.email ?? '' })}
      </p>
    </div>
  )
}
