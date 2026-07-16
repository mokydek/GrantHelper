import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2 } from 'lucide-react'
import { Badge, Button, Card, Input, Label, Select, Textarea } from '../ui'
import { useProfile } from '../../providers/ProfileProvider'
import {
  createActivity,
  deleteActivity,
  listMyActivities,
} from '../../../backend/services/activitiesService'
import type { Activity, ActivityType } from '../../../backend/types/database'
import { ACTIVITY_TYPES, type SectionHandle } from './shared'

const ActivitiesSection = forwardRef<SectionHandle>((_props, ref) => {
  const { t } = useTranslation()
  const { profile, refresh } = useProfile()

  const [activities, setActivities] = useState<Activity[]>([])
  const [type, setType] = useState<ActivityType>('volunteering')
  const [title, setTitle] = useState('')
  const [organization, setOrganization] = useState('')
  const [hours, setHours] = useState('')
  const [startedAt, setStartedAt] = useState('')
  const [endedAt, setEndedAt] = useState('')
  const [description, setDescription] = useState('')
  const [titleError, setTitleError] = useState<string | undefined>()
  const [adding, setAdding] = useState(false)

  const loadActivities = useCallback(async () => {
    const { data } = await listMyActivities()
    setActivities(data)
  }, [])

  useEffect(() => {
    void loadActivities()
  }, [loadActivities])

  useImperativeHandle(ref, () => ({
    // Activities persist immediately on add and delete, so a step or card save
    // has nothing extra to write.
    save: async () => true,
  }))

  const handleAdd = async () => {
    if (title.trim().length === 0) {
      setTitleError(t('profile.validation.titleRequired'))
      return
    }
    setTitleError(undefined)
    setAdding(true)
    try {
      const parsedHours = hours.trim().length > 0 ? Number(hours) : null
      await createActivity({
        activity_type: type,
        title: title.trim(),
        organization: organization.trim() || null,
        hours: parsedHours != null && !Number.isNaN(parsedHours) ? parsedHours : null,
        started_at: startedAt || null,
        ended_at: endedAt || null,
        description: description.trim() || null,
      })
      setType('volunteering')
      setTitle('')
      setOrganization('')
      setHours('')
      setStartedAt('')
      setEndedAt('')
      setDescription('')
      await loadActivities()
      await refresh()
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (id: string) => {
    await deleteActivity(id)
    await loadActivities()
    await refresh()
  }

  return (
    <div className="space-y-6">
      {activities.length > 0 && (
        <ul className="space-y-3">
          {activities.map((activity) => (
            <li key={activity.id}>
              <Card className="flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-1">
                  <Badge variant="muted">
                    {t(`profile.activities.types.${activity.activity_type}`)}
                  </Badge>
                  <div className="font-medium">{activity.title}</div>
                  {activity.organization && (
                    <div className="text-[13px] text-muted">
                      {activity.organization}
                    </div>
                  )}
                  {(activity.started_at || activity.ended_at) && (
                    <div className="font-mono text-[12px] text-muted">
                      {activity.started_at}
                      {activity.started_at && activity.ended_at
                        ? ` ${t('profile.activities.to')} `
                        : ''}
                      {activity.ended_at}
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {activity.hours != null && (
                    <span className="font-mono text-sm tabular-nums">
                      {activity.hours} {t('profile.activities.hoursShort')}
                    </span>
                  )}
                  <button
                    type="button"
                    aria-label={t('profile.actions.delete')}
                    onClick={() => handleDelete(activity.id)}
                    className="text-muted transition-colors hover:text-fg"
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <p className="text-sm text-muted">
        {t('profile.activities.total')}:{' '}
        <span className="font-mono tabular-nums text-fg">
          {profile?.volunteer_hours ?? 0}
        </span>
      </p>

      <div className="space-y-4 border-t border-border pt-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="activity-type">{t('profile.activities.type')}</Label>
            <Select
              id="activity-type"
              value={type}
              onChange={(event) =>
                setType(event.target.value as ActivityType)
              }
            >
              {ACTIVITY_TYPES.map((activityType) => (
                <option key={activityType} value={activityType}>
                  {t(`profile.activities.types.${activityType}`)}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="activity-title">
              {t('profile.activities.title')}
            </Label>
            <Input
              id="activity-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              error={titleError}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="activity-org">
              {t('profile.activities.organization')}
            </Label>
            <Input
              id="activity-org"
              value={organization}
              onChange={(event) => setOrganization(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="activity-hours">
              {t('profile.activities.hours')}
            </Label>
            <Input
              id="activity-hours"
              type="number"
              inputMode="numeric"
              value={hours}
              onChange={(event) => setHours(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="activity-start">
              {t('profile.activities.startDate')}
            </Label>
            <Input
              id="activity-start"
              type="date"
              value={startedAt}
              onChange={(event) => setStartedAt(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="activity-end">
              {t('profile.activities.endDate')}
            </Label>
            <Input
              id="activity-end"
              type="date"
              value={endedAt}
              onChange={(event) => setEndedAt(event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="activity-description">
            {t('profile.activities.description')}
          </Label>
          <Textarea
            id="activity-description"
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <Button
          type="button"
          variant="secondary"
          size="md"
          loading={adding}
          onClick={handleAdd}
        >
          <Plus size={16} aria-hidden="true" />
          {t('profile.activities.add')}
        </Button>
      </div>
    </div>
  )
})

ActivitiesSection.displayName = 'ActivitiesSection'

export default ActivitiesSection
