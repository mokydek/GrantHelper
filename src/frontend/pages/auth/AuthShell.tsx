import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../../components/ui'

interface AuthShellProps {
  children: ReactNode
  footer: ReactNode
}

// Shared frame for the auth pages: white full height page, centered 400px
// column, wordmark linking home, a Card with the form and a muted link line.
export default function AuthShell({ children, footer }: AuthShellProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 py-12">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 text-center">
          <Link
            to="/"
            className="font-display text-2xl font-bold tracking-[-0.02em]"
          >
            GrantHelper
          </Link>
        </div>
        <Card className="space-y-5">{children}</Card>
        <p className="mt-6 text-center text-[13px] text-muted">{footer}</p>
      </div>
    </div>
  )
}
