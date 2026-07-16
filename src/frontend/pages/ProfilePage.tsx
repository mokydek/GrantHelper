import { useRef, useState, type ReactElement, type Ref } from 'react'
import { useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'
import { Button, Card } from '../components/ui'
import BasicsSection from '../components/profile/BasicsSection'
import AcademicsSection from '../components/profile/AcademicsSection'
import ActivitiesSection from '../components/profile/ActivitiesSection'
import type { SectionHandle } from '../components/profile/shared'
import { usePageTitle } from '../../lib/usePageTitle'

function SavableSection({
  title,
  render,
}: {
  title: string
  render: (ref: Ref<SectionHandle>) => ReactElement
}) {
  const { t } = useTranslation()
  const ref = useRef<SectionHandle>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const ok = await ref.current?.save()
      if (ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="space-y-5">
      <h2 className="font-display text-xl font-bold">{title}</h2>
      {render(ref)}
      <div className="flex items-center gap-3 border-t border-border pt-4">
        <Button
          variant="primary"
          size="sm"
          loading={saving}
          onClick={handleSave}
        >
          {t('profile.save')}
        </Button>
        {saved && (
          <span className="inline-flex items-center gap-1 text-[13px] text-muted">
            <Check size={14} aria-hidden="true" />
            {t('profile.saved')}
          </span>
        )}
      </div>
    </Card>
  )
}

export default function ProfilePage() {
  const { t } = useTranslation()
  usePageTitle(t('profile.title'))

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-bold">{t('profile.title')}</h1>

      <div className="space-y-6">
        <SavableSection
          title={t('profile.sections.basics')}
          render={(ref) => <BasicsSection ref={ref} />}
        />
        <SavableSection
          title={t('profile.sections.academics')}
          render={(ref) => <AcademicsSection ref={ref} />}
        />
        <SavableSection
          title={t('profile.sections.activities')}
          render={(ref) => <ActivitiesSection ref={ref} />}
        />
      </div>
    </div>
  )
}
