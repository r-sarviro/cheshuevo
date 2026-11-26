import { billableHours, type ICustomerBooking } from '@/entities/booking'

export function formatMoney(amount: number, currency: string): string {
  return `${amount}\u00a0${currency}`
}

export function formatPeriodLabel(
  startsAt: string,
  endsAt: string,
  locale: string,
): string {
  const start = new Date(startsAt)
  const end = new Date(endsAt)
  const dateFmt = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
  })
  const timeFmt = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  })
  return `${dateFmt.format(start)}, ${timeFmt.format(start)}–${timeFmt.format(end)}`
}

export function formatDateTimeLabel(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function formatTimeLabel(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function bookingHours(booking: ICustomerBooking): number {
  return (
    booking.billableHours ?? billableHours(booking.startsAt, booking.endsAt)
  )
}

/** CAB-028: overdue when still in rent past planned end. */
export function isBookingOverdue(
  booking: ICustomerBooking,
  now: Date = new Date(),
): boolean {
  if (booking.status !== 'IN_RENT') return false
  const end = Date.parse(booking.endsAt)
  return !Number.isNaN(end) && end < now.getTime()
}

/** CAB-029: confirmed unpaid and start already passed. */
export function isStartMissed(
  booking: ICustomerBooking,
  now: Date = new Date(),
): boolean {
  if (booking.status !== 'CONFIRMED') return false
  const start = Date.parse(booking.startsAt)
  return !Number.isNaN(start) && start <= now.getTime()
}
