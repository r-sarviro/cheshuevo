import type { ISelectPeriodValue } from '@/features/select-period'

/** Tomorrow 13:00–15:00 — avoids Cheshuika demo busy window 10:00–12:00. */
export function createDefaultPeriod(now = new Date()): ISelectPeriodValue {
  const day = new Date(now)
  day.setDate(day.getDate() + 1)
  const date = [
    day.getFullYear(),
    String(day.getMonth() + 1).padStart(2, '0'),
    String(day.getDate()).padStart(2, '0'),
  ].join('-')

  return {
    startDate: date,
    startTime: '13:00',
    endDate: date,
    endTime: '15:00',
  }
}
