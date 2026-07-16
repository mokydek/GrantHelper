import { useTranslation } from 'react-i18next'
import type { MatchStatus } from '../../lib/matching/types'
import { cn } from '../../lib/cn'

const STYLES: Record<MatchStatus, string> = {
  eligible: 'bg-fg text-bg border border-fg',
  borderline: 'bg-bg text-fg border border-fg',
  incomplete: 'bg-bg text-muted border border-border',
  not_eligible: 'bg-bg text-muted border border-transparent',
}

export default function StatusBadge({ status }: { status: MatchStatus }) {
  const { t } = useTranslation()
  const label = t(`grants.status.${status}`)
  return (
    <span
      title={label}
      className={cn(
        'inline-flex items-center rounded-base px-2 py-0.5 text-[11px] font-mono uppercase tracking-[0.05em]',
        STYLES[status],
      )}
    >
      {label}
    </span>
  )
}
