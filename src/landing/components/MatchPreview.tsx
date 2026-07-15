import { useTranslation } from 'react-i18next'
import { Badge, Card } from '../../frontend/components/ui'
import { cn } from '../../lib/cn'

// Grant names stay untranslated; everything else goes through i18n.
const rows = [
  { name: 'Orange Knowledge Programme', providerKey: 'landing.matchPreview.providers.nuffic', score: 92 },
  { name: 'Chevening Scholarship', providerKey: 'landing.matchPreview.providers.chevening', score: 87 },
  { name: 'DAAD EPOS', providerKey: 'landing.matchPreview.providers.daad', score: 74 },
]

export default function MatchPreview() {
  const { t } = useTranslation()

  return (
    <Card className="p-0!">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <span className="font-display font-medium">
          {t('landing.matchPreview.title')}
        </span>
        <Badge variant="muted">{t('landing.matchPreview.count')}</Badge>
      </div>

      <ul>
        {rows.map((row, index) => (
          <li
            key={row.name}
            className={cn(
              'flex items-center justify-between px-5 py-4',
              index > 0 && 'border-t border-border',
            )}
          >
            <div className="min-w-0">
              <div className="truncate font-medium">{row.name}</div>
              <div className="text-[13px] text-muted">{t(row.providerKey)}</div>
            </div>
            <div className="pl-4 font-mono text-sm tabular-nums">
              {row.score}%
            </div>
          </li>
        ))}
      </ul>

      <div className="border-t border-border px-5 py-3 font-mono text-[12px] text-muted">
        {t('landing.matchPreview.basis')}
      </div>
    </Card>
  )
}
