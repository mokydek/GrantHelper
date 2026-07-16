import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2 } from 'lucide-react'
import { Button, Input, Label, Select } from '../ui'
import { useProfile } from '../../providers/ProfileProvider'
import { updateMyProfile } from '../../../backend/services/profileService'
import {
  deleteScore,
  listMyScores,
  upsertScore,
} from '../../../backend/services/testScoresService'
import type { TestScore, TestType } from '../../../backend/types/database'
import {
  GPA_SCALES,
  SCORE_RANGES,
  TEST_TYPES,
  validateScore,
  type SectionHandle,
} from './shared'

const AcademicsSection = forwardRef<SectionHandle>((_props, ref) => {
  const { t } = useTranslation()
  const { profile, refresh } = useProfile()

  const [gpa, setGpa] = useState(
    profile?.gpa != null ? String(profile.gpa) : '',
  )
  const [gpaScale, setGpaScale] = useState<number>(profile?.gpa_scale ?? 4)
  const [gpaError, setGpaError] = useState<string | undefined>()

  const [scores, setScores] = useState<TestScore[]>([])
  const [addType, setAddType] = useState<TestType>('SAT')
  const [addScore, setAddScore] = useState('')
  const [addDate, setAddDate] = useState('')
  const [scoreError, setScoreError] = useState<string | undefined>()
  const [adding, setAdding] = useState(false)

  const loadScores = useCallback(async () => {
    const { data } = await listMyScores()
    setScores(data)
  }, [])

  useEffect(() => {
    void loadScores()
  }, [loadScores])

  useImperativeHandle(ref, () => ({
    save: async () => {
      const trimmed = gpa.trim()
      if (trimmed.length > 0) {
        const value = Number(trimmed)
        if (Number.isNaN(value) || value <= 0) {
          setGpaError(t('profile.validation.gpaPositive'))
          return false
        }
        if (value > gpaScale) {
          setGpaError(t('profile.validation.gpaAboveScale'))
          return false
        }
      }
      setGpaError(undefined)
      await updateMyProfile({
        gpa: trimmed.length > 0 ? Number(trimmed) : null,
        gpa_scale: gpaScale,
      })
      await refresh()
      return true
    },
  }))

  const handleAddScore = async () => {
    const value = Number(addScore)
    const result = validateScore(addType, value)
    if (result !== 'ok') {
      if (addType === 'OTHER') {
        setScoreError(t('profile.validation.positive'))
      } else if (result === 'step') {
        setScoreError(t('profile.validation.scoreStep'))
      } else {
        setScoreError(
          t('profile.validation.scoreRange', {
            min: SCORE_RANGES[addType].min,
            max: SCORE_RANGES[addType].max,
          }),
        )
      }
      return
    }
    setScoreError(undefined)
    setAdding(true)
    try {
      await upsertScore({
        test_type: addType,
        score: value,
        taken_at: addDate || null,
      })
      setAddScore('')
      setAddDate('')
      await loadScores()
    } finally {
      setAdding(false)
    }
  }

  const handleDeleteScore = async (id: string) => {
    await deleteScore(id)
    await loadScores()
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="academics-gpa">{t('profile.fields.gpa')}</Label>
          <Input
            id="academics-gpa"
            type="number"
            inputMode="decimal"
            step="0.01"
            value={gpa}
            onChange={(event) => setGpa(event.target.value)}
            error={gpaError}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="academics-scale">{t('profile.fields.gpaScale')}</Label>
          <Select
            id="academics-scale"
            value={String(gpaScale)}
            onChange={(event) => setGpaScale(Number(event.target.value))}
          >
            {GPA_SCALES.map((scale) => (
              <option key={scale} value={scale}>
                {scale === 100 ? '100' : scale.toFixed(1)}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <Label>{t('profile.tests.heading')}</Label>

        {scores.length > 0 && (
          <ul className="divide-y divide-border border border-border rounded-base">
            {scores.map((score) => (
              <li
                key={score.id}
                className="flex items-center gap-3 px-4 py-3"
              >
                <span className="w-16 font-mono text-sm tabular-nums">
                  {score.score}
                </span>
                <span className="flex-1 text-sm">{score.test_type}</span>
                {score.taken_at && (
                  <span className="font-mono text-[12px] text-muted">
                    {score.taken_at}
                  </span>
                )}
                <button
                  type="button"
                  aria-label={t('profile.actions.delete')}
                  onClick={() => handleDeleteScore(score.id)}
                  className="text-muted transition-colors hover:text-fg"
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-start">
          <Select
            aria-label={t('profile.tests.type')}
            value={addType}
            onChange={(event) => setAddType(event.target.value as TestType)}
          >
            {TEST_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
          <Input
            type="number"
            inputMode="decimal"
            aria-label={t('profile.tests.score')}
            placeholder={t('profile.tests.score')}
            value={addScore}
            onChange={(event) => setAddScore(event.target.value)}
            error={scoreError}
          />
          <Input
            type="date"
            aria-label={t('profile.tests.date')}
            value={addDate}
            onChange={(event) => setAddDate(event.target.value)}
          />
          <Button
            type="button"
            variant="secondary"
            size="md"
            loading={adding}
            onClick={handleAddScore}
          >
            <Plus size={16} aria-hidden="true" />
            {t('profile.tests.add')}
          </Button>
        </div>
      </div>
    </div>
  )
})

AcademicsSection.displayName = 'AcademicsSection'

export default AcademicsSection
