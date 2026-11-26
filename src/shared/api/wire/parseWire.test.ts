import { describe, expect, it } from 'vitest'

import { ApiError } from '../client'
import { parseWire } from './parseWire'
import {
  availabilitySchema,
  customerBookingResourceSchema,
  dragonResourceSchema,
  dragonsListSchema,
  emailVerificationConfirmedSchema,
  publicBookingCreatedSchema,
} from './schemas'

describe('parseWire', () => {
  it('returns parsed data for a valid payload', () => {
    const wire = parseWire(availabilitySchema, {
      available: true,
      billable_hours: 2,
      hourly_rate: 140,
      total_amount: 280,
      currency: 'RUB',
      reason: null,
    })
    expect(wire.available).toBe(true)
    expect(wire.total_amount).toBe(280)
  })

  it('rejects free availability when reason is omitted', () => {
    expect(() =>
      parseWire(availabilitySchema, {
        available: true,
        billable_hours: 2,
        hourly_rate: 140,
        total_amount: 280,
        currency: 'RUB',
      }),
    ).toThrow(ApiError)
  })

  it('throws INVALID_RESPONSE for a broken payload', () => {
    expect(() =>
      parseWire(dragonResourceSchema, { id: 'nope', name: 'Бриз' }),
    ).toThrow(ApiError)
    try {
      parseWire(dragonResourceSchema, { id: 'nope', name: 'Бриз' })
    } catch (error) {
      expect(error).toMatchObject({ code: 'INVALID_RESPONSE' })
    }
  })

  it('accepts cabinet create booking payload with session null', () => {
    const wire = parseWire(publicBookingCreatedSchema, {
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
    })
    expect(wire.booking_number).toBe('DR-000010')
    expect(wire.session).toBeNull()
  })

  it('rejects create booking payload when session is omitted', () => {
    expect(() =>
      parseWire(publicBookingCreatedSchema, {
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
      }),
    ).toThrow(ApiError)
  })

  it('accepts dragons list items without detail-only description fields', () => {
    expect(() =>
      parseWire(dragonsListSchema, {
        data: [
          {
            id: 6,
            name: 'Снежок',
            short_description: 'short',
            name_en: 'Snowball',
            short_description_en: 'short en',
            image_url: null,
            sprite_key: 'snezhok',
            tile_token: '#E3EEF8',
            hourly_rate: 150,
            currency: 'RUB',
            operational_status: 'ACTIVE',
          },
        ],
      }),
    ).not.toThrow()
  })

  it('accepts email confirm with session null (guest without cabinet)', () => {
    const wire = parseWire(emailVerificationConfirmedSchema, {
      verification_token: 'vt',
      expires_at: '2099-01-01T00:00:00Z',
      session: null,
    })
    expect(wire.session).toBeNull()
  })

  it('accepts customer booking with payment null or omitted', () => {
    const base = {
      booking_number: 'DR-000008',
      status: 'CONFIRMED' as const,
      payment_status: 'UNPAID' as const,
      is_overdue: false,
      starts_at: '2027-04-01T10:00:00Z',
      ends_at: '2027-04-01T12:00:00Z',
      billable_hours: 2,
      hourly_rate: 150,
      total_amount: 300,
      currency: 'RUB',
      issued_at: null,
      returned_at: null,
      cancelled_at: null,
      created_at: '2026-11-26T20:00:00Z',
      dragon: {
        id: 6,
        name: 'Снежок',
        name_en: 'Snowball',
        sprite_key: 'snezhok',
        tile_token: '#E3EEF8',
        image_url: null,
      },
    }
    expect(() =>
      parseWire(customerBookingResourceSchema, { ...base, payment: null }),
    ).not.toThrow()
    expect(() => parseWire(customerBookingResourceSchema, base)).not.toThrow()
  })
})
