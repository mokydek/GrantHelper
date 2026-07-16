import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Input, Label } from '../../components/ui'
import { signUpWithEmail } from '../../../backend/services/authService'
import { isValidEmail } from '../../../lib/validation'
import { authErrorMessage } from './authErrorMessage'
import AuthShell from './AuthShell'
import { usePageTitle } from '../../../lib/usePageTitle'

export default function SignupPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  usePageTitle(t('actions.signUp'))

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{
    fullName?: string
    email?: string
    password?: string
  }>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const next: { fullName?: string; email?: string; password?: string } = {}
    if (fullName.trim().length === 0) next.fullName = t('auth.errors.fullName')
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
      await signUpWithEmail(email.trim(), password, fullName.trim())
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
        <Link to="/login" className="transition-colors hover:text-fg">
          {t('auth.signupLink')}
        </Link>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="signup-name">{t('auth.fullNameLabel')}</Label>
          <Input
            id="signup-name"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            error={errors.fullName}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="signup-email">{t('auth.emailLabel')}</Label>
          <Input
            id="signup-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={errors.email}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="signup-password">{t('auth.passwordLabel')}</Label>
          <Input
            id="signup-password"
            type="password"
            autoComplete="new-password"
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
          {t('auth.signUpButton')}
        </Button>
      </form>
    </AuthShell>
  )
}
