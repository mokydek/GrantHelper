import { describe, expect, it } from 'vitest'
import type {
  Grant,
  Profile,
  TestScore,
  TestType,
} from '../../backend/types/database'
import { computeMatches, evaluateGrant, normalizeGpa } from './engine'
import type { CriterionKey } from './types'

function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'user-1',
    full_name: 'Test User',
    citizenship: 'Kazakhstan',
    current_level: 'bachelor',
    target_level: 'master',
    field_of_study: 'Computer Science',
    gpa: 3.8,
    gpa_scale: 4,
    volunteer_hours: 100,
    date_of_birth: '2000-01-01',
    ui_language: 'en',
    onboarding_completed: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

function makeScore(
  test_type: TestType,
  score: number,
  overrides: Partial<TestScore> = {},
): TestScore {
  return {
    id: `score-${test_type}`,
    user_id: 'user-1',
    test_type,
    score,
    taken_at: null,
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

function makeGrant(overrides: Partial<Grant> = {}): Grant {
  return {
    id: 'grant-1',
    name: 'Grant',
    provider: 'Provider',
    description: 'Description',
    country: 'Germany',
    degree_levels: ['master'],
    fields_of_study: null,
    funding_type: 'full',
    amount_note: null,
    deadline: null,
    website_url: 'https://example.org',
    is_active: true,
    min_gpa: null,
    min_ielts: null,
    min_toefl: null,
    min_sat: null,
    requires_essay: false,
    requires_recommendation: false,
    min_volunteer_hours: null,
    allowed_citizenships: null,
    age_min: null,
    age_max: null,
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

const stateOf = (match: ReturnType<typeof evaluateGrant>, key: CriterionKey) =>
  match.criteria.find((criterion) => criterion.key === key)?.state

describe('normalizeGpa', () => {
  it('normalizes a 5.0 scale to the 4.0 scale', () => {
    expect(normalizeGpa(4.5, 5)).toBe(3.6)
  })
})

describe('evaluateGrant', () => {
  it('1. fully matching profile is eligible with score 100', () => {
    const grant = makeGrant({
      degree_levels: ['master'],
      min_gpa: 3.5,
      min_ielts: 6.5,
      min_sat: 1200,
      min_volunteer_hours: 50,
      allowed_citizenships: ['Kazakhstan'],
      age_min: 18,
      age_max: 40,
    })
    const profile = makeProfile({ gpa: 3.9, gpa_scale: 4, volunteer_hours: 100 })
    const scores = [makeScore('IELTS', 7.5), makeScore('SAT', 1400)]

    const match = evaluateGrant(profile, scores, grant)
    expect(match.status).toBe('eligible')
    expect(match.score).toBe(100)
  })

  it('2. normalized GPA 4.5 on a 5.0 scale meets a 3.5 minimum', () => {
    const grant = makeGrant({ min_gpa: 3.5 })
    const profile = makeProfile({ gpa: 4.5, gpa_scale: 5 })

    const match = evaluateGrant(profile, [], grant)
    expect(stateOf(match, 'gpa')).toBe('met')
  })

  it('3. GPA 0.1 below the requirement is close and overall borderline', () => {
    const grant = makeGrant({ min_gpa: 3.5 })
    const profile = makeProfile({ gpa: 3.4, gpa_scale: 4 })

    const match = evaluateGrant(profile, [], grant)
    expect(stateOf(match, 'gpa')).toBe('close')
    expect(match.status).toBe('borderline')
  })

  it('4. english OR logic: IELTS below but TOEFL above is met', () => {
    const grant = makeGrant({ min_ielts: 7, min_toefl: 90 })
    const scores = [makeScore('IELTS', 6.0), makeScore('TOEFL', 100)]

    const match = evaluateGrant(makeProfile(), scores, grant)
    expect(stateOf(match, 'english')).toBe('met')
  })

  it('5. english is unknown with no language test and overall incomplete', () => {
    const grant = makeGrant({ min_ielts: 6.5 })

    const match = evaluateGrant(makeProfile(), [], grant)
    expect(stateOf(match, 'english')).toBe('unknown')
    expect(match.status).toBe('incomplete')
  })

  it('6. citizenship outside the allowed list is not_eligible', () => {
    const grant = makeGrant({ allowed_citizenships: ['Germany'], min_gpa: 1 })
    const profile = makeProfile({ citizenship: 'Kazakhstan', gpa: 4, gpa_scale: 4 })

    const match = evaluateGrant(profile, [], grant)
    expect(stateOf(match, 'citizenship')).toBe('failed')
    expect(match.status).toBe('not_eligible')
  })

  it('7. age outside bounds is not_eligible; missing date_of_birth is unknown', () => {
    const grant = makeGrant({ age_min: 18, age_max: 25 })

    const tooOld = evaluateGrant(makeProfile({ date_of_birth: '1950-01-01' }), [], grant)
    expect(stateOf(tooOld, 'age')).toBe('failed')
    expect(tooOld.status).toBe('not_eligible')

    const noDob = evaluateGrant(makeProfile({ date_of_birth: null }), [], grant)
    expect(stateOf(noDob, 'age')).toBe('unknown')
    expect(noDob.status).toBe('incomplete')
  })

  it('8. SAT 60 points below the minimum is close', () => {
    const grant = makeGrant({ min_sat: 1300 })
    const scores = [makeScore('SAT', 1240)]

    const match = evaluateGrant(makeProfile(), scores, grant)
    expect(stateOf(match, 'sat')).toBe('close')
  })

  it('9. a grant with no optional requirements evaluates only degree_level', () => {
    const match = evaluateGrant(makeProfile(), [], makeGrant())
    expect(match.criteria).toHaveLength(1)
    expect(match.criteria[0].key).toBe('degree_level')
  })
})

describe('computeMatches', () => {
  it('10. sorts by status then score descending then name ascending', () => {
    const profile = makeProfile({
      target_level: 'master',
      citizenship: 'Kazakhstan',
      gpa: 3.8,
      gpa_scale: 4,
      volunteer_hours: 100,
    })
    const scores = [makeScore('SAT', 1250), makeScore('IELTS', 7)]

    const grants = [
      makeGrant({ id: 'not', name: 'Not', allowed_citizenships: ['Germany'] }),
      makeGrant({ id: 'inc', name: 'Inc', min_toefl: 90 }),
      makeGrant({ id: 'blow', name: 'Blow', min_gpa: 4.0 }),
      makeGrant({ id: 'bhigh', name: 'Bhigh', min_gpa: 3.5, min_sat: 1300 }),
      makeGrant({ id: 'zeta', name: 'Zeta', degree_levels: ['master'] }),
      makeGrant({ id: 'apple', name: 'Apple', degree_levels: ['master'] }),
    ]

    const result = computeMatches(profile, scores, grants)
    expect(result.map((match) => match.grant.name)).toEqual([
      'Apple',
      'Zeta',
      'Bhigh',
      'Blow',
      'Inc',
      'Not',
    ])
    expect(result.map((match) => match.status)).toEqual([
      'eligible',
      'eligible',
      'borderline',
      'borderline',
      'incomplete',
      'not_eligible',
    ])
    expect(result[2].score).toBeGreaterThan(result[3].score)
  })
})
