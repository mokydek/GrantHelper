// TypeScript types mirroring the GrantHelper database schema.
// See supabase/migrations/0001_initial_schema.sql. Postgres text[] -> string[],
// numeric -> number, timestamptz and date -> string, nullable columns -> `| null`.

// Union string literal types (mirror the check constraints in the schema)
export type CurrentLevel = 'high_school' | 'bachelor' | 'master' | 'phd'

export type DegreeLevel =
  | 'bachelor'
  | 'master'
  | 'phd'
  | 'exchange'
  | 'summer_school'

export type TestType =
  | 'SAT'
  | 'IELTS'
  | 'TOEFL'
  | 'ACT'
  | 'GRE'
  | 'GMAT'
  | 'DUOLINGO'
  | 'NUET'
  | 'OTHER'

export type ActivityType =
  | 'volunteering'
  | 'project'
  | 'work'
  | 'award'
  | 'olympiad'
  | 'leadership'
  | 'research'
  | 'other'

export type DocType =
  | 'essay'
  | 'motivation_letter'
  | 'recommendation_letter'
  | 'transcript'
  | 'cv'
  | 'passport'
  | 'certificate'
  | 'other'

export type DocumentStatus = 'draft' | 'ready'

export type FundingType = 'full' | 'partial' | 'one_time'

export type ApplicationStatus =
  | 'planned'
  | 'in_progress'
  | 'submitted'
  | 'accepted'
  | 'rejected'

// profiles
export interface Profile {
  id: string
  full_name: string | null
  citizenship: string | null
  current_level: CurrentLevel | null
  target_level: DegreeLevel | null
  field_of_study: string | null
  gpa: number | null
  gpa_scale: number | null
  volunteer_hours: number
  date_of_birth: string | null
  ui_language: 'en' | 'ru'
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

// test_scores
export interface TestScore {
  id: string
  user_id: string
  test_type: TestType
  score: number
  taken_at: string | null
  created_at: string
}

// activities
export interface Activity {
  id: string
  user_id: string
  activity_type: ActivityType
  title: string
  organization: string | null
  description: string | null
  hours: number | null
  started_at: string | null
  ended_at: string | null
  created_at: string
}

// documents
export interface DocumentRecord {
  id: string
  user_id: string
  doc_type: DocType
  title: string
  content: string | null
  storage_path: string | null
  status: DocumentStatus
  created_at: string
  updated_at: string
}

// grants
export interface Grant {
  id: string
  name: string
  provider: string
  description: string
  country: string
  degree_levels: string[]
  fields_of_study: string[] | null
  funding_type: FundingType
  amount_note: string | null
  deadline: string | null
  website_url: string
  is_active: boolean
  min_gpa: number | null
  min_ielts: number | null
  min_toefl: number | null
  min_sat: number | null
  requires_essay: boolean
  requires_recommendation: boolean
  min_volunteer_hours: number | null
  allowed_citizenships: string[] | null
  age_min: number | null
  age_max: number | null
  created_at: string
}

// applications
export interface Application {
  id: string
  user_id: string
  grant_id: string
  status: ApplicationStatus
  notes: string | null
  created_at: string
  updated_at: string
}
