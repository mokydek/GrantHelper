import { Component, type ErrorInfo, type ReactNode } from 'react'
import i18n from '../../lib/i18n'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

// Last resort boundary around the whole app. Renders a recoverable screen and
// logs the error so it is not swallowed silently.
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled error in GrantHelper:', error, info)
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-fg">{i18n.t('errors.title')}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex h-10 items-center justify-center rounded-base border border-border bg-bg px-4 text-sm font-medium text-fg transition-colors hover:bg-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
        >
          {i18n.t('errors.reload')}
        </button>
      </div>
    )
  }
}
