import type {
  ActivityType,
  CurrentLevel,
  DegreeLevel,
  TestType,
} from '../../../backend/types/database'

// Imperative handle every section exposes so a wizard step or a profile card
// can trigger a save and learn whether it succeeded.
export interface SectionHandle {
  save: () => Promise<boolean>
}

export const COUNTRIES = [
  'Kazakhstan',
  'Uzbekistan',
  'Kyrgyzstan',
  'Russia',
  'Ukraine',
  'Turkey',
  'India',
  'China',
  'Other',
] as const

export const CURRENT_LEVELS: CurrentLevel[] = [
  'high_school',
  'bachelor',
  'master',
  'phd',
]

export const TARGET_LEVELS: DegreeLevel[] = [
  'bachelor',
  'master',
  'phd',
  'exchange',
  'summer_school',
]

export const TEST_TYPES: TestType[] = [
  'SAT',
  'IELTS',
  'TOEFL',
  'ACT',
  'GRE',
  'GMAT',
  'DUOLINGO',
  'NUET',
  'OTHER',
]

export const ACTIVITY_TYPES: ActivityType[] = [
  'volunteering',
  'project',
  'work',
  'award',
  'olympiad',
  'leadership',
  'research',
  'other',
]

export const GPA_SCALES = [4, 5, 100] as const

export interface ScoreRange {
  min: number
  max: number
  step: number | null
}

export const SCORE_RANGES: Record<TestType, ScoreRange> = {
  SAT: { min: 400, max: 1600, step: null },
  IELTS: { min: 0, max: 9, step: 0.5 },
  TOEFL: { min: 0, max: 120, step: null },
  ACT: { min: 1, max: 36, step: null },
  GRE: { min: 260, max: 340, step: null },
  GMAT: { min: 200, max: 800, step: null },
  DUOLINGO: { min: 10, max: 160, step: null },
  NUET: { min: 0, max: 240, step: null },
  OTHER: { min: 0, max: Number.POSITIVE_INFINITY, step: null },
}

export type ScoreValidation = 'ok' | 'range' | 'step'

export function validateScore(type: TestType, score: number): ScoreValidation {
  if (Number.isNaN(score)) return 'range'
  if (type === 'OTHER') return score > 0 ? 'ok' : 'range'

  const range = SCORE_RANGES[type]
  if (score < range.min || score > range.max) return 'range'
  if (range.step) {
    const steps = score / range.step
    if (Math.abs(steps - Math.round(steps)) > 1e-9) return 'step'
  }
  return 'ok'
}
