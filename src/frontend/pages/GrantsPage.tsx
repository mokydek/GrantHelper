import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { Badge, Button, Card, Input, Select } from '../components/ui'
import StatusBadge from '../components/StatusBadge'
import { useMatches } from '../hooks/useMatches'
import { daysUntil, formatDate } from '../../lib/dates'
import { cn } from '../../lib/cn'
import { usePageTitle } from '../../lib/usePageTitle'
import Loading from '../components/Loading'
import type { GrantMatch, MatchStatus } from '../../lib/matching/types'
import type { DegreeLevel, FundingType } from '../../backend/types/database'

type StatusFilter = 'all' | MatchStatus
type SortKey = 'best' | 'deadline' | 'name'

const STATUS_PILLS: StatusFilter[] = [
  'all',
  'eligible',
  'borderline',
  'incomplete',
  'not_eligible',
]
const DEGREE_LEVELS: DegreeLevel[] = [
  'bachelor',
  'master',
  'phd',
  'exchange',
  'summer_school',
]
const FUNDING_TYPES: FundingType[] = ['full', 'partial', 'one_time']

// Upcoming deadlines sort ascending; past deadlines and nulls sort last.
function deadlineRank(deadline: string | null): number {
  if (deadline == null) return Number.MAX_SAFE_INTEGER
  if (daysUntil(deadline) < 0) return Number.MAX_SAFE_INTEGER
  return new Date(deadline).getTime()
}

export default function GrantsPage() {
  const { t, i18n } = useTranslation()
  usePageTitle(t('nav.grants'))
  const { matches, loading } = useMatches()
  const [searchParams, setSearchParams] = useSearchParams()

  const q = searchParams.get('q') ?? ''
  const status = (searchParams.get('status') ?? 'all') as StatusFilter

  const [country, setCountry] = useState('all')
  const [degree, setDegree] = useState('all')
  const [funding, setFunding] = useState('all')
  const [sort, setSort] = useState<SortKey>('best')

  const setParam = (key: string, value: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value && value !== 'all') next.set(key, value)
        else next.delete(key)
        return next
      },
      { replace: true },
    )
  }

  const resetFilters = () => {
    setSearchParams({}, { replace: true })
    setCountry('all')
    setDegree('all')
    setFunding('all')
    setSort('best')
  }

  const countries = useMemo(
    () =>
      [...new Set((matches ?? []).map((m) => m.grant.country))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [matches],
  )

  // Everything except the status pill; the pill counts read from this set.
  const baseFiltered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return (matches ?? []).filter((m) => {
      if (
        query &&
        !m.grant.name.toLowerCase().includes(query) &&
        !m.grant.provider.toLowerCase().includes(query)
      ) {
        return false
      }
      if (country !== 'all' && m.grant.country !== country) return false
      if (
        degree !== 'all' &&
        !m.grant.degree_levels.includes(degree as DegreeLevel)
      ) {
        return false
      }
      if (funding !== 'all' && m.grant.funding_type !== funding) return false
      return true
    })
  }, [matches, q, country, degree, funding])

  const counts = useMemo(() => {
    const result: Record<StatusFilter, number> = {
      all: baseFiltered.length,
      eligible: 0,
      borderline: 0,
      incomplete: 0,
      not_eligible: 0,
    }
    for (const m of baseFiltered) result[m.status] += 1
    return result
  }, [baseFiltered])

  const visible = useMemo(() => {
    const list =
      status === 'all'
        ? baseFiltered
        : baseFiltered.filter((m) => m.status === status)
    if (sort === 'name') {
      return [...list].sort((a, b) => a.grant.name.localeCompare(b.grant.name))
    }
    if (sort === 'deadline') {
      return [...list].sort(
        (a, b) => deadlineRank(a.grant.deadline) - deadlineRank(b.grant.deadline),
      )
    }
    return list
  }, [baseFiltered, status, sort])

  const searchSuffix = searchParams.toString() ? `?${searchParams.toString()}` : ''

  const deadlineText = (deadline: string | null): string => {
    if (deadline == null) return t('grants.deadline.rolling')
    const days = daysUntil(deadline)
    if (days < 0) return t('grants.deadline.passed')
    return t('grants.deadline.line', {
      date: formatDate(deadline, i18n.language),
      days,
    })
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">{t('nav.grants')}</h1>

      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <Input
            className="pl-9!"
            aria-label={t('grants.searchPlaceholder')}
            placeholder={t('grants.searchPlaceholder')}
            value={q}
            onChange={(event) => setParam('q', event.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_PILLS.map((pill) => {
            const active = status === pill
            return (
              <button
                key={pill}
                type="button"
                onClick={() => setParam('status', pill)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-base border px-3 py-1.5 text-sm transition-colors',
                  active
                    ? 'border-fg bg-fg text-bg'
                    : 'border-border bg-bg text-fg hover:border-fg',
                )}
              >
                {t(`grants.pills.${pill}`)}
                <span className="font-mono text-[12px] tabular-nums">
                  {counts[pill]}
                </span>
              </button>
            )
          })}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            aria-label={t('grants.filters.country')}
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            <option value="all">
              {t('grants.filters.country')}: {t('grants.filters.all')}
            </option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>

          <Select
            aria-label={t('grants.filters.degree')}
            value={degree}
            onChange={(e) => setDegree(e.target.value)}
          >
            <option value="all">
              {t('grants.filters.degree')}: {t('grants.filters.all')}
            </option>
            {DEGREE_LEVELS.map((level) => (
              <option key={level} value={level}>
                {t(`profile.levels.${level}`)}
              </option>
            ))}
          </Select>

          <Select
            aria-label={t('grants.filters.funding')}
            value={funding}
            onChange={(e) => setFunding(e.target.value)}
          >
            <option value="all">
              {t('grants.filters.funding')}: {t('grants.filters.all')}
            </option>
            {FUNDING_TYPES.map((type) => (
              <option key={type} value={type}>
                {t(`grants.funding.${type}`)}
              </option>
            ))}
          </Select>

          <Select
            aria-label={t('grants.sort.label')}
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
          >
            <option value="best">{t('grants.sort.best')}</option>
            <option value="deadline">{t('grants.sort.deadline')}</option>
            <option value="name">{t('grants.sort.name')}</option>
          </Select>
        </div>
      </div>

      {loading && matches === null ? (
        <Loading />
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-muted">{t('grants.empty.title')}</p>
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            {t('grants.empty.reset')}
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((match) => (
            <li key={match.grant.id}>
              <GrantRow
                match={match}
                to={`/app/grants/${match.grant.id}${searchSuffix}`}
                deadlineText={deadlineText(match.grant.deadline)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function GrantRow({
  match,
  to,
  deadlineText,
}: {
  match: GrantMatch
  to: string
  deadlineText: string
}) {
  const { t } = useTranslation()
  const { grant, status, score } = match

  return (
    <Link to={to} className="block">
      <Card className="flex items-start justify-between gap-4 transition-colors hover:border-fg">
        <div className="min-w-0 space-y-2">
          <h3 className="font-display font-medium">{grant.name}</h3>
          <p className="text-[13px] text-muted">
            {grant.provider} · {grant.country}
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="muted">{t(`grants.funding.${grant.funding_type}`)}</Badge>
            {grant.degree_levels.map((level) => (
              <Badge key={level} variant="muted">
                {t(`profile.levels.${level}`)}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5 text-right">
          <div className="flex items-baseline gap-0.5">
            <span className="font-mono text-2xl leading-none tabular-nums">
              {score}
            </span>
            <span className="font-mono text-xs text-muted">%</span>
          </div>
          <StatusBadge status={status} />
          <p className="font-mono text-[12px] text-muted">{deadlineText}</p>
        </div>
      </Card>
    </Link>
  )
}
