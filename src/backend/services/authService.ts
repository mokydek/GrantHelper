import type { AuthError, Session, User } from '@supabase/supabase-js'
import { supabase } from '../supabaseClient'

// Re-export the Supabase auth types so the frontend never imports the SDK.
export type { Session, User }

export type AuthErrorCode =
  | 'invalid_credentials'
  | 'user_already_exists'
  | 'weak_password'
  | 'unknown'

// Typed error thrown by every service function. Carries a normalized code so
// the UI can map it to a friendly translated message without seeing raw text.
export class AuthServiceError extends Error {
  code: AuthErrorCode

  constructor(code: AuthErrorCode, message: string) {
    super(message)
    this.name = 'AuthServiceError'
    this.code = code
  }
}

function mapAuthError(error: AuthError): AuthServiceError {
  const code = error.code ?? ''
  const message = error.message ?? ''
  const lower = message.toLowerCase()

  if (code === 'invalid_credentials' || lower.includes('invalid login credentials')) {
    return new AuthServiceError('invalid_credentials', message)
  }
  if (
    code === 'user_already_exists' ||
    code === 'email_exists' ||
    lower.includes('already registered') ||
    lower.includes('already exists')
  ) {
    return new AuthServiceError('user_already_exists', message)
  }
  if (code === 'weak_password' || lower.includes('password should be') || lower.includes('weak password')) {
    return new AuthServiceError('weak_password', message)
  }
  return new AuthServiceError('unknown', message)
}

export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string,
): Promise<{ data: { user: User | null; session: Session | null } }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })
  if (error) throw mapAuthError(error)
  return { data }
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<{ data: { user: User; session: Session } }> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw mapAuthError(error)
  return { data }
}

export async function signOut(): Promise<{ data: null }> {
  const { error } = await supabase.auth.signOut()
  if (error) throw mapAuthError(error)
  return { data: null }
}

export async function getCurrentSession(): Promise<{
  data: { session: Session | null }
}> {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw mapAuthError(error)
  return { data }
}

export function subscribeToAuth(
  callback: (session: Session | null) => void,
): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session)
  })
  return () => data.subscription.unsubscribe()
}
