import { z } from 'zod'

/** Shared email field: trim, lowercase, then format check (i18n key in message). */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: 'ds.emailError' }))

/** Shared 6-digit OTP code (i18n key in message). */
export const otpCodeSchema = z
  .string()
  .regex(/^\d{6}$/, { error: 'ds.otpError' })

export const otpFormSchema = z.object({
  code: otpCodeSchema,
})

export type TOtpFormValues = z.infer<typeof otpFormSchema>
