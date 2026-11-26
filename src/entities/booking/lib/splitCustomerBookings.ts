import type { ICustomerBooking } from '../model/customerTypes'

const ACTIVE_STATUSES = new Set(['CONFIRMED', 'IN_RENT'])

/** CAB-010: current/upcoming vs past/cancelled. */
export function splitCustomerBookings(
  bookings: ICustomerBooking[],
  now: Date = new Date(),
): { current: ICustomerBooking[]; past: ICustomerBooking[] } {
  const current: ICustomerBooking[] = []
  const past: ICustomerBooking[] = []

  for (const booking of bookings) {
    const isActiveStatus = ACTIVE_STATUSES.has(booking.status)
    if (isActiveStatus) {
      current.push(booking)
    } else {
      past.push(booking)
    }
  }

  current.sort(
    (a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt) || 0,
  )
  past.sort((a, b) => Date.parse(b.startsAt) - Date.parse(a.startsAt) || 0)

  void now
  return { current, past }
}
