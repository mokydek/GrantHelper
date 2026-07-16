import { supabase } from '../supabaseClient'
import { getUserId } from './session'
import type { Application, ApplicationStatus } from '../types/database'

export type ApplicationErrorCode = 'already_exists' | 'unknown'

export class ApplicationError extends Error {
  code: ApplicationErrorCode

  constructor(code: ApplicationErrorCode, message: string) {
    super(message)
    this.name = 'ApplicationError'
    this.code = code
  }
}

export interface ApplicationWithGrant extends Application {
  grant: {
    id: string
    name: string
    provider: string
    country: string
    deadline: string | null
  } | null
}

export async function listMyApplications(): Promise<ApplicationWithGrant[]> {
  const { data, error } = await supabase
    .from('applications')
    .select('*, grant:grants(id, name, provider, country, deadline)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as ApplicationWithGrant[]
}

export async function createApplication(
  grantId: string,
): Promise<{ data: Application }> {
  const userId = await getUserId()
  const { data, error } = await supabase
    .from('applications')
    .insert({ user_id: userId, grant_id: grantId })
    .select()
    .single()
  if (error) {
    // 23505 is the Postgres unique_violation code (user_id, grant_id).
    if (error.code === '23505') {
      throw new ApplicationError('already_exists', error.message)
    }
    throw error
  }
  return { data: data as Application }
}

export async function updateApplication(
  id: string,
  patch: { status?: ApplicationStatus; notes?: string | null },
): Promise<{ data: Application }> {
  const { data, error } = await supabase
    .from('applications')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return { data: data as Application }
}

export async function deleteApplication(id: string): Promise<{ data: null }> {
  const { error } = await supabase.from('applications').delete().eq('id', id)
  if (error) throw error
  return { data: null }
}

export async function getMyApplicationByGrantId(
  grantId: string,
): Promise<Application | null> {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('grant_id', grantId)
    .maybeSingle()
  if (error) throw error
  return data as Application | null
}
