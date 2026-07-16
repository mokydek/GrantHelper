import type { Profile, TestScore, TestType } from '../backend/types/database'

export type MissingKey =
  | 'basics'
  | 'gpa'
  | 'english_test'
  | 'academic_test'
  | 'activities'

export interface MissingItem {
  key: MissingKey
}

export interface ProfileStrength {
  percent: number
  missing: MissingItem[]
}

const ENGLISH_TESTS: TestType[] = ['IELTS', 'TOEFL', 'DUOLINGO']
const ACADEMIC_TESTS: TestType[] = ['SAT', 'ACT', 'NUET', 'GRE', 'GMAT']

export function computeProfileStrength(
  profile: Profile,
  scores: TestScore[],
  activitiesCount: number,
): ProfileStrength {
  const basicsFields = [
    profile.full_name,
    profile.citizenship,
    profile.date_of_birth,
    profile.current_level,
    profile.target_level,
    profile.field_of_study,
  ]
  const filledBasics = basicsFields.filter(
    (value) => value != null && String(value).trim() !== '',
  ).length
  const basicsScore = (filledBasics / basicsFields.length) * 30

  const hasGpa = profile.gpa != null
  const hasEnglish = scores.some((score) =>
    ENGLISH_TESTS.includes(score.test_type),
  )
  const hasAcademic = scores.some((score) =>
    ACADEMIC_TESTS.includes(score.test_type),
  )
  const hasActivity = activitiesCount > 0

  const percent = Math.round(
    basicsScore +
      (hasGpa ? 20 : 0) +
      (hasEnglish ? 20 : 0) +
      (hasAcademic ? 10 : 0) +
      (hasActivity ? 20 : 0),
  )

  const missing: MissingItem[] = []
  if (filledBasics < basicsFields.length) missing.push({ key: 'basics' })
  if (!hasGpa) missing.push({ key: 'gpa' })
  if (!hasEnglish) missing.push({ key: 'english_test' })
  if (!hasAcademic) missing.push({ key: 'academic_test' })
  if (!hasActivity) missing.push({ key: 'activities' })

  return { percent, missing }
}
