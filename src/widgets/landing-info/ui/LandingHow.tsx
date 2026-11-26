import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { CATALOG_PATH } from '@/shared/config'
import buttonStyles from '@/shared/ui/button/Button.module.css'
import { Section, SectionHead, Wrap } from '@/shared/ui/layout'
import { Typography } from '@/shared/ui/typography'

import styles from './LandingInfo.module.css'

const STEPS = [
  { titleKey: 'landing.howStep1Title', bodyKey: 'landing.howStep1Body' },
  { titleKey: 'landing.howStep2Title', bodyKey: 'landing.howStep2Body' },
  { titleKey: 'landing.howStep3Title', bodyKey: 'landing.howStep3Body' },
  { titleKey: 'landing.howStep4Title', bodyKey: 'landing.howStep4Body' },
] as const

export interface ILandingHowProps {
  id: string
  className?: string
}

/** Landing “how it works”: four booking steps and a catalog CTA. */
const LandingHow = (props: ILandingHowProps) => {
  const { id, className } = props
  const { t } = useTranslation()

  return (
    <Section id={id} className={className}>
      <Wrap>
        <SectionHead>
          <Typography as="h2" variant="h2">
            {t('landing.howTitle')}
          </Typography>
          <p>{t('landing.howLead')}</p>
        </SectionHead>

        <ol className={styles.steps}>
          {STEPS.map((step, index) => (
            <li key={step.titleKey} className={styles.step}>
              <span className={styles.stepIndex} aria-hidden="true">
                {index + 1}
              </span>
              <div>
                <Typography as="h3" variant="h3" className={styles.stepTitle}>
                  {t(step.titleKey)}
                </Typography>
                <p className={styles.stepBody}>{t(step.bodyKey)}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className={styles.howActions}>
          <Link
            className={[buttonStyles.btn, buttonStyles.ghost].join(' ')}
            to={CATALOG_PATH}
          >
            {t('landing.howCta')}
          </Link>
        </div>
      </Wrap>
    </Section>
  )
}

export default LandingHow
