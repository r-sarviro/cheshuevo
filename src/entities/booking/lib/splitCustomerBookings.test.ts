import { describe, expect, it } from 'vitest'

import type { ICustomerBooking } from '../model/customerTypes'

import { splitCustomerBookings } from './splitCustomerBookings'

function booking(
  partial: Partial<ICustomerBooking> &
    Pick<ICustomerBooking, 'bookingNumber' | 'status' | 'startsAt'>,
): ICustomerBooking {
  return {
    customerEmail: 'anna@example.com',
    paymentStatus: 'UNPAID',
    totalAmount: 300,
    currency: '₽',
    endsAt: partial.startsAt,
    ...partial,
  }
}

describe('splitCustomerBookings', () => {
  it('splits active vs past and sorts', () => {
    const list = [
      booking({
        bookingNumber: 'A',
        status: 'COMPLETED',
        startsAt: '2026-01-10T10:00:00.000Z',
      }),
      booking({
        bookingNumber: 'B',
        status: 'CONFIRMED',
        startsAt: '2099-06-02T10:00:00.000Z',
      }),
      booking({
        bookingNumber: 'C',
        status: 'CONFIRMED',
        startsAt: '2099-06-01T10:00:00.000Z',
      }),
      booking({
        bookingNumber: 'D',
        status: 'CANCELLED',
        startsAt: '2026-02-01T10:00:00.000Z',
      }),
    ]

    const { current, past } = splitCustomerBookings(list)
    expect(current.map((b) => b.bookingNumber)).toEqual(['C', 'B'])
    expect(past.map((b) => b.bookingNumber)).toEqual(['D', 'A'])
  })
})
