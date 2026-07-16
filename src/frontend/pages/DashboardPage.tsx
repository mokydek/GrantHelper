import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../providers/AuthProvider'
import { Card } from '../components/ui'
import { getMyMatches } from '../../backend/services/matchingService'
import type { GrantMatch } from '../../lib/matching/types'

export default function DashboardPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [matches, setMatches] = useState<GrantMatch[] | null>(null)

  useEffect(() => {
    let active = true
    getMyMatches()
      .then((result) => {
        if (active) setMatches(result)
      })
      .catch(() => {
        if (active) setMatches([])
      })
    return () => {
      active = false
    }
  }, [])

  const eligible = matches?.filter((m) => m.status === 'eligible').length ?? 0
  const borderline = matches?.filter((m) => m.status === 'borderline').length ?? 0
  const total = matches?.length ?? 0

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-bold">{t('nav.dashboard')}</h1>
      <p className="text-muted">
        {t('auth.signedInAs', { email: user?.email ?? '' })}
      </p>

      <Card className="max-w-md space-y-2">
        <h2 className="font-display text-xl font-bold">
          {t('dashboard.matches.title')}
        </h2>
        {matches === null ? (
          <p className="text-sm text-muted">Loading</p>
        ) : (
          <>
            <p className="text-sm">
              <span className="font-mono tabular-nums">{eligible}</span>{' '}
              {t('dashboard.matches.eligibleLabel')},{' '}
              <span className="font-mono tabular-nums">{borderline}</span>{' '}
              {t('dashboard.matches.borderlineLabel')}{' '}
              {t('dashboard.matches.of')}{' '}
              <span className="font-mono tabular-nums">{total}</span>{' '}
              {t('dashboard.matches.grantsLabel')}
            </p>
            <p className="text-[13px] text-muted">
              {t('dashboard.matches.comingSoon')}
            </p>
          </>
        )}
      </Card>
    </div>
  )
}
