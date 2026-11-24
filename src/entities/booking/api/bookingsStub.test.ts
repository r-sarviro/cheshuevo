import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiError, STUB_CONFLICT_TOKEN_PREFIX } from '@/shared/api'

import { createBookingStub, getAvailabilityStub } from './bookingsStub'

vi.mock('@/shared/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/api')>()
  return {
    ...actual,
    stubDelay: () => Promise.resolve(),
  }
})

const FREE_SLOT = {
  startsAt: '2026-11-25T13:00:00',
  endsAt: '2026-11-25T15:00:00',
}

const BUSY_SLOT = {
  startsAt: '2026-11-25T10:00:00',
  endsAt: '2026-11-25T12:00:00',
}

describe('getAvailabilityStub', () => {
  it('returns unavailable for a too-short period', async () => {
    const result = await getAvailabilityStub({
      dragonId: 2,
      startsAt: '2026-11-25T13:00:00',
      endsAt: '2026-11-25T13:00:00',
      hourlyRate: 170,
      currency: 'RUB',
    })

    expect(result).toEqual({ available: false })
  })

  it('returns unavailable for Sakurka busy window', async () => {
    const result = await getAvailabilityStub({
      dragonId: 1,
      ...BUSY_SLOT,
      hourlyRate: 150,
      currency: 'RUB',
    })

    expect(result).toEqual({ available: false })
  })

  it('returns quote for a free slot', async () => {
    const result = await getAvailabilityStub({
      dragonId: 2,
      ...FREE_SLOT,
      hourlyRate: 150,
      currency: 'RUB',
    })

    expect(result).toEqual({
      available: true,
      billableHours: 2,
      hourlyRate: 150,
      totalAmount: 300,
      currency: 'RUB',
    })
  })
})

describe('createBookingStub', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects missing verification token with 401', async () => {
    await expect(
      createBookingStub({
        dragonId: 2,
        ...FREE_SLOT,
        customerName: 'Тест',
        customerEmail: 'test@example.com',
        verificationToken: '',
        hourlyRate: 170,
        currency: 'RUB',
        dragonName: 'Кристаллион',
      }),
    ).rejects.toMatchObject({
      status: 401,
      code: 'EMAIL_NOT_VERIFIED',
    } satisfies Partial<ApiError>)
  })

  it('rejects invalid period with 400', async () => {
    await expect(
      createBookingStub({
        dragonId: 2,
        startsAt: '2026-11-25T13:00:00',
        endsAt: '2026-11-25T13:00:00',
        customerName: 'Тест',
        customerEmail: 'test@example.com',
        verificationToken: 'tok-ok',
        hourlyRate: 170,
        currency: 'RUB',
        dragonName: 'Кристаллион',
      }),
    ).rejects.toMatchObject({
      status: 400,
      code: 'INVALID_PERIOD',
    })
  })

  it('returns 409 when token forces conflict', async () => {
    await expect(
      createBookingStub({
        dragonId: 2,
        ...FREE_SLOT,
        customerName: 'Тест',
        customerEmail: 'test@example.com',
        verificationToken: `${STUB_CONFLICT_TOKEN_PREFIX}ver-1`,
        hourlyRate: 170,
        currency: 'RUB',
        dragonName: 'Кристаллион',
      }),
    ).rejects.toMatchObject({
      status: 409,
      code: 'BOOKING_CONFLICT',
    })
  })

  it('returns 409 when Sakurka slot is busy', async () => {
    await expect(
      createBookingStub({
        dragonId: 1,
        ...BUSY_SLOT,
        customerName: 'Тест',
        customerEmail: 'test@example.com',
        verificationToken: 'tok-ok',
        hourlyRate: 150,
        currency: 'RUB',
        dragonName: 'Сакурка',
      }),
    ).rejects.toMatchObject({
      status: 409,
      code: 'BOOKING_CONFLICT',
    })
  })

  it('creates a confirmed unpaid booking', async () => {
    const booking = await createBookingStub({
      dragonId: 2,
      ...FREE_SLOT,
      customerName: 'Тест',
      customerEmail: 'test@example.com',
      verificationToken: 'tok-ok',
      hourlyRate: 170,
      currency: 'RUB',
      dragonName: 'Кристаллион',
    })

    expect(booking.bookingNumber).toMatch(/^DR-\d{6}$/)
    expect(booking).toMatchObject({
      status: 'CONFIRMED',
      paymentStatus: 'UNPAID',
      totalAmount: 340,
      billableHours: 2,
      dragonId: 2,
      dragonName: 'Кристаллион',
      currency: 'RUB',
    })
  })
})
