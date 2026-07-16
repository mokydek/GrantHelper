import { useTranslation } from 'react-i18next'

export default function GrantsPage() {
  const { t } = useTranslation()
  return (
    <div className="space-y-2">
      <h1 className="font-display text-3xl font-bold">{t('nav.grants')}</h1>
      <p className="text-muted">{t('profile.comingSoon')}</p>
    </div>
  )
}
