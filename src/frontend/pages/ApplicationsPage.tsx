import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MessageSquare, Trash2, TriangleAlert } from 'lucide-react'
import { Button, Card, Select, Textarea } from '../components/ui'
import Loading from '../components/Loading'
import { daysUntil, formatDate } from '../../lib/dates'
import { cn } from '../../lib/cn'
import { usePageTitle } from '../../lib/usePageTitle'
import {
  deleteApplication,
  listMyApplications,
  updateApplication,
  type ApplicationWithGrant,
} from '../../backend/services/applicationsService'
import type { ApplicationStatus } from '../../backend/types/database'

const SECTIONS: Array<{ key: string; statuses: ApplicationStatus[] }> = [
  { key: 'planned', statuses: ['planned'] },
  { key: 'in_progress', statuses: ['in_progress'] },
  { key: 'submitted', statuses: ['submitted'] },
  { key: 'results', statuses: ['accepted', 'rejected'] },
]

const STATUS_OPTIONS: ApplicationStatus[] = [
  'planned',
  'in_progress',
  'submitted',
  'accepted',
  'rejected',
]

export default function ApplicationsPage() {
  const { t } = useTranslation()
  usePageTitle(t('nav.applications'))
  const navigate = useNavigate()
  const [apps, setApps] = useState<ApplicationWithGrant[] | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    listMyApplications()
      .then((data) => {
        if (active) setApps(data)
      })
      .catch(() => {
        if (active) setApps([])
      })
    return () => {
      active = false
    }
  }, [])

  const patchLocal = (id: string, patch: Partial<ApplicationWithGrant>) =>
    setApps((prev) =>
      prev ? prev.map((a) => (a.id === id ? { ...a, ...patch } : a)) : prev,
    )
  const removeLocal = (id: string) =>
    setApps((prev) => (prev ? prev.filter((a) => a.id !== id) : prev))

  if (apps === null) {
    return <Loading />
  }

  if (apps.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-3xl font-bold">
          {t('nav.applications')}
        </h1>
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-muted">{t('applications.empty.title')}</p>
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate('/app/grants')}
          >
            {t('applications.empty.browse')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-bold">
        {t('nav.applications')}
      </h1>

      {actionError && <p className="text-[13px] text-fg">{actionError}</p>}

      {SECTIONS.map((section) => {
        const rows = apps.filter((a) => section.statuses.includes(a.status))
        if (rows.length === 0) return null
        return (
          <section key={section.key} className="space-y-3">
            <h2 className="flex items-center gap-2 font-display text-xl font-bold">
              {t(`applications.sections.${section.key}`)}
              <span className="font-mono text-sm text-muted tabular-nums">
                {rows.length}
              </span>
            </h2>
            <ul className="space-y-3">
              {rows.map((app) => (
                <li key={app.id}>
                  <ApplicationRow
                    app={app}
                    onPatch={patchLocal}
                    onRemove={removeLocal}
                    onError={setActionError}
                  />
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}

function ApplicationRow({
  app,
  onPatch,
  onRemove,
  onError,
}: {
  app: ApplicationWithGrant
  onPatch: (id: string, patch: Partial<ApplicationWithGrant>) => void
  onRemove: (id: string) => void
  onError: (message: string | null) => void
}) {
  const { t, i18n } = useTranslation()
  const [notesOpen, setNotesOpen] = useState(false)
  const [notesText, setNotesText] = useState(app.notes ?? '')
  const [savingNotes, setSavingNotes] = useState(false)
  const [savedNotes, setSavedNotes] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleStatusChange = async (nextStatus: ApplicationStatus) => {
    const previous = app.status
    onError(null)
    onPatch(app.id, { status: nextStatus })
    try {
      await updateApplication(app.id, { status: nextStatus })
    } catch {
      onPatch(app.id, { status: previous })
      onError(t('applications.statusError'))
    }
  }

  const handleSaveNotes = async () => {
    setSavingNotes(true)
    onError(null)
    const value = notesText.trim() || null
    try {
      await updateApplication(app.id, { notes: value })
      onPatch(app.id, { notes: value })
      setSavedNotes(true)
      setTimeout(() => setSavedNotes(false), 2000)
    } catch {
      onError(t('applications.statusError'))
    } finally {
      setSavingNotes(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    onError(null)
    try {
      await deleteApplication(app.id)
      onRemove(app.id)
    } catch {
      setDeleting(false)
      onError(t('applications.statusError'))
    }
  }

  const deadline = app.grant?.deadline ?? null
  let deadlineNode
  if (deadline == null) {
    deadlineNode = (
      <span className="font-mono text-[12px] text-muted">
        {t('applications.deadline.rolling')}
      </span>
    )
  } else if (daysUntil(deadline) < 0) {
    deadlineNode = (
      <span className="font-mono text-[12px] text-muted">
        {t('applications.deadline.passed')}
      </span>
    )
  } else {
    const days = daysUntil(deadline)
    const urgent = days < 14
    deadlineNode = (
      <span
        className={cn(
          'inline-flex items-center gap-1 font-mono text-[12px]',
          urgent ? 'font-medium text-fg' : 'text-muted',
        )}
      >
        {urgent && <TriangleAlert size={12} aria-hidden="true" />}
        {t('applications.deadline.line', {
          date: formatDate(deadline, i18n.language),
          days,
        })}
      </span>
    )
  }

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          {app.grant ? (
            <Link
              to={`/app/grants/${app.grant.id}`}
              className="font-display font-medium hover:underline"
            >
              {app.grant.name}
            </Link>
          ) : (
            <span className="font-display font-medium text-muted">—</span>
          )}
          <div className="text-[13px] text-muted">{app.grant?.provider}</div>
          <div>{deadlineNode}</div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {confirmingDelete ? (
            <div className="flex flex-wrap items-center justify-end gap-2">
              <span className="text-[13px] text-muted">
                {t('applications.remove.confirm')}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setConfirmingDelete(false)}
              >
                {t('applications.remove.cancel')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={deleting}
                onClick={handleDelete}
              >
                {t('applications.remove.remove')}
              </Button>
            </div>
          ) : (
            <>
              <div className="w-36">
                <Select
                  size="sm"
                  aria-label={t('common.status')}
                  value={app.status}
                  onChange={(event) =>
                    handleStatusChange(event.target.value as ApplicationStatus)
                  }
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {t(`applications.status.${option}`)}
                    </option>
                  ))}
                </Select>
              </div>
              <button
                type="button"
                aria-label={t('applications.notes.toggle')}
                onClick={() => setNotesOpen((open) => !open)}
                className="p-1.5 text-muted transition-colors hover:text-fg"
              >
                <MessageSquare size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label={t('applications.remove.toggle')}
                onClick={() => setConfirmingDelete(true)}
                className="p-1.5 text-muted transition-colors hover:text-fg"
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      </div>

      {notesOpen && (
        <div className="space-y-2 border-t border-border pt-3">
          <Textarea
            rows={3}
            aria-label={t('applications.notes.toggle')}
            value={notesText}
            onChange={(event) => setNotesText(event.target.value)}
            placeholder={t('applications.notes.placeholder')}
          />
          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              loading={savingNotes}
              onClick={handleSaveNotes}
            >
              {t('applications.notes.save')}
            </Button>
            {savedNotes && (
              <span className="text-[13px] text-muted">
                {t('applications.notes.saved')}
              </span>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}
