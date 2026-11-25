import type { CSSProperties, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { ButtonText } from '@/shared/ui/button'
import { Facts } from '@/shared/ui/card'
import { Icon } from '@/shared/ui/icon'
import { Typography } from '@/shared/ui/typography'

import styles from './CabinetBookingCard.module.css'

export interface ICabinetBookingCardFact {
  label: ReactNode
  value: ReactNode
}

export interface ICabinetBookingCardProps {
  title: ReactNode
  bookingNumber: string
  picture?: ReactNode
  tile?: string
  badges: ReactNode
  facts: ICabinetBookingCardFact[]
  notes?: ReactNode
  fresh?: boolean
  copyLabel?: ReactNode
  className?: string
}

/** LK booking detail card (kb-card). Read-only — no actions in this slice. */
const CabinetBookingCard = (props: ICabinetBookingCardProps) => {
  const {
    title,
    bookingNumber,
    picture,
    tile,
    badges,
    facts,
    notes,
    fresh = false,
    copyLabel,
    className,
  } = props
  const { t } = useTranslation()

  const rootClass = [
    styles.root,
    fresh ? styles.fresh : null,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const picStyle = tile
    ? ({ ['--tile']: tile } as CSSProperties)
    : undefined

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(bookingNumber)
    } catch {
      /* clipboard may be unavailable */
    }
  }

  return (
    <section className={rootClass} aria-labelledby="cabinet-booking-card-title">
      {picture ? (
        <div className={styles.pic} style={picStyle}>
          {picture}
        </div>
      ) : null}
      <div className={styles.body}>
        <Typography
          variant="h2"
          id="cabinet-booking-card-title"
          tabIndex={-1}
          className={styles.title}
        >
          {title}
        </Typography>
        <div className={styles.copy}>
          <p className={styles.number}>{bookingNumber}</p>
          <ButtonText
            type="button"
            className={styles.copyBtn}
            onClick={() => {
              void onCopy()
            }}
          >
            <Icon name="copy" />
            {copyLabel ?? t('cabinet.copy')}
          </ButtonText>
        </div>
        <div className={styles.statuses}>{badges}</div>
        {facts.length > 0 ? (
          <Facts>
            {facts.map((fact, index) => (
              <div key={index}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </Facts>
        ) : null}
        {notes}
      </div>
    </section>
  )
}

export default CabinetBookingCard
