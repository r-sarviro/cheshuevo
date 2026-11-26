import { describe, expect, it } from 'vitest'

import { ApiError } from '../client'
import { parseWire } from './parseWire'
import { availabilitySchema, dragonResourceSchema } from './schemas'

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
})
