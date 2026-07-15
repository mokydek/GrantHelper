import { useTranslation } from 'react-i18next'

const steps = [
  {
    number: '01',
    titleKey: 'landing.howItWorks.step1.title',
    textKey: 'landing.howItWorks.step1.text',
  },
  {
    number: '02',
    titleKey: 'landing.howItWorks.step2.title',
    textKey: 'landing.howItWorks.step2.text',
  },
  {
    number: '03',
    titleKey: 'landing.howItWorks.step3.title',
    textKey: 'landing.howItWorks.step3.text',
  },
]

export default function HowItWorks() {
  const { t } = useTranslation()

  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 border-t border-border"
    >
      <div className="mx-auto max-w-[1120px] px-6 py-16 md:py-24">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">
          {t('landing.howItWorks.title')}
        </h2>

        <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {steps.map((step) => (
            <div key={step.number} className="space-y-3">
              <div className="font-mono text-2xl text-muted">{step.number}</div>
              <h3 className="font-display text-xl font-medium">
                {t(step.titleKey)}
              </h3>
              <p className="text-muted">{t(step.textKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
