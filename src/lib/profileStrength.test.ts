import { describe, expect, it } from 'vitest'
import type { Profile, TestScore, TestType } from '../backend/types/database'
import { computeProfileStrength } from './profileStrength'

function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'user-1',
    full_name: null,
    citizenship: null,
    current_level: null,
    target_level: null,
    field_of_study: null,
    gpa: null,
    gpa_scale: 4,
    volunteer_hours: 0,
    date_of_birth: null,
    ui_language: 'en',
    onboarding_completed: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

function makeScore(test_type: TestType): TestScore {
  return {
    id: `score-${test_type}`,
    user_id: 'user-1',
    test_type,
    score: 100,
    taken_at: null,
    created_at: '2026-01-01T00:00:00Z',
  }
}

const fullBasics = {
  full_name: 'Test User',
  citizenship: 'Kazakhstan',
  date_of_birth: '2000-01-01',
  current_level: 'bachelor' as const,
  target_level: 'master' as const,
  field_of_study: 'Computer Science',
}

describe('computeProfileStrength', () => {
  it('empty profile scores 0 and lists all missing items', () => {
    const result = computeProfileStrength(makeProfile(), [], 0)
    expect(result.percent).toBe(0)
    expect(result.missing.map((m) => m.key)).toEqual([
      'basics',
      'gpa',
      'english_test',
      'academic_test',
      'activities',
    ])
  })

  it('a fully complete profile scores 100 with nothing missing', () => {
    const profile = makeProfile({ ...fullBasics, gpa: 3.8 })
    const scores = [makeScore('IELTS'), makeScore('SAT')]
    const result = computeProfileStrength(profile, scores, 1)
    expect(result.percent).toBe(100)
    expect(result.missing).toEqual([])
  })

  it('partial basics gives proportional credit', () => {
    // 3 of 6 basics filled -> 15 of the 30 point basics weight
    const profile = makeProfile({
      full_name: 'Test User',
      citizenship: 'Kazakhstan',
      date_of_birth: '2000-01-01',
    })
    const result = computeProfileStrength(profile, [], 0)
    expect(result.percent).toBe(15)
    expect(result.missing).toContainEqual({ key: 'basics' })
  })

  it('detects an English test across the accepted test types', () => {
    const base = makeProfile()
    expect(
      computeProfileStrength(base, [makeScore('DUOLINGO')], 0).missing,
    ).not.toContainEqual({ key: 'english_test' })
    expect(
      computeProfileStrength(base, [makeScore('TOEFL')], 0).missing,
    ).not.toContainEqual({ key: 'english_test' })
    // an academic test does not count as an English test
    expect(
      computeProfileStrength(base, [makeScore('SAT')], 0).missing,
    ).toContainEqual({ key: 'english_test' })
  })

  it('applies the activities threshold', () => {
    const base = makeProfile()
    expect(computeProfileStrength(base, [], 0).percent).toBe(0)
    expect(computeProfileStrength(base, [], 1).percent).toBe(20)
    expect(computeProfileStrength(base, [], 1).missing).not.toContainEqual({
      key: 'activities',
    })
  })
})
