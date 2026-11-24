export type TBookingPeriodValue = {
  startDate: string
  startTime: string
  endDate: string
  endTime: string
}

/** Build local datetime string for stub interval math. */
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

/** Cheshuika (id 1) demo busy window: 10:00–12:00 on the start date. */
export function overlapsBusyWindow(
  dragonId: number,
  startsAt: string,
  endsAt: string,
): boolean {
  if (dragonId !== 1) return false
  const start = parsePeriodDateTime(startsAt)
  const end = parsePeriodDateTime(endsAt)
  const day = startsAt.slice(0, 10)
  const busyStart = parsePeriodDateTime(`${day}T10:00:00`)
  const busyEnd = parsePeriodDateTime(`${day}T12:00:00`)
  return start < busyEnd && end > busyStart
}
