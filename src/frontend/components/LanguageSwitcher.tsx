import { useTranslation } from 'react-i18next'
import { setLanguage, type UiLanguage } from '../../lib/i18n'
import { cn } from '../../lib/cn'

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const current = i18n.language.startsWith('ru') ? 'ru' : 'en'

  const item = (lang: UiLanguage, label: string) => (
    <button
      type="button"
      onClick={() => setLanguage(lang)}
      aria-pressed={current === lang}
      className={cn(
        'px-2 py-1 text-[13px] font-medium transition-colors',
        current === lang ? 'text-fg' : 'text-muted hover:text-fg',
      )}
    >
      {label}
    </button>
  )

  return (
    <div className="inline-flex items-center border border-border rounded-base">
      {item('en', 'EN')}
      <span aria-hidden="true" className="h-4 w-px bg-border" />
      {item('ru', 'RU')}
    </div>
  )
}
