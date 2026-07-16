import type { TFunction } from 'i18next'
import { AuthServiceError } from '../../../backend/services/authService'

// Maps a thrown auth error to a friendly translated message. Raw Supabase
// error text is never shown to the user.
export function authErrorMessage(error: unknown, t: TFunction): string {
  if (error instanceof AuthServiceError) {
    switch (error.code) {
      case 'invalid_credentials':
        return t('auth.errors.invalidCredentials')
      case 'user_already_exists':
        return t('auth.errors.userExists')
      case 'weak_password':
        return t('auth.errors.weakPassword')
      default:
        return t('auth.errors.generic')
    }
  }
  return t('auth.errors.generic')
}
