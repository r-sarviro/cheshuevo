export type TBookingPeriodValue = {
  startDate: string
  startTime: string
  endDate: string
  endTime: string
}

/** Build local datetime string for interval math. */
export function periodToIso(date: string, time: string): string {
  return `${date}T${time}:00`
}

export function periodToInterval(value: TBookingPeriodValue) {
  return {
    startsAt: periodToIso(value.startDate, value.startTime),
    endsAt: periodToIso(value.endDate, value.endTime),
  }
}

export function parsePeriodDateTime(iso: string): Date {
  return new Date(iso)
}

/** Billable hours: every started hour counts (ceil of duration). */
export function billableHours(startsAt: string, endsAt: string): number {
  const start = parsePeriodDateTime(startsAt).getTime()
  const end = parsePeriodDateTime(endsAt).getTime()
  const ms = end - start
  if (ms <= 0) return 0
  return Math.max(1, Math.ceil(ms / (60 * 60 * 1000)))
}

export function isMinDurationOk(startsAt: string, endsAt: string): boolean {
  return (
    billableHours(startsAt, endsAt) >= 1 &&
    parsePeriodDateTime(endsAt).getTime() >
      parsePeriodDateTime(startsAt).getTime()
  )
}
