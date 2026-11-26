import { describe, expect, it } from 'vitest'

import { CABINET_BOOKINGS_PATH, CABINET_LOGIN_PATH } from '@/shared/config'

import { safeReturnPath } from './safeReturnPath'

describe('safeReturnPath', () => {
  it('returns pathname+search+hash for in-app location', () => {
    expect(
      safeReturnPath({
        pathname: '/cabinet/bookings/DR-1',
        search: '?x=1',
        hash: '#top',
      }),
    ).toBe('/cabinet/bookings/DR-1?x=1#top')
  })

  it('falls back for login path and invalid values', () => {
    expect(safeReturnPath({ pathname: CABINET_LOGIN_PATH })).toBe(
      CABINET_BOOKINGS_PATH,
    )
    expect(safeReturnPath({ pathname: 'https://evil.test' })).toBe(
      CABINET_BOOKINGS_PATH,
    )
    expect(safeReturnPath(null)).toBe(CABINET_BOOKINGS_PATH)
  })
})
