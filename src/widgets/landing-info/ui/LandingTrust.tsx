import { useTranslation } from 'react-i18next'

import { Icon, type TIconName } from '@/shared/ui/icon'
import { Section, SectionHead, Wrap } from '@/shared/ui/layout'
import { Typography } from '@/shared/ui/typography'

import styles from './LandingInfo.module.css'

const ITEMS: ReadonlyArray<{
  titleKey: string
  bodyKey: string
  icon: TIconName
}> = [
  {
    titleKey: 'landing.trustItem1Title',
    bodyKey: 'landing.trustItem1Body',
    icon: 'dragon',
  },
  {
    titleKey: 'landing.trustItem2Title',
    bodyKey: 'landing.trustItem2Body',
    icon: 'calendar',
  },
  {
    titleKey: 'landing.trustItem3Title',
    bodyKey: 'landing.trustItem3Body',
    icon: 'coin',
  },
]

export interface ILandingTrustProps {
  id: string
  className?: string
}

/** Landing trust facts: why book at this rental. */
const LandingTrust = (props: ILandingTrustProps) => {
  const { id, className } = props
  const { t } = useTranslation()

  return (
    <Section id={id} className={className}>
      <Wrap>
        <SectionHead>
          <Typography as="h2" variant="h2">
            {t('landing.trustTitle')}
          </Typography>
          <p>{t('landing.trustLead')}</p>
        </SectionHead>

        <ul className={styles.trustList}>
          {ITEMS.map((item) => (
            <li key={item.titleKey} className={styles.trustItem}>
              <span className={styles.trustIcon} aria-hidden="true">
                <Icon name={item.icon} />
              </span>
              <Typography
                as="h3"
                variant="h3"
                className={styles.trustItemTitle}
              >
                {t(item.titleKey)}
              </Typography>
              <p className={styles.trustItemBody}>{t(item.bodyKey)}</p>
            </li>
          ))}
        </ul>
      </Wrap>
    </Section>
  )
}

export default LandingTrust
