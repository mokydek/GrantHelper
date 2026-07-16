import { supabase } from '../supabaseClient'
import { getUserId } from './session'
import type { TestScore, TestType } from '../types/database'

export interface UpsertScoreInput {
  test_type: TestType
  score: number
  taken_at?: string | null
}

export async function listMyScores(): Promise<{ data: TestScore[] }> {
  const { data, error } = await supabase
    .from('test_scores')
    .select('*')
    .order('test_type', { ascending: true })
  if (error) throw error
  return { data: (data ?? []) as TestScore[] }
}

// Upserts on the (user_id, test_type) unique constraint, so adding a type that
// already exists replaces the existing row.
export async function upsertScore(
  input: UpsertScoreInput,
): Promise<{ data: TestScore }> {
  const userId = await getUserId()
  const { data, error } = await supabase
    .from('test_scores')
    .upsert(
      {
        user_id: userId,
        test_type: input.test_type,
        score: input.score,
        taken_at: input.taken_at ?? null,
      },
      { onConflict: 'user_id,test_type' },
    )
    .select()
    .single()
  if (error) throw error
  return { data: data as TestScore }
}

export async function deleteScore(id: string): Promise<{ data: null }> {
  const { error } = await supabase.from('test_scores').delete().eq('id', id)
  if (error) throw error
  return { data: null }
}
