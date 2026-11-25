import type { TBookingStatus, TPaymentStatus } from '@/entities/booking'

export interface ICanCancelBooking {
  status: TBookingStatus
  paymentStatus: TPaymentStatus
  startsAt: string
}

/** Client cancel rules without coins (TZ 21.4): CONFIRMED + before start + UNPAID. */
export function canCancel(
  booking: ICanCancelBooking,
  now: Date = new Date(),
): boolean {
  if (booking.status !== 'CONFIRMED') return false
  if (booking.paymentStatus !== 'UNPAID') return false
  const start = Date.parse(booking.startsAt)
  if (Number.isNaN(start)) return false
  return start > now.getTime()
}
