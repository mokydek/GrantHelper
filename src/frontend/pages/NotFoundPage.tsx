import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui'
import { useAuth } from '../providers/AuthProvider'
import { usePageTitle } from '../../lib/usePageTitle'

export default function NotFoundPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  usePageTitle(t('notFound.title'))

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="font-mono text-6xl font-bold tabular-nums">404</div>
      <p className="text-muted">{t('notFound.message')}</p>
      <Button
        variant="secondary"
        size="md"
        onClick={() => navigate(user ? '/app' : '/')}
      >
        {t('notFound.back')}
      </Button>
    </div>
  )
}
