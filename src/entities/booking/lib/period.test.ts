import { describe, expect, it } from 'vitest'

import { billableHours, isMinDurationOk, overlapsBusyWindow } from './period'

describe('billableHours', () => {
  it('counts an exact hour as 1', () => {
    expect(billableHours('2026-11-25T13:00:00', '2026-11-25T14:00:00')).toBe(1)
  })

  it('ceils a started extra minute to the next hour', () => {
    expect(billableHours('2026-11-25T13:00:00', '2026-11-25T14:01:00')).toBe(2)
  })

  it('returns 0 when end is not after start', () => {
    expect(billableHours('2026-11-25T13:00:00', '2026-11-25T13:00:00')).toBe(0)
    expect(billableHours('2026-11-25T14:00:00', '2026-11-25T13:00:00')).toBe(0)
  })
})

describe('isMinDurationOk', () => {
  it('accepts a period of at least one hour', () => {
    expect(isMinDurationOk('2026-11-25T13:00:00', '2026-11-25T14:00:00')).toBe(
      true,
    )
  })

  it('rejects zero or negative duration', () => {
    expect(isMinDurationOk('2026-11-25T13:00:00', '2026-11-25T13:00:00')).toBe(
      false,
    )
    expect(isMinDurationOk('2026-11-25T14:00:00', '2026-11-25T13:00:00')).toBe(
      false,
    )
  })
})

describe('overlapsBusyWindow', () => {
  it('ignores dragons other than Sakurka (id 1)', () => {
    expect(
      overlapsBusyWindow(2, '2026-11-25T10:00:00', '2026-11-25T12:00:00'),
    ).toBe(false)
  })

  it('detects overlap with Sakurka 10:00–12:00', () => {
    expect(
      overlapsBusyWindow(1, '2026-11-25T09:00:00', '2026-11-25T11:00:00'),
    ).toBe(true)
    expect(
      overlapsBusyWindow(1, '2026-11-25T10:00:00', '2026-11-25T12:00:00'),
    ).toBe(true)
  })

  it('treats touching busy edges as free', () => {
    expect(
      overlapsBusyWindow(1, '2026-11-25T09:00:00', '2026-11-25T10:00:00'),
    ).toBe(false)
    expect(
      overlapsBusyWindow(1, '2026-11-25T12:00:00', '2026-11-25T14:00:00'),
    ).toBe(false)
  })
})
