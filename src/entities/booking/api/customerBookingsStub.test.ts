import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  assertCustomerCanRequestLoginStub,
  CABINET_DEMO_EMAIL,
  customerHasBookingsStub,
  getCustomerBookingStub,
  getCustomerNameStub,
  listCustomerBookingsStub,
  markCustomerBookingCancelled,
  resetCustomerBookingsStub,
} from './customerBookingsStub'

vi.mock('@/shared/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/api')>()
  return {
    ...actual,
    stubDelay: () => Promise.resolve(),
  }
})

describe('customerBookingsStub', () => {
  beforeEach(() => {
    resetCustomerBookingsStub()
  })

  it('lists seeded bookings for an email', async () => {
    const list = await listCustomerBookingsStub(CABINET_DEMO_EMAIL)
    expect(list.length).toBeGreaterThan(0)
    expect(list.every((b) => b.customerEmail === CABINET_DEMO_EMAIL)).toBe(true)
  })

  it('returns 404 for foreign booking number', async () => {
    await listCustomerBookingsStub(CABINET_DEMO_EMAIL)
    await expect(
      getCustomerBookingStub('other@example.com', 'DR-001031'),
    ).rejects.toMatchObject({ status: 404 })
  })

  it('marks booking cancelled in store', async () => {
    await listCustomerBookingsStub(CABINET_DEMO_EMAIL)
    markCustomerBookingCancelled(
      CABINET_DEMO_EMAIL,
      'DR-001031',
      '2099-01-01T00:00:00.000Z',
    )
    const booking = await getCustomerBookingStub(
      CABINET_DEMO_EMAIL,
      'DR-001031',
    )
    expect(booking.status).toBe('CANCELLED')
  })

  it('allows login request only when the email has bookings', () => {
    expect(customerHasBookingsStub('nobody@example.com')).toBe(false)
    expect(() =>
      assertCustomerCanRequestLoginStub('nobody@example.com'),
    ).toThrowError(
      expect.objectContaining({
        status: 404,
        code: 'NO_BOOKINGS',
      }),
    )

    expect(customerHasBookingsStub(CABINET_DEMO_EMAIL)).toBe(true)
    expect(() =>
      assertCustomerCanRequestLoginStub(CABINET_DEMO_EMAIL),
    ).not.toThrow()
    expect(getCustomerNameStub(CABINET_DEMO_EMAIL)).toBe('Анна')
  })
})
