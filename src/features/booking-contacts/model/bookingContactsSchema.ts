import { z } from 'zod'

import { emailSchema } from '@/shared/lib'

/** Guest contacts form: name + email before OTP. */
export const bookingContactsSchema = z.object({
  name: z.string().trim().min(1, { error: 'booking.nameRequired' }),
  email: emailSchema,
})

export type TBookingContactsValue = z.infer<typeof bookingContactsSchema>
