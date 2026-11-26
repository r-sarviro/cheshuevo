import { describe, expect, it } from 'vitest'

import { displayCurrency, formatMoney } from './money'

describe('money', () => {
  it('maps RUB to ruble sign', () => {
    expect(displayCurrency('RUB')).toBe('₽')
    expect(formatMoney(420, 'RUB')).toBe('420\u00a0₽')
  })

  it('keeps unknown currency codes', () => {
    expect(formatMoney(10, 'USD')).toBe('10\u00a0USD')
  })
})
