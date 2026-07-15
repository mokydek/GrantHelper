import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '../../frontend/components/ui'

export default function InvertedCta() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <section className="bg-fg text-bg">
      <div className="mx-auto max-w-[1120px] px-6 py-20 text-center md:py-24">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">
          {t('landing.cta.title')}
        </h2>
        <div className="mt-8 flex justify-center">
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate('/signup')}
          >
            {t('landing.cta.button')}
          </Button>
        </div>
      </div>
    </section>
  )
}
