import { supabase } from '../supabaseClient'
import { computeMatches } from '../../lib/matching/engine'
import type { GrantMatch } from '../../lib/matching/types'
import type { Grant, Profile, TestScore } from '../types/database'

export async function getMyMatches(): Promise<GrantMatch[]> {
  const [profileResult, scoresResult, grantsResult] = await Promise.all([
    supabase.from('profiles').select('*').maybeSingle(),
    supabase.from('test_scores').select('*'),
    supabase.from('grants').select('*').eq('is_active', true),
  ])

  if (profileResult.error) throw profileResult.error
  if (scoresResult.error) throw scoresResult.error
  if (grantsResult.error) throw grantsResult.error

  const profile = profileResult.data as Profile | null
  if (!profile) throw new Error('No profile found for the current user')

  const scores = (scoresResult.data ?? []) as TestScore[]
  const grants = (grantsResult.data ?? []) as Grant[]

  return computeMatches(profile, scores, grants)
}
