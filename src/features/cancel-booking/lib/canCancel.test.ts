import { describe, expect, it } from 'vitest'

import { canCancel } from './canCancel'

const base = {
  status: 'CONFIRMED' as const,
  paymentStatus: 'UNPAID' as const,
  startsAt: '2099-01-15T10:00:00.000Z',
}

describe('canCancel', () => {
  it('allows confirmed unpaid future booking', () => {
    expect(canCancel(base, new Date('2026-01-01T00:00:00.000Z'))).toBe(true)
  })

  it('blocks when start has passed', () => {
    expect(
      canCancel(
        { ...base, startsAt: '2020-01-15T10:00:00.000Z' },
        new Date('2026-01-01T00:00:00.000Z'),
      ),
    ).toBe(false)
  })

  it('blocks paid bookings', () => {
    expect(
      canCancel(
        { ...base, paymentStatus: 'PAID' },
        new Date('2026-01-01T00:00:00.000Z'),
      ),
    ).toBe(false)
  })

  it('blocks non-confirmed statuses', () => {
    expect(
      canCancel(
        { ...base, status: 'IN_RENT' },
        new Date('2026-01-01T00:00:00.000Z'),
      ),
    ).toBe(false)
    expect(
      canCancel(
        { ...base, status: 'CANCELLED' },
        new Date('2026-01-01T00:00:00.000Z'),
      ),
    ).toBe(false)
  })
})
