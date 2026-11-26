import { describe, expect, it } from 'vitest'

import { RENTAL_EMAIL, RENTAL_PHONE, formatRentalContacts } from './rental'

describe('formatRentalContacts', () => {
  it('joins default phone and email', () => {
    expect(formatRentalContacts()).toBe(`${RENTAL_PHONE} / ${RENTAL_EMAIL}`)
  })

  it('joins custom phone and email', () => {
    expect(formatRentalContacts('+7 111', 'a@b.c')).toBe('+7 111 / a@b.c')
  })
})
