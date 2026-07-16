import type { Grant } from '../../backend/types/database'

export type CriterionState = 'met' | 'close' | 'failed' | 'unknown'

export type MatchStatus =
  | 'eligible'
  | 'borderline'
  | 'not_eligible'
  | 'incomplete'

export type CriterionKey =
  | 'degree_level'
  | 'citizenship'
  | 'age'
  | 'gpa'
  | 'english'
  | 'sat'
  | 'volunteer_hours'

export interface CriterionResult {
  key: CriterionKey
  state: CriterionState
  // Raw display values, e.g. "3.4" or "IELTS 6.5 or TOEFL 90". Translation of
  // the label happens in the UI via `key`; these strings stay as raw data.
  required: string
  actual: string | null
}

export interface GrantMatch {
  grant: Grant
  status: MatchStatus
  score: number
  criteria: CriterionResult[]
  requiredDocuments: { essay: boolean; recommendation: boolean }
}
