import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Card } from '../components/ui'
import LanguageSwitcher from '../components/LanguageSwitcher'
import BasicsSection from '../components/profile/BasicsSection'
import AcademicsSection from '../components/profile/AcademicsSection'
import ActivitiesSection from '../components/profile/ActivitiesSection'
import type { SectionHandle } from '../components/profile/shared'
import { useProfile } from '../providers/ProfileProvider'
import { updateMyProfile } from '../../backend/services/profileService'
import { listMyScores } from '../../backend/services/testScoresService'
import { listMyActivities } from '../../backend/services/activitiesService'
import type { Activity, TestScore } from '../../backend/types/database'
import Loading from '../components/Loading'
import { cn } from '../../lib/cn'
import { usePageTitle } from '../../lib/usePageTitle'

const STEP_KEYS = ['basics', 'academics', 'activities', 'review'] as const

function ProgressHeader({ step }: { step: number }) {
  const { t } = useTranslation()
  return (
    <ol className="flex flex-wrap gap-x-6 gap-y-2">
      {STEP_KEYS.map((key, index) => {
        const active = step === index + 1
        return (
          <li
            key={key}
            className={cn(
              'flex items-center gap-2',
              active ? 'text-fg' : 'text-muted',
            )}
          >
            <span className="font-mono text-sm">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="text-sm">{t(`onboarding.steps.${key}`)}</span>
          </li>
        )
      })}
    </ol>
  )
}

function ReviewRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <span className="text-muted">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  )
}

function ReviewGroup({
  title,
  onEdit,
  children,
}: {
  title: string
  onEdit: () => void
  children: ReactNode
}) {
  const { t } = useTranslation()
  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-medium">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="text-[13px] text-muted transition-colors hover:text-fg"
        >
          {t('onboarding.edit')}
        </button>
      </div>
      <div className="divide-y divide-border">{children}</div>
    </Card>
  )
}

function ReviewStep({ onEdit }: { onEdit: (step: number) => void }) {
  const { t } = useTranslation()
  const { profile } = useProfile()
  const [scores, setScores] = useState<TestScore[]>([])
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    void (async () => {
      const [scoreResult, activityResult] = await Promise.all([
        listMyScores(),
        listMyActivities(),
      ])
      setScores(scoreResult.data)
      setActivities(activityResult.data)
    })()
  }, [])

  const empty = t('onboarding.emptyValue')
  const text = (value: string | null | undefined) =>
    value && value.length > 0 ? value : empty
  const level = (value: string | null | undefined) =>
    value ? t(`profile.levels.${value}`) : empty
  const country = (value: string | null | undefined) =>
    value ? t(`profile.countries.${value}`) : empty

  return (
    <div className="space-y-6">
      <ReviewGroup title={t('onboarding.steps.basics')} onEdit={() => onEdit(1)}>
        <ReviewRow label={t('profile.fields.fullName')}>
          {text(profile?.full_name)}
        </ReviewRow>
        <ReviewRow label={t('profile.fields.citizenship')}>
          {country(profile?.citizenship)}
        </ReviewRow>
        <ReviewRow label={t('profile.fields.dateOfBirth')}>
          <span className="font-mono">{text(profile?.date_of_birth)}</span>
        </ReviewRow>
        <ReviewRow label={t('profile.fields.currentLevel')}>
          {level(profile?.current_level)}
        </ReviewRow>
        <ReviewRow label={t('profile.fields.targetLevel')}>
          {level(profile?.target_level)}
        </ReviewRow>
        <ReviewRow label={t('profile.fields.fieldOfStudy')}>
          {text(profile?.field_of_study)}
        </ReviewRow>
      </ReviewGroup>

      <ReviewGroup
        title={t('onboarding.steps.academics')}
        onEdit={() => onEdit(2)}
      >
        <ReviewRow label={t('profile.fields.gpa')}>
          <span className="font-mono">
            {profile?.gpa != null
              ? `${profile.gpa} / ${profile.gpa_scale ?? ''}`
              : empty}
          </span>
        </ReviewRow>
        {scores.length === 0 ? (
          <ReviewRow label={t('profile.tests.heading')}>{empty}</ReviewRow>
        ) : (
          scores.map((score) => (
            <ReviewRow key={score.id} label={score.test_type}>
              <span className="font-mono">{score.score}</span>
            </ReviewRow>
          ))
        )}
      </ReviewGroup>

      <ReviewGroup
        title={t('onboarding.steps.activities')}
        onEdit={() => onEdit(3)}
      >
        {activities.length === 0 ? (
          <ReviewRow label={t('onboarding.steps.activities')}>{empty}</ReviewRow>
        ) : (
          activities.map((activity) => (
            <ReviewRow
              key={activity.id}
              label={t(`profile.activities.types.${activity.activity_type}`)}
            >
              {activity.title}
              {activity.hours != null && (
                <span className="ml-2 font-mono text-muted">
                  {activity.hours} {t('profile.activities.hoursShort')}
                </span>
              )}
            </ReviewRow>
          ))
        )}
        <ReviewRow label={t('profile.activities.total')}>
          <span className="font-mono">{profile?.volunteer_hours ?? 0}</span>
        </ReviewRow>
      </ReviewGroup>
    </div>
  )
}

export default function OnboardingPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { profile, loading, refresh } = useProfile()
  usePageTitle(t('actions.getStarted'))

  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)

  const basicsRef = useRef<SectionHandle>(null)
  const academicsRef = useRef<SectionHandle>(null)
  const activitiesRef = useRef<SectionHandle>(null)

  if (loading) {
    return <Loading full />
  }

  if (profile?.onboarding_completed) {
    return <Navigate to="/app" replace />
  }

  const currentRef =
    step === 1 ? basicsRef : step === 2 ? academicsRef : activitiesRef

  const handleContinue = async () => {
    setSaving(true)
    try {
      if (step === 4) {
        await updateMyProfile({ onboarding_completed: true })
        await refresh()
        navigate('/app', { replace: true })
        return
      }
      const ok = await currentRef.current?.save()
      if (ok) setStep((value) => value + 1)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="flex h-16 items-center justify-between border-b border-border px-6">
        <Link to="/" className="font-display text-lg font-bold tracking-[-0.02em]">
          GrantHelper
        </Link>
        <LanguageSwitcher />
      </header>

      <main className="mx-auto max-w-[640px] px-6 py-10">
        <ProgressHeader step={step} />

        <div className="mt-10">
          {step === 1 && <BasicsSection ref={basicsRef} />}
          {step === 2 && <AcademicsSection ref={academicsRef} />}
          {step === 3 && <ActivitiesSection ref={activitiesRef} />}
          {step === 4 && <ReviewStep onEdit={setStep} />}
        </div>

        <div className="mt-10 flex items-center justify-between gap-3">
          <div className="flex gap-2">
            {step > 1 && (
              <Button
                variant="secondary"
                size="md"
                onClick={() => setStep((value) => value - 1)}
              >
                {t('onboarding.back')}
              </Button>
            )}
            {(step === 2 || step === 3) && (
              <Button
                variant="ghost"
                size="md"
                onClick={() => setStep((value) => value + 1)}
              >
                {t('onboarding.skip')}
              </Button>
            )}
          </div>
          <Button
            variant="primary"
            size="md"
            loading={saving}
            onClick={handleContinue}
          >
            {step === 4 ? t('onboarding.finish') : t('onboarding.continue')}
          </Button>
        </div>
      </main>
    </div>
  )
}
