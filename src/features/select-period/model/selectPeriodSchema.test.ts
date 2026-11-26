import { describe, expect, it } from 'vitest'

import { selectPeriodSchema } from './selectPeriodSchema'

describe('selectPeriodSchema', () => {
  it('accepts a one-hour window', () => {
    expect(
      selectPeriodSchema.parse({
        startDate: '2026-11-25',
        startTime: '13:00',
        endDate: '2026-11-25',
        endTime: '14:00',
      }),
    ).toEqual({
      startDate: '2026-11-25',
      startTime: '13:00',
      endDate: '2026-11-25',
      endTime: '14:00',
    })
  })

  it('rejects zero-length period on endTime', () => {
    const result = selectPeriodSchema.safeParse({
      startDate: '2026-11-25',
      startTime: '13:00',
      endDate: '2026-11-25',
      endTime: '13:00',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(
        result.error.issues.some(
          (issue) =>
            issue.path[0] === 'endTime' &&
            issue.message === 'booking.periodError',
        ),
      ).toBe(true)
    }
  })
})
