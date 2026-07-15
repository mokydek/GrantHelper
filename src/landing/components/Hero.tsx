import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Badge, Button } from '../../frontend/components/ui'
import MatchPreview from './MatchPreview'

export default function Hero() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const scrollToHowItWorks = () => {
    document
      .getElementById('how-it-works')
      ?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="mx-auto max-w-[1120px] px-6 pt-12 pb-16 md:pt-16 md:pb-20">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="space-y-6">
          <Badge variant="default">{t('landing.hero.badge')}</Badge>
          <h1 className="font-display text-4xl font-bold leading-[1.04] sm:text-5xl lg:text-[56px]">
            {t('landing.hero.title')}
          </h1>
          <p className="max-w-xl text-lg text-muted">
            {t('landing.hero.subtitle')}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/signup')}
            >
              {t('actions.getStarted')}
            </Button>
            <Button variant="secondary" size="md" onClick={scrollToHowItWorks}>
              {t('landing.howItWorks.title')}
            </Button>
          </div>
        </div>

        <div className="lg:pl-4">
          <MatchPreview />
        </div>
      </div>
    </section>
  )
}
