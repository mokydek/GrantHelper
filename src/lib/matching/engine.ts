import type {
  Grant,
  Profile,
  TestScore,
  TestType,
} from '../../backend/types/database'
import type {
  CriterionResult,
  CriterionState,
  GrantMatch,
  MatchStatus,
} from './types'

const STATE_RANK: Record<CriterionState, number> = {
  met: 3,
  close: 2,
  failed: 1,
  unknown: 0,
}

const STATUS_ORDER: Record<MatchStatus, number> = {
  eligible: 0,
  borderline: 1,
  incomplete: 2,
  not_eligible: 3,
}

export function normalizeGpa(gpa: number, scale: number): number {
  return Math.round((gpa / scale) * 4 * 100) / 100
}

function findScore(scores: TestScore[], type: TestType): number | null {
  const match = scores.find((score) => score.test_type === type)
  return match ? match.score : null
}

function ageInYears(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth)
  const now = new Date()
  let age = now.getFullYear() - dob.getFullYear()
  const monthDelta = now.getMonth() - dob.getMonth()
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < dob.getDate())) {
    age -= 1
  }
  return age
}

// met if actual >= min, close if within `closeBelow` of min, failed otherwise.
function evaluateThreshold(
  actual: number,
  min: number,
  closeBelow: number,
): CriterionState {
  if (actual >= min) return 'met'
  if (actual >= min - closeBelow) return 'close'
  return 'failed'
}

function bestState(states: CriterionState[]): CriterionState {
  return states.reduce<CriterionState>(
    (best, state) => (STATE_RANK[state] > STATE_RANK[best] ? state : best),
    'unknown',
  )
}

export function evaluateGrant(
  profile: Profile,
  scores: TestScore[],
  grant: Grant,
): GrantMatch {
  const criteria: CriterionResult[] = []

  // 1. degree_level (always present, hard)
  {
    const target = profile.target_level
    let state: CriterionState
    if (target == null) state = 'unknown'
    else if (grant.degree_levels.includes(target)) state = 'met'
    else state = 'failed'
    criteria.push({
      key: 'degree_level',
      state,
      required: grant.degree_levels.join(', '),
      actual: target,
    })
  }

  // 2. citizenship (hard, only when a list is set)
  if (grant.allowed_citizenships != null) {
    const citizenship = profile.citizenship
    let state: CriterionState
    if (citizenship == null) state = 'unknown'
    else if (grant.allowed_citizenships.includes(citizenship)) state = 'met'
    else state = 'failed'
    criteria.push({
      key: 'citizenship',
      state,
      required: grant.allowed_citizenships.join(', '),
      actual: citizenship,
    })
  }

  // 3. age (hard, only when a bound is set)
  if (grant.age_min != null || grant.age_max != null) {
    let state: CriterionState
    let actual: string | null
    if (profile.date_of_birth == null) {
      state = 'unknown'
      actual = null
    } else {
      const age = ageInYears(profile.date_of_birth)
      actual = String(age)
      const okMin = grant.age_min == null || age >= grant.age_min
      const okMax = grant.age_max == null || age <= grant.age_max
      state = okMin && okMax ? 'met' : 'failed'
    }
    const required =
      grant.age_min != null && grant.age_max != null
        ? `${grant.age_min} to ${grant.age_max}`
        : grant.age_min != null
          ? `${grant.age_min} or older`
          : `${grant.age_max} or younger`
    criteria.push({ key: 'age', state, required, actual })
  }

  // 4. gpa (only when min_gpa is set)
  if (grant.min_gpa != null) {
    let state: CriterionState
    let actual: string | null
    if (profile.gpa == null) {
      state = 'unknown'
      actual = null
    } else {
      const normalized = normalizeGpa(profile.gpa, profile.gpa_scale ?? 4)
      actual = String(normalized)
      if (normalized >= grant.min_gpa) state = 'met'
      else if (normalized >= grant.min_gpa - 0.2) state = 'close'
      else state = 'failed'
    }
    criteria.push({
      key: 'gpa',
      state,
      required: String(grant.min_gpa),
      actual,
    })
  }

  // 5. english (OR requirement, only when an IELTS or TOEFL minimum is set)
  if (grant.min_ielts != null || grant.min_toefl != null) {
    const ielts = findScore(scores, 'IELTS')
    const toefl = findScore(scores, 'TOEFL')
    const states: CriterionState[] = []
    if (grant.min_ielts != null && ielts != null) {
      states.push(evaluateThreshold(ielts, grant.min_ielts, 0.5))
    }
    if (grant.min_toefl != null && toefl != null) {
      states.push(evaluateThreshold(toefl, grant.min_toefl, 8))
    }
    const state = states.length === 0 ? 'unknown' : bestState(states)

    const requiredParts: string[] = []
    if (grant.min_ielts != null) requiredParts.push(`IELTS ${grant.min_ielts}`)
    if (grant.min_toefl != null) requiredParts.push(`TOEFL ${grant.min_toefl}`)

    const actualParts: string[] = []
    if (ielts != null) actualParts.push(`IELTS ${ielts}`)
    if (toefl != null) actualParts.push(`TOEFL ${toefl}`)

    criteria.push({
      key: 'english',
      state,
      required: requiredParts.join(' or '),
      actual: actualParts.length > 0 ? actualParts.join(', ') : null,
    })
  }

  // 6. sat (only when min_sat is set)
  if (grant.min_sat != null) {
    const sat = findScore(scores, 'SAT')
    let state: CriterionState
    let actual: string | null
    if (sat == null) {
      state = 'unknown'
      actual = null
    } else {
      state = evaluateThreshold(sat, grant.min_sat, 100)
      actual = String(sat)
    }
    criteria.push({
      key: 'sat',
      state,
      required: String(grant.min_sat),
      actual,
    })
  }

  // 7. volunteer_hours (only when min set; never unknown, field defaults to 0)
  if (grant.min_volunteer_hours != null) {
    const hours = profile.volunteer_hours
    let state: CriterionState
    if (hours >= grant.min_volunteer_hours) state = 'met'
    else if (hours >= grant.min_volunteer_hours - 20) state = 'close'
    else state = 'failed'
    criteria.push({
      key: 'volunteer_hours',
      state,
      required: String(grant.min_volunteer_hours),
      actual: String(hours),
    })
  }

  const states = criteria.map((criterion) => criterion.state)
  let status: MatchStatus
  if (states.includes('failed')) status = 'not_eligible'
  else if (states.includes('close')) status = 'borderline'
  else if (states.includes('unknown')) status = 'incomplete'
  else status = 'eligible'

  const total = criteria.length
  const met = states.filter((state) => state === 'met').length
  const close = states.filter((state) => state === 'close').length
  const unknown = states.filter((state) => state === 'unknown').length
  const score = Math.round((100 * (met + 0.5 * close + 0.25 * unknown)) / total)

  return {
    grant,
    status,
    score,
    criteria,
    requiredDocuments: {
      essay: grant.requires_essay,
      recommendation: grant.requires_recommendation,
    },
  }
}

export function computeMatches(
  profile: Profile,
  scores: TestScore[],
  grants: Grant[],
): GrantMatch[] {
  return grants
    .map((grant) => evaluateGrant(profile, scores, grant))
    .sort((a, b) => {
      if (STATUS_ORDER[a.status] !== STATUS_ORDER[b.status]) {
        return STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
      }
      if (a.score !== b.score) return b.score - a.score
      return a.grant.name.localeCompare(b.grant.name)
    })
}
