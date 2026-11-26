import { z } from 'zod'

import { isMinDurationOk, periodToInterval } from '@/entities/booking'

/** Booking period fields with min-duration refine (i18n key on endTime). */
export const selectPeriodSchema = z
  .object({
    startDate: z.string().min(1, { error: 'booking.periodError' }),
    startTime: z.string().min(1, { error: 'booking.periodError' }),
    endDate: z.string().min(1, { error: 'booking.periodError' }),
    endTime: z.string().min(1, { error: 'booking.periodError' }),
  })
  .superRefine((value, ctx) => {
    const interval = periodToInterval(value)
    if (!isMinDurationOk(interval.startsAt, interval.endsAt)) {
      ctx.addIssue({
        code: 'custom',
        message: 'booking.periodError',
        path: ['endTime'],
      })
    }
  })

export type TSelectPeriodValue = z.infer<typeof selectPeriodSchema>
