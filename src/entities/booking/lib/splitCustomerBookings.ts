import type { ICustomerBooking } from '../model/customerTypes'

const ACTIVE_STATUSES = new Set(['CONFIRMED', 'IN_RENT'])

/** CAB-010: split server-ordered list into current vs past sections (no re-sort). */
export function splitCustomerBookings(bookings: ICustomerBooking[]): {
  current: ICustomerBooking[]
  past: ICustomerBooking[]
} {
  const current: ICustomerBooking[] = []
  const past: ICustomerBooking[] = []

  for (const booking of bookings) {
    if (ACTIVE_STATUSES.has(booking.status)) {
      current.push(booking)
    } else {
      past.push(booking)
    }
  }

  return { current, past }
}
