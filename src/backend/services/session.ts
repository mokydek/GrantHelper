import { supabase } from '../supabaseClient'

// Returns the current authenticated user id (read from the local session, no
// network round trip). Throws when no user is signed in.
export async function getUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  const id = data.session?.user.id
  if (!id) throw new Error('No authenticated user')
  return id
}
