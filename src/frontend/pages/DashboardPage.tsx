import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, CheckCircle2, Circle, TriangleAlert } from 'lucide-react'
import { Card } from '../components/ui'
import StatusBadge from '../components/StatusBadge'
import { useProfile } from '../providers/ProfileProvider'
import { useMatches } from '../hooks/useMatches'
import { listMyScores } from '../../backend/services/testScoresService'
import { listMyActivities } from '../../backend/services/activitiesService'
import {
  listMyApplications,
  type ApplicationWithGrant,
} from '../../backend/services/applicationsService'
import { computeProfileStrength } from '../../lib/profileStrength'
import { daysUntil, formatDate } from '../../lib/dates'
import { cn } from '../../lib/cn'
import { usePageTitle } from '../../lib/usePageTitle'
import Loading from '../components/Loading'
import type { TestScore } from '../../backend/types/database'

const ACTIVE_STATUSES = ['planned', 'in_progress', 'submitted']

function StatCard({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Card className="space-y-2">
      <div className="font-mono text-[12px] uppercase tracking-[0.05em] text-muted">
        {label}
      </div>
      <div className="flex items-baseline gap-1">{children}</div>
    </Card>
  )
}

export default function DashboardPage() {
  const { t, i18n } = useTranslation()
  usePageTitle(t('nav.dashboard'))
  const { profile } = useProfile()
  const { matches, loading: matchesLoading } = useMatches()

  const [scores, setScores] = useState<TestScore[] | null>(null)
  const [activitiesCount, setActivitiesCount] = useState<number | null>(null)
  const [applications, setApplications] = useState<ApplicationWithGrant[] | null>(
    null,
  )

  useEffect(() => {
    let active = true
    Promise.all([listMyScores(), listMyActivities(), listMyApplications()])
      .then(([scoreResult, activityResult, applicationResult]) => {
        if (!active) return
        setScores(scoreResult.data)
        setActivitiesCount(activityResult.data.length)
        setApplications(applicationResult)
      })
      .catch(() => {
        if (!active) return
        setScores([])
        setActivitiesCount(0)
        setApplications([])
      })
    return () => {
      active = false
    }
  }, [])

  const strength = useMemo(
    () =>
      profile && scores !== null && activitiesCount !== null
        ? computeProfileStrength(profile, scores, activitiesCount)
        : null,
    [profile, scores, activitiesCount],
  )

  const ready =
    profile &&
    !matchesLoading &&
    matches !== null &&
    applications !== null &&
    strength !== null

  if (!ready) {
    return <Loading />
  }

  const firstName = profile.full_name?.trim().split(/\s+/)[0]
  const eligibleCount = matches.filter((m) => m.status === 'eligible').length
  const activeApps = applications.filter((a) =>
    ACTIVE_STATUSES.includes(a.status),
  )

  const futureDays = activeApps
    .map((a) => a.grant?.deadline)
    .filter((d): d is string => d != null)
    .map((d) => daysUntil(d))
    .filter((d) => d >= 0)
  const nearestDeadline = futureDays.length > 0 ? Math.min(...futureDays) : null

  const topMatches = matches
    .filter((m) => m.status === 'eligible' || m.status === 'borderline')
    .slice(0, 5)

  const upcoming = activeApps
    .filter((a) => a.grant?.deadline != null && daysUntil(a.grant.deadline) >= 0)
    .sort(
      (a, b) =>
        new Date(a.grant!.deadline!).getTime() -
        new Date(b.grant!.deadline!).getTime(),
    )
    .slice(0, 5)

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-bold">
        {firstName
          ? t('dashboard.welcome', { name: firstName })
          : t('dashboard.welcomeNoName')}
      </h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label={t('dashboard.stats.profileStrength')}>
          <span className="font-mono text-4xl leading-none tabular-nums">
            {strength.percent}
          </span>
          <span className="font-mono text-lg text-muted">%</span>
        </StatCard>
        <StatCard label={t('dashboard.stats.eligibleGrants')}>
          <span className="font-mono text-4xl leading-none tabular-nums">
            {eligibleCount}
          </span>
        </StatCard>
        <StatCard label={t('dashboard.stats.activeApplications')}>
          <span className="font-mono text-4xl leading-none tabular-nums">
            {activeApps.length}
          </span>
        </StatCard>
        <StatCard label={t('dashboard.stats.nearestDeadline')}>
          {nearestDeadline != null ? (
            <>
              <span className="font-mono text-4xl leading-none tabular-nums">
                {nearestDeadline}
              </span>
              <span className="text-sm text-muted">{t('dashboard.days')}</span>
            </>
          ) : (
            <span className="text-4xl leading-none text-muted">—</span>
          )}
        </StatCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="flex flex-col gap-4">
          <h2 className="font-display text-xl font-bold">
            {t('dashboard.topMatches.title')}
          </h2>
          {topMatches.length < 2 ? (
            <Link
              to="/app/profile"
              className="text-[13px] text-muted transition-colors hover:text-fg"
            >
              {t('dashboard.topMatches.hint')}
            </Link>
          ) : (
            <ul className="space-y-3">
              {topMatches.map((m) => (
                <li
                  key={m.grant.id}
                  className="flex items-center justify-between gap-3"
                >
                  <Link
                    to={`/app/grants/${m.grant.id}`}
                    className="min-w-0 truncate font-medium hover:underline"
                  >
                    {m.grant.name}
                  </Link>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="font-mono text-sm tabular-nums">
                      {m.score}
                    </span>
                    <StatusBadge status={m.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link
            to="/app/grants"
            className="mt-auto inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-fg"
          >
            {t('dashboard.topMatches.viewAll')}
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </Card>

        <div className="space-y-6">
          <Card className="space-y-4">
            <h2 className="font-display text-xl font-bold">
              {t('dashboard.upcomingDeadlines.title')}
            </h2>
            {upcoming.length === 0 ? (
              <p className="text-[13px] text-muted">
                {t('dashboard.upcomingDeadlines.empty')}
              </p>
            ) : (
              <ul className="space-y-3">
                {upcoming.map((a) => {
                  const days = daysUntil(a.grant!.deadline!)
                  const urgent = days < 14
                  return (
                    <li
                      key={a.id}
                      className="flex items-center justify-between gap-3"
                    >
                      <Link
                        to="/app/applications"
                        className="min-w-0 truncate text-sm hover:underline"
                      >
                        {a.grant!.name}
                      </Link>
                      <span
                        className={cn(
                          'inline-flex shrink-0 items-center gap-1 font-mono text-[12px]',
                          urgent ? 'font-medium text-fg' : 'text-muted',
                        )}
                      >
                        {urgent && <TriangleAlert size={12} aria-hidden="true" />}
                        {t('applications.deadline.line', {
                          date: formatDate(a.grant!.deadline!, i18n.language),
                          days,
                        })}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>

          <Card className="space-y-4">
            <h2 className="font-display text-xl font-bold">
              {t('dashboard.completeProfile.title')}
            </h2>
            {strength.percent >= 100 ? (
              <div className="flex items-center gap-2 text-sm text-muted">
                <CheckCircle2 size={16} aria-hidden="true" />
                {t('dashboard.completeProfile.complete')}
              </div>
            ) : (
              <ul className="space-y-2">
                {strength.missing.map((item) => (
                  <li key={item.key}>
                    <Link
                      to="/app/profile"
                      className="flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg"
                    >
                      <Circle size={14} aria-hidden="true" />
                      {t(`dashboard.completeProfile.missing.${item.key}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
