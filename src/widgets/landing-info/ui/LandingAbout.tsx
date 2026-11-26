import { useTranslation } from 'react-i18next'

import {
  RENTAL_EMAIL,
  RENTAL_HOURS_CLOSE,
  RENTAL_HOURS_OPEN,
  RENTAL_PHONE,
  RENTAL_PHONE_TEL,
  RENTAL_PLACE_MAP_SRC,
} from '@/shared/config'
import { Divider } from '@/shared/ui/divider'
import { Frame } from '@/shared/ui/frame'
import { Icon, type TIconName } from '@/shared/ui/icon'
import { Link } from '@/shared/ui/link'
import { Section, SectionHead, Wrap } from '@/shared/ui/layout'
import { PixelSprite } from '@/shared/ui/sprite'
import { Typography } from '@/shared/ui/typography'

import styles from './LandingInfo.module.css'

const CONTACT_ICONS = {
  phone: 'ask',
  email: 'mail',
  hours: 'clock',
} as const satisfies Record<string, TIconName>

export interface ILandingAboutProps {
  id: string
  contactsId?: string
  className?: string
  /** Section head with about title + lead. */
  showHead?: boolean
  /** Story paragraph with hours. */
  showBody?: boolean
  showPlace?: boolean
  showMap?: boolean
  showContacts?: boolean
}

/** About the rental: story with flame, place+map, contacts. */
const LandingAbout = (props: ILandingAboutProps) => {
  const {
    id,
    contactsId,
    className,
    showHead = true,
    showBody = true,
    showPlace = true,
    showMap = true,
    showContacts = Boolean(contactsId),
  } = props
  const { t } = useTranslation()
  const hours = {
    open: RENTAL_HOURS_OPEN,
    close: RENTAL_HOURS_CLOSE,
  }
  const showStory = showHead || showBody
  const showPlaceGrid = showPlace || showMap

  return (
    <Section id={id} className={className}>
      <Wrap>
        {showStory ? (
          <div className={styles.aboutStory}>
            <div className={styles.aboutStoryCopy}>
              {showHead ? (
                <>
                  <Typography
                    as="h2"
                    variant="h2"
                    className={styles.aboutTitle}
                  >
                    {t('landing.aboutTitle')}
                  </Typography>
                  <p className={styles.aboutLead}>{t('landing.aboutLead')}</p>
                </>
              ) : null}
              {showBody ? (
                <p className={styles.aboutBody}>
                  {t('landing.aboutBody', hours)}
                </p>
              ) : null}
            </div>
            <div className={styles.aboutFlameSlot}>
              <PixelSprite
                className={styles.aboutFlameSprite}
                name="flame"
                label={t('landing.bridgeSpriteAltFlame')}
              />
            </div>
          </div>
        ) : null}

        {showStory && showPlaceGrid ? (
          <Divider className={styles.blockDivider} />
        ) : null}

        {showPlaceGrid ? (
          <div className={styles.aboutGrid}>
            {showPlace ? (
              <div className={styles.aboutCopy}>
                <Typography as="h3" variant="h3" className={styles.placeTitle}>
                  {t('landing.placeTitle')}
                </Typography>
                <p className={styles.placeAddress}>
                  {t('landing.placeAddress')}
                </p>
                <p className={styles.placeHow}>{t('landing.placeHow')}</p>
                <p>{t('landing.placeArrive')}</p>
                <p>{t('landing.placeTip')}</p>
              </div>
            ) : null}

            {showMap ? (
              <Frame className={styles.mapFrame} flat>
                <img
                  className={styles.map}
                  src={RENTAL_PLACE_MAP_SRC}
                  alt={t('landing.placeMapAlt')}
                  width={960}
                  height={540}
                  loading="lazy"
                  decoding="async"
                />
              </Frame>
            ) : null}
          </div>
        ) : null}

        {showContacts && contactsId ? (
          <div
            id={contactsId === id ? undefined : contactsId}
            className={[
              styles.contacts,
              !showStory && !showPlaceGrid ? styles.contactsSolo : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <SectionHead>
              <Typography as="h2" variant="h2">
                {t('landing.contactsTitle')}
              </Typography>
            </SectionHead>
            <ul className={styles.contactsList}>
              <li className={styles.contactsItem}>
                <span className={styles.contactsIcon} aria-hidden="true">
                  <Icon name={CONTACT_ICONS.phone} />
                </span>
                <div>
                  <span className={styles.contactsLabel}>
                    {t('landing.contactsPhone')}
                  </span>
                  <p className={styles.contactsValue}>
                    <Link href={`tel:${RENTAL_PHONE_TEL}`}>{RENTAL_PHONE}</Link>
                  </p>
                </div>
              </li>
              <li className={styles.contactsItem}>
                <span className={styles.contactsIcon} aria-hidden="true">
                  <Icon name={CONTACT_ICONS.email} />
                </span>
                <div>
                  <span className={styles.contactsLabel}>
                    {t('landing.contactsEmail')}
                  </span>
                  <p className={styles.contactsValue}>
                    <Link href={`mailto:${RENTAL_EMAIL}`}>{RENTAL_EMAIL}</Link>
                  </p>
                </div>
              </li>
              <li className={styles.contactsItem}>
                <span className={styles.contactsIcon} aria-hidden="true">
                  <Icon name={CONTACT_ICONS.hours} />
                </span>
                <div>
                  <span className={styles.contactsLabel}>
                    {t('landing.contactsHours')}
                  </span>
                  <p className={styles.contactsValue}>
                    {t('landing.contactsHoursValue', hours)}
                  </p>
                </div>
              </li>
            </ul>
          </div>
        ) : null}
      </Wrap>
    </Section>
  )
}

export default LandingAbout
