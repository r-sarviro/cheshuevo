import type { ReactNode } from 'react'

import { Badge } from '@/shared/ui/badge'
import { Facts } from '@/shared/ui/card'
import { Num, Typography } from '@/shared/ui/typography'

import {
  BOOKING_STATUS_TO_BADGE,
  PAYMENT_STATUS_TO_BADGE,
  type IBooking,
} from '../model/types'
import styles from './BookingResult.module.css'

export interface IBookingResultProps {
  booking: IBooking
  title: ReactNode
  picture?: ReactNode
  factLabels: {
    dragon: ReactNode
    period: ReactNode
    total: ReactNode
    payment: ReactNode
  }
  statusLabels: {
    booking: ReactNode
    payment: ReactNode
  }
  paymentHint?: ReactNode
  emailHint?: ReactNode
  actions?: ReactNode
  periodText: ReactNode
  totalText: ReactNode
  paymentText: ReactNode
  /** Flush into a parent Panel (no second frame / single column). */
  embedded?: boolean
  className?: string
}

/** Confirmed booking summary: number, badges, facts, optional actions. */
const BookingResult = (props: IBookingResultProps) => {
  const {
    booking,
    title,
    picture,
    factLabels,
    statusLabels,
    paymentHint,
    emailHint,
    actions,
    periodText,
    totalText,
    paymentText,
    embedded = false,
    className,
  } = props

  const rootClass = [styles.root, embedded ? styles.embedded : null, className]
    .filter(Boolean)
    .join(' ')
  const bookingBadge = BOOKING_STATUS_TO_BADGE[booking.status]
  const paymentBadge = PAYMENT_STATUS_TO_BADGE[booking.paymentStatus]

  return (
    <div className={rootClass}>
      {picture ? <div className={styles.pic}>{picture}</div> : null}
      <div className={styles.body}>
        <Typography variant="h2">{title}</Typography>
        <p className={styles.number}>{booking.bookingNumber}</p>
        <div className={styles.statuses}>
          <Badge
            status={bookingBadge}
            icon={booking.status === 'CONFIRMED' ? 'check' : undefined}
          >
            {statusLabels.booking}
          </Badge>
          <Badge
            status={paymentBadge}
            icon={booking.paymentStatus === 'PAID' ? 'coin' : 'coin-empty'}
          >
            {statusLabels.payment}
          </Badge>
        </div>
        <Facts>
          <div>
            <dt>{factLabels.dragon}</dt>
            <dd>{booking.dragonName ?? booking.dragonId}</dd>
          </div>
          <div>
            <dt>{factLabels.period}</dt>
            <dd>
              <Num>{periodText}</Num>
            </dd>
          </div>
          <div>
            <dt>{factLabels.total}</dt>
            <dd>
              <Num>{totalText}</Num>
            </dd>
          </div>
          <div>
            <dt>{factLabels.payment}</dt>
            <dd>{paymentText}</dd>
          </div>
        </Facts>
        {paymentHint ? (
          <Typography variant="small" muted>
            {paymentHint}
          </Typography>
        ) : null}
        {emailHint ? (
          <Typography variant="small" muted>
            {emailHint}
          </Typography>
        ) : null}
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>
    </div>
  )
}

export default BookingResult
