import { describe, expect, it } from 'vitest'

import type { ICustomerBooking } from '../model/customerTypes'

import { splitCustomerBookings } from './splitCustomerBookings'

function booking(
  partial: Partial<ICustomerBooking> &
    Pick<ICustomerBooking, 'bookingNumber' | 'status' | 'startsAt'>,
): ICustomerBooking {
  return {
    paymentStatus: 'UNPAID',
    isOverdue: false,
    totalAmount: 300,
    currency: 'RUB',
    endsAt: partial.startsAt,
    billableHours: 2,
    hourlyRate: 150,
    dragon: {
      id: 1,
      name: 'Бриз',
      spriteKey: 'briz',
      tileToken: '#E0F3EF',
    },
    payment: null,
    ...partial,
  }
}

describe('splitCustomerBookings', () => {
  it('splits active vs past and keeps server order', () => {
    const list = [
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
      booking({
        bookingNumber: 'A',
        status: 'COMPLETED',
        startsAt: '2026-01-10T10:00:00.000Z',
      }),
    ]

    const { current, past } = splitCustomerBookings(list)
    expect(current.map((b) => b.bookingNumber)).toEqual(['B', 'C'])
    expect(past.map((b) => b.bookingNumber)).toEqual(['D', 'A'])
  })
})
