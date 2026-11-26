import { describe, expect, it, vi } from 'vitest'

import {
  cancelBookingStub,
  setCancelBookingStubOutcome,
} from './cancelBookingStub'

vi.mock('@/shared/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/api')>()
  return {
    ...actual,
    stubDelay: () => Promise.resolve(),
  }
})

describe('cancelBookingStub', () => {
  it('cancels a future booking', async () => {
    const result = await cancelBookingStub({
      bookingNumber: 'DR-001028',
      startsAt: '2099-06-01T12:00:00.000Z',
    })
    expect(result.status).toBe('CANCELLED')
    expect(result.bookingNumber).toBe('DR-001028')
  })

  it('fails on demand', async () => {
    setCancelBookingStubOutcome('fail')
    await expect(
      cancelBookingStub({
        bookingNumber: 'DR-001028',
        startsAt: '2099-06-01T12:00:00.000Z',
      }),
    ).rejects.toMatchObject({ code: 'CANCEL_FAILED' })
  })

  it('rejects when rental started', async () => {
    setCancelBookingStubOutcome('started')
    await expect(
      cancelBookingStub({
        bookingNumber: 'DR-001028',
        startsAt: '2099-06-01T12:00:00.000Z',
      }),
    ).rejects.toMatchObject({ code: 'RENTAL_STARTED' })
  })
})
