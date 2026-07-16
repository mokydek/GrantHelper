import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  FileText,
  HelpCircle,
  TriangleAlert,
  X,
} from 'lucide-react'
import { Badge, Button } from '../components/ui'
import StatusBadge from '../components/StatusBadge'
import { useMatches } from '../hooks/useMatches'
import { daysUntil, formatDate } from '../../lib/dates'
import { cn } from '../../lib/cn'
import {
  ApplicationError,
  createApplication,
  getMyApplicationByGrantId,
} from '../../backend/services/applicationsService'
import { listMyDocuments } from '../../backend/services/documentsService'
import type { CriterionState } from '../../lib/matching/types'

const STATE_ICON: Record<CriterionState, LucideIcon> = {
  met: Check,
  close: TriangleAlert,
  failed: X,
  unknown: HelpCircle,
}

export default function GrantDetailPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { grantId } = useParams()
  const [searchParams] = useSearchParams()
  const { matches, loading } = useMatches()

  const [added, setAdded] = useState(false)
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [readyEssay, setReadyEssay] = useState(false)
  const [readyRecommendation, setReadyRecommendation] = useState(false)

  useEffect(() => {
    let active = true
    listMyDocuments()
      .then((docs) => {
        if (!active) return
        setReadyEssay(
          docs.some(
            (d) =>
              (d.doc_type === 'essay' || d.doc_type === 'motivation_letter') &&
              d.status === 'ready',
          ),
        )
        setReadyRecommendation(
          docs.some(
            (d) => d.doc_type === 'recommendation_letter' && d.status === 'ready',
          ),
        )
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    if (grantId) {
      getMyApplicationByGrantId(grantId)
        .then((row) => {
          if (active && row) setAdded(true)
        })
        .catch(() => {})
    }
    return () => {
      active = false
    }
  }, [grantId])

  const backSearch = searchParams.toString()
    ? `?${searchParams.toString()}`
    : ''
  const backLink = `/app/grants${backSearch}`

  const deadlineText = (deadline: string | null): string => {
    if (deadline == null) return t('grants.deadline.rolling')
    const days = daysUntil(deadline)
    if (days < 0) return t('grants.deadline.passed')
    return t('grants.deadline.line', {
      date: formatDate(deadline, i18n.language),
      days,
    })
  }

  if (loading && matches === null) {
    return <p className="text-muted">Loading</p>
  }

  const match = matches?.find((m) => m.grant.id === grantId)
  if (!match) {
    return (
      <div className="space-y-4 py-16 text-center">
        <p className="text-muted">{t('grants.detail.notFound')}</p>
        <Link
          to={backLink}
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-fg"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          {t('grants.detail.back')}
        </Link>
      </div>
    )
  }

  const { grant, status, score, criteria, requiredDocuments } = match

  const handleAdd = async () => {
    if (!grantId) return
    setAdding(true)
    setAddError(null)
    try {
      await createApplication(grantId)
      setAdded(true)
    } catch (error) {
      if (error instanceof ApplicationError && error.code === 'already_exists') {
        setAdded(true)
        setAddError(t('grants.detail.alreadyAdded'))
      } else {
        setAddError(t('grants.detail.addError'))
      }
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-8">
      <Link
        to={backLink}
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-fg"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        {t('grants.detail.back')}
      </Link>

      <header className="space-y-3">
        <h1 className="font-display text-3xl font-bold">{grant.name}</h1>
        <p className="text-muted">
          {grant.provider} · {grant.country}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={status} />
          <span className="flex items-baseline gap-0.5">
            <span className="font-mono text-xl tabular-nums">{score}</span>
            <span className="font-mono text-xs text-muted">%</span>
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="muted">{t(`grants.funding.${grant.funding_type}`)}</Badge>
          {grant.degree_levels.map((level) => (
            <Badge key={level} variant="muted">
              {t(`profile.levels.${level}`)}
            </Badge>
          ))}
        </div>
      </header>

      <p className="text-muted">{grant.description}</p>

      <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-y border-border py-4 text-sm">
        {grant.amount_note && <span>{grant.amount_note}</span>}
        <span className="font-mono text-muted">
          {deadlineText(grant.deadline)}
        </span>
        <a
          href={grant.website_url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 transition-colors hover:text-fg"
        >
          {t('grants.detail.website')}
          <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </div>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold">
          {t('grants.detail.requirements')}
        </h2>
        <ul className="space-y-3">
          {criteria.map((criterion) => {
            const Icon = STATE_ICON[criterion.state]
            const iconClass =
              criterion.state === 'met' || criterion.state === 'close'
                ? 'text-fg'
                : 'text-muted'
            return (
              <li key={criterion.key} className="flex gap-3">
                <Icon
                  size={18}
                  aria-hidden="true"
                  className={cn('mt-0.5 shrink-0', iconClass)}
                />
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">
                    {t(`grants.criteria.${criterion.key}`)}
                  </div>
                  <div className="space-x-2 text-[13px] text-muted">
                    <span className="font-mono">
                      {t('grants.detail.required', { value: criterion.required })}
                    </span>
                    <span className="font-mono">
                      {criterion.actual != null
                        ? t('grants.detail.you', { value: criterion.actual })
                        : t('grants.detail.youNoData')}
                    </span>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold">
          {t('grants.detail.requiredDocuments')}
        </h2>
        {!requiredDocuments.essay && !requiredDocuments.recommendation ? (
          <p className="text-[13px] text-muted">
            {t('grants.detail.noDocuments')}
          </p>
        ) : (
          <ul className="space-y-2">
            {requiredDocuments.essay && (
              <li className="flex items-center gap-2 text-sm">
                <FileText size={16} aria-hidden="true" />
                {t('grants.documents.essay')}
                <DocumentReadiness
                  ready={readyEssay}
                  hint={t('documents.readiness.noEssay')}
                />
              </li>
            )}
            {requiredDocuments.recommendation && (
              <li className="flex items-center gap-2 text-sm">
                <FileText size={16} aria-hidden="true" />
                {t('grants.documents.recommendation')}
                <DocumentReadiness
                  ready={readyRecommendation}
                  hint={t('documents.readiness.noRecommendation')}
                />
              </li>
            )}
          </ul>
        )}
      </section>

      <div className="space-y-2">
        {added ? (
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate('/app/applications')}
          >
            {t('grants.detail.inApplications')}
          </Button>
        ) : (
          <Button
            variant="primary"
            size="md"
            loading={adding}
            onClick={handleAdd}
          >
            {t('grants.detail.addToApplications')}
          </Button>
        )}
        {addError && <p className="text-[13px] text-fg">{addError}</p>}
      </div>
    </div>
  )
}

// Informational readiness marker for a required document. Does not affect score.
function DocumentReadiness({ ready, hint }: { ready: boolean; hint: string }) {
  if (ready) {
    return <Check size={16} aria-hidden="true" className="text-fg" />
  }
  return (
    <Link
      to="/app/documents"
      className="inline-flex items-center gap-1 text-[13px] text-muted transition-colors hover:text-fg"
    >
      <HelpCircle size={16} aria-hidden="true" />
      {hint}
    </Link>
  )
}
