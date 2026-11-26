import { describe, expect, it } from 'vitest'

import { emailSchema, otpCodeSchema, otpFormSchema } from './schemas'

describe('emailSchema', () => {
  it('accepts and normalizes email', () => {
    expect(emailSchema.parse('  Ann@Example.COM ')).toBe('ann@example.com')
  })

  it('rejects invalid email with i18n key', () => {
    const result = emailSchema.safeParse('not-an-email')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('ds.emailError')
    }
  })
})

describe('otpCodeSchema', () => {
  it('accepts six digits', () => {
    expect(otpCodeSchema.parse('123456')).toBe('123456')
  })

  it('rejects short code with i18n key', () => {
    const result = otpCodeSchema.safeParse('12')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('ds.otpError')
    }
  })
})

describe('otpFormSchema', () => {
  it('parses code object', () => {
    expect(otpFormSchema.parse({ code: '000000' })).toEqual({ code: '000000' })
  })
})
