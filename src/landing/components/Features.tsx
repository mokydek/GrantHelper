import type { LucideIcon } from 'lucide-react'
import { CalendarClock, FolderOpen, GraduationCap, Target } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '../../frontend/components/ui'

const features: Array<{ Icon: LucideIcon; titleKey: string; textKey: string }> =
  [
    {
      Icon: GraduationCap,
      titleKey: 'landing.features.profile.title',
      textKey: 'landing.features.profile.text',
    },
    {
      Icon: Target,
      titleKey: 'landing.features.eligibility.title',
      textKey: 'landing.features.eligibility.text',
    },
    {
      Icon: FolderOpen,
      titleKey: 'landing.features.documents.title',
      textKey: 'landing.features.documents.text',
    },
    {
      Icon: CalendarClock,
      titleKey: 'landing.features.tracker.title',
      textKey: 'landing.features.tracker.text',
    },
  ]

export default function Features() {
  const { t } = useTranslation()

  return (
    <section className="mx-auto max-w-[1120px] px-6 py-16 md:py-24">
      <div className="grid gap-4 sm:grid-cols-2">
        {features.map(({ Icon, titleKey, textKey }) => (
          <Card key={titleKey} className="space-y-3">
            <Icon size={20} className="text-fg" aria-hidden="true" />
            <h3 className="font-display text-lg font-medium">{t(titleKey)}</h3>
            <p className="text-muted">{t(textKey)}</p>
          </Card>
        ))}
      </div>
    </section>
  )
}
