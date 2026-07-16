import { supabase } from '../supabaseClient'
import { getUserId } from './session'
import type { Application } from '../types/database'

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
  grant_name: string | null
}

export async function listMyApplications(): Promise<ApplicationWithGrant[]> {
  const { data, error } = await supabase
    .from('applications')
    .select('*, grants(name)')
    .order('created_at', { ascending: false })
  if (error) throw error

  const rows = (data ?? []) as Array<
    Application & { grants: { name: string } | null }
  >
  return rows.map(({ grants, ...rest }) => ({
    ...rest,
    grant_name: grants?.name ?? null,
  }))
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
