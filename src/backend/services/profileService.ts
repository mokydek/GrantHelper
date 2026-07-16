import { supabase } from '../supabaseClient'
import { getUserId } from './session'
import type { Profile } from '../types/database'

export async function getMyProfile(): Promise<{ data: Profile | null }> {
  // RLS scopes the query to the current user's single row.
  const { data, error } = await supabase.from('profiles').select('*').maybeSingle()
  if (error) throw error
  return { data: data as Profile | null }
}

export async function updateMyProfile(
  patch: Partial<Profile>,
): Promise<{ data: Profile }> {
  const userId = await getUserId()
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return { data: data as Profile }
}
