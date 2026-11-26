import { describe, expect, it } from 'vitest'

import {
  mapAvailability,
  mapCreatedBooking,
  mapCustomerBooking,
  mapSession,
} from './mapBooking'

describe('mapSession', () => {
  it('returns null for missing session', () => {
    expect(mapSession(null)).toBeNull()
  })

  it('returns null when expires_at is missing', () => {
    expect(
      mapSession({
        token: 'tok',
        token_type: 'Bearer',
        expires_at: null,
      }),
    ).toBeNull()
  })

  it('maps snake_case session fields', () => {
    expect(
      mapSession({
        token: 'tok',
        token_type: 'Bearer',
        expires_at: '2099-01-01T00:00:00Z',
      }),
    ).toEqual({
      token: 'tok',
      tokenType: 'Bearer',
      expiresAt: '2099-01-01T00:00:00Z',
    })
  })
})

describe('mapCreatedBooking', () => {
  it('maps create response including nested session', () => {
    expect(
      mapCreatedBooking({
        booking_number: 'DR-000002',
        status: 'CONFIRMED',
        payment_status: 'UNPAID',
        total_amount: 280,
        currency: 'RUB',
        starts_at: '2026-11-27T13:00:00Z',
        ends_at: '2026-11-27T15:00:00Z',
        billable_hours: 2,
        dragon_id: 17,
        dragon_name: 'Бриз',
        confirmation_email_queued: true,
        session: {
          token: 'tok',
          token_type: 'Bearer',
          expires_at: '2099-01-01T00:00:00Z',
        },
      }),
    ).toMatchObject({
      bookingNumber: 'DR-000002',
      status: 'CONFIRMED',
      paymentStatus: 'UNPAID',
      totalAmount: 280,
      billableHours: 2,
      dragonId: 17,
      dragonName: 'Бриз',
      confirmationEmailQueued: true,
      session: {
        token: 'tok',
        tokenType: 'Bearer',
      },
    })
  })

  it('maps cabinet create response when session is null', () => {
    expect(
      mapCreatedBooking({
        booking_number: 'DR-000010',
        status: 'CONFIRMED',
        payment_status: 'UNPAID',
        total_amount: 300,
        currency: 'RUB',
        starts_at: '2026-12-15T10:00:00Z',
        ends_at: '2026-12-15T12:00:00Z',
        billable_hours: 2,
        dragon_id: 6,
        dragon_name: 'Снежок',
        confirmation_email_queued: true,
        session: null,
      }),
    ).toMatchObject({
      bookingNumber: 'DR-000010',
      dragonId: 6,
      session: null,
    })
  })
})

describe('mapCustomerBooking', () => {
  it('maps nested dragon and null payment', () => {
    expect(
      mapCustomerBooking({
        booking_number: 'DR-000002',
        status: 'CONFIRMED',
        payment_status: 'UNPAID',
        is_overdue: false,
        starts_at: '2026-11-27T13:00:00Z',
        ends_at: '2026-11-27T15:00:00Z',
        billable_hours: 2,
        hourly_rate: 140,
        total_amount: 280,
        currency: 'RUB',
        issued_at: null,
        returned_at: null,
        cancelled_at: null,
        created_at: null,
        dragon: {
          id: 17,
          name: 'Бриз',
          name_en: 'Breeze',
          sprite_key: 'briz',
          tile_token: '#E0F3EF',
          image_url: null,
        },
        payment: null,
      }),
    ).toMatchObject({
      bookingNumber: 'DR-000002',
      isOverdue: false,
      hourlyRate: 140,
      dragon: {
        id: 17,
        name: 'Бриз',
        nameEn: 'Breeze',
        spriteKey: 'briz',
      },
      payment: null,
    })
  })

  it('maps paid payment block', () => {
    const mapped = mapCustomerBooking({
      booking_number: 'DR-1',
      status: 'COMPLETED',
      payment_status: 'PAID',
      is_overdue: false,
      starts_at: '2026-01-01T10:00:00Z',
      ends_at: '2026-01-01T12:00:00Z',
      billable_hours: 2,
      hourly_rate: 140,
      total_amount: 280,
      currency: 'RUB',
      issued_at: null,
      returned_at: null,
      cancelled_at: null,
      created_at: null,
      dragon: {
        id: 1,
        name: 'Бриз',
        name_en: null,
        sprite_key: null,
        tile_token: null,
        image_url: null,
      },
      payment: {
        method: 'CASH',
        amount: 280,
        currency: 'RUB',
        paid_at: '2026-01-01T12:00:00Z',
      },
    })
    expect(mapped.payment).toEqual({
      method: 'CASH',
      amount: 280,
      currency: 'RUB',
      paidAt: '2026-01-01T12:00:00Z',
    })
  })
})

describe('mapAvailability', () => {
  it('maps free quote', () => {
    expect(
      mapAvailability({
        available: true,
        billable_hours: 2,
        hourly_rate: 140,
        total_amount: 280,
        currency: 'RUB',
        reason: null,
      }),
    ).toEqual({
      available: true,
      billableHours: 2,
      hourlyRate: 140,
      totalAmount: 280,
      currency: 'RUB',
      reason: undefined,
    })
  })

  it('maps busy reason', () => {
    expect(
      mapAvailability({
        available: false,
        billable_hours: 2,
        hourly_rate: 140,
        total_amount: 280,
        currency: 'RUB',
        reason: 'SLOT_TAKEN',
      }),
    ).toMatchObject({
      available: false,
      reason: 'SLOT_TAKEN',
    })
  })
})
