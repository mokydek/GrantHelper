import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/cn'

export default function Loading({ full = false }: { full?: boolean }) {
  const { t } = useTranslation()
  return (
    <div
      className={cn(
        'text-muted',
        full && 'flex min-h-screen items-center justify-center',
      )}
    >
      {t('common.loading')}
    </div>
  )
}
