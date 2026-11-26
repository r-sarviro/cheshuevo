import { describe, expect, it } from 'vitest'

import { bookingContactsSchema } from './bookingContactsSchema'

describe('bookingContactsSchema', () => {
  it('accepts valid contacts and normalizes', () => {
    expect(
      bookingContactsSchema.parse({
        name: '  Anna ',
        email: '  Anna@Example.COM ',
      }),
    ).toEqual({ name: 'Anna', email: 'anna@example.com' })
  })

  it('rejects empty name with i18n key', () => {
    const result = bookingContactsSchema.safeParse({
      name: '   ',
      email: 'anna@example.com',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('booking.nameRequired')
    }
  })

  it('rejects invalid email with i18n key', () => {
    const result = bookingContactsSchema.safeParse({
      name: 'Anna',
      email: 'bad',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message === 'ds.emailError')).toBe(
        true,
      )
    }
  })
})
