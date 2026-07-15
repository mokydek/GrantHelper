import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../components/LanguageSwitcher'
import {
  Badge,
  Button,
  Card,
  Input,
  Label,
  Select,
  Textarea,
} from '../components/ui'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-[11px] font-mono uppercase tracking-[0.05em] text-muted">
        {title}
      </h2>
      {children}
    </section>
  )
}

export default function UiKitPage() {
  const { t } = useTranslation()

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <header className="flex items-start justify-between gap-6 border-b border-border pb-8">
        <div className="space-y-2">
          <h1 className="text-3xl">GrantHelper UI Kit</h1>
          <p className="text-muted">{t('app.tagline')}</p>
        </div>
        <LanguageSwitcher />
      </header>

      <div className="mt-12 space-y-12">
        <Section title="Buttons">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" size="md">
              Primary
            </Button>
            <Button variant="secondary" size="md">
              Secondary
            </Button>
            <Button variant="ghost" size="md">
              Ghost
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" size="sm">
              Primary
            </Button>
            <Button variant="secondary" size="sm">
              Secondary
            </Button>
            <Button variant="ghost" size="sm">
              Ghost
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" loading>
              Loading
            </Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
          </div>
        </Section>

        <Section title="Form controls">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="uikit-name">Full name</Label>
              <Input id="uikit-name" placeholder="Ada Lovelace" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="uikit-gpa">GPA</Label>
              <Input
                id="uikit-gpa"
                defaultValue="9.9"
                error="Value is out of range"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="uikit-level">Target level</Label>
              <Select id="uikit-level" defaultValue="master">
                <option value="bachelor">Bachelor</option>
                <option value="master">Master</option>
                <option value="phd">PhD</option>
                <option value="exchange">Exchange</option>
                <option value="summer_school">Summer school</option>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="uikit-essay">Motivation</Label>
              <Textarea
                id="uikit-essay"
                rows={4}
                placeholder="Tell us why this grant fits you"
              />
            </div>
          </div>
        </Section>

        <Section title="Card">
          <Card className="space-y-2">
            <h3 className="text-lg">DAAD Scholarship</h3>
            <p className="text-sm text-muted">
              Full funding for a master degree in Germany. Deadline in autumn.
            </p>
            <div className="flex gap-2 pt-2">
              <Badge>Full</Badge>
              <Badge variant="muted">Master</Badge>
            </div>
          </Card>
        </Section>

        <Section title="Badges">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="default">Default</Badge>
            <Badge variant="muted">Muted</Badge>
          </div>
        </Section>
      </div>
    </div>
  )
}
