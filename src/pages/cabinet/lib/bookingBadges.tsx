import type { ReactNode } from 'react'
import type { TFunction } from 'i18next'

import {
  BOOKING_STATUS_TO_BADGE,
  PAYMENT_STATUS_TO_BADGE,
  type ICustomerBooking,
} from '@/entities/booking'
import { Badge } from '@/shared/ui/badge'

import { isBookingOverdue } from './formatBooking'

const STATUS_LABEL_KEY = {
  CONFIRMED: 'cabinet.statusConfirmed',
  IN_RENT: 'cabinet.statusInRent',
  COMPLETED: 'cabinet.statusCompleted',
  CANCELLED: 'cabinet.statusCancelled',
  NO_SHOW: 'cabinet.statusNoShow',
} as const

export function bookingStatusBadges(
  booking: ICustomerBooking,
  t: TFunction,
): ReactNode {
  const overdue = isBookingOverdue(booking)
  const bookingBadge = overdue
    ? 'overdue'
    : BOOKING_STATUS_TO_BADGE[booking.status]
  const paymentBadge = PAYMENT_STATUS_TO_BADGE[booking.paymentStatus]

  return (
    <>
      <Badge
        status={bookingBadge}
        icon={booking.status === 'CONFIRMED' && !overdue ? 'check' : undefined}
      >
        {overdue
          ? t('cabinet.statusOverdue')
          : t(STATUS_LABEL_KEY[booking.status])}
      </Badge>
      <Badge
        status={paymentBadge}
        icon={booking.paymentStatus === 'PAID' ? 'coin' : 'coin-empty'}
      >
        {booking.paymentStatus === 'PAID'
          ? t('cabinet.statusPaid')
          : t('cabinet.statusUnpaid')}
      </Badge>
    </>
  )
}
