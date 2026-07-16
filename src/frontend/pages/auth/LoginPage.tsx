import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Input, Label } from '../../components/ui'
import { signInWithEmail } from '../../../backend/services/authService'
import { isValidEmail } from '../../../lib/validation'
import { authErrorMessage } from './authErrorMessage'
import AuthShell from './AuthShell'
import { usePageTitle } from '../../../lib/usePageTitle'

export default function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  usePageTitle(t('actions.signIn'))

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const next: { email?: string; password?: string } = {}
    if (!isValidEmail(email)) next.email = t('auth.errors.email')
    if (password.length < 8) next.password = t('auth.errors.password')
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)
    if (!validate()) return

    setLoading(true)
    try {
      await signInWithEmail(email.trim(), password)
      navigate('/app', { replace: true })
    } catch (error) {
      setFormError(authErrorMessage(error, t))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      footer={
        <Link to="/signup" className="transition-colors hover:text-fg">
          {t('auth.loginLink')}
        </Link>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="login-email">{t('auth.emailLabel')}</Label>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={errors.email}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="login-password">{t('auth.passwordLabel')}</Label>
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={errors.password}
          />
        </div>

        {formError && <p className="text-[13px] text-fg">{formError}</p>}

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full"
          loading={loading}
        >
          {t('auth.signInButton')}
        </Button>
      </form>
    </AuthShell>
  )
}
