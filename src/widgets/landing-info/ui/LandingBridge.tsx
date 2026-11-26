import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { ABOUT_PATH } from '@/shared/config'
import buttonStyles from '@/shared/ui/button/Button.module.css'
import { Section, Wrap } from '@/shared/ui/layout'
import { PixelSprite } from '@/shared/ui/sprite'
import { Typography } from '@/shared/ui/typography'

import styles from './LandingInfo.module.css'

export interface ILandingBridgeProps {
  className?: string
}

/** Short home teaser: centered like EmptyState on small screens, row on desktop. */
const LandingBridge = (props: ILandingBridgeProps) => {
  const { className } = props
  const { t } = useTranslation()

  return (
    <Section
      className={[styles.bridge, className].filter(Boolean).join(' ')}
    >
      <Wrap>
        <div className={styles.bridgeInner}>
          <div className={styles.bridgeCopy}>
            <Typography as="h2" variant="h2">
              {t('landing.bridgeTitle')}
            </Typography>
            <p className={styles.bridgeLead}>{t('landing.bridgeLead')}</p>
            <div className={styles.bridgeActions}>
              <Link className={buttonStyles.btn} to={ABOUT_PATH}>
                {t('landing.bridgeCta')}
              </Link>
            </div>
          </div>
          <div className={styles.bridgeFlameSlot}>
            <PixelSprite
              className={styles.bridgeFlameSprite}
              name="flame"
              label={t('landing.bridgeSpriteAltFlame')}
            />
          </div>
        </div>
      </Wrap>
    </Section>
  )
}

export default LandingBridge
