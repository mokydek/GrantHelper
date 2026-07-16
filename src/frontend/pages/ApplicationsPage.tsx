import { useTranslation } from 'react-i18next'

export default function ApplicationsPage() {
  const { t } = useTranslation()
  return (
    <div className="space-y-2">
      <h1 className="font-display text-3xl font-bold">{t('nav.applications')}</h1>
      <p className="text-muted">{t('profile.comingSoon')}</p>
    </div>
  )
}
