import { supabase } from '../supabaseClient'
import { getUserId } from './session'
import type { Activity, ActivityType } from '../types/database'

export interface ActivityInput {
  activity_type: ActivityType
  title: string
  organization?: string | null
  description?: string | null
  hours?: number | null
  started_at?: string | null
  ended_at?: string | null
}

export async function listMyActivities(): Promise<{ data: Activity[] }> {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return { data: (data ?? []) as Activity[] }
}

export async function createActivity(
  input: ActivityInput,
): Promise<{ data: Activity }> {
  const userId = await getUserId()
  const { data, error } = await supabase
    .from('activities')
    .insert({ user_id: userId, ...input })
    .select()
    .single()
  if (error) throw error
  await recalcVolunteerHours()
  return { data: data as Activity }
}

export async function updateActivity(
  id: string,
  patch: Partial<ActivityInput>,
): Promise<{ data: Activity }> {
  const { data, error } = await supabase
    .from('activities')
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  await recalcVolunteerHours()
  return { data: data as Activity }
}

export async function deleteActivity(id: string): Promise<{ data: null }> {
  const { error } = await supabase.from('activities').delete().eq('id', id)
  if (error) throw error
  await recalcVolunteerHours()
  return { data: null }
}

// Sums the hours of my volunteering activities and writes the total into
// profiles.volunteer_hours. Called after every activity create, update, delete.
export async function recalcVolunteerHours(): Promise<{ data: { total: number } }> {
  const userId = await getUserId()
  const { data, error } = await supabase
    .from('activities')
    .select('hours')
    .eq('activity_type', 'volunteering')
  if (error) throw error

  const rows = (data ?? []) as Array<{ hours: number | null }>
  const total = rows.reduce((sum, row) => sum + (row.hours ?? 0), 0)

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ volunteer_hours: total, updated_at: new Date().toISOString() })
    .eq('id', userId)
  if (updateError) throw updateError

  return { data: { total } }
}
