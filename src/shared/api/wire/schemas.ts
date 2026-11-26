/**
 * Manual Zod mirrors of site OpenAPI components.schemas.
 * After `yarn api:types`, re-check enums, nullability, and required fields
 * against generated/schema.d.ts (and update these schemas if they drifted).
 */
import { z } from 'zod'

const bookingStatusSchema = z.enum([
  'CONFIRMED',
  'IN_RENT',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
])

const paymentStatusSchema = z.enum(['UNPAID', 'PAID'])

const paymentMethodSchema = z.enum(['CASH', 'CARD', 'TRANSFER', 'OTHER'])

const customerSessionSchema = z.object({
  token: z.string(),
  token_type: z.string(),
  expires_at: z.string().nullable(),
})

const dragonTagSchema = z.object({
  key: z.string().nullable().optional(),
  label: z.string().nullable().optional(),
})

/** Mirrors OpenAPI DragonResource + optional unpublished locale fields. */
export const dragonResourceSchema = z.object({
  id: z.number(),
  name: z.string(),
  short_description: z.string(),
  description: z.string().optional(),
  name_en: z.string().nullable(),
  short_description_en: z.string().nullable(),
  description_en: z.string().nullable().optional(),
  image_url: z.string().nullable(),
  sprite_key: z.string().nullable(),
  tile_token: z.string().nullable(),
  hourly_rate: z.number(),
  currency: z.string(),
  operational_status: z.enum(['ACTIVE', 'MAINTENANCE', 'INACTIVE']),
  // TODO(api): promote when OpenAPI includes these fields.
  tags: z.array(dragonTagSchema).nullable().optional(),
  fit: z.string().nullable().optional(),
  best_for: z.string().nullable().optional(),
})

export const dragonsListSchema = z.object({
  data: z.array(dragonResourceSchema),
})

export const dragonDetailSchema = z.object({
  data: dragonResourceSchema,
})

export const availabilitySchema = z.object({
  available: z.boolean(),
  billable_hours: z.number(),
  hourly_rate: z.number(),
  total_amount: z.number(),
  currency: z.string(),
  reason: z.string().nullable(),
})

export const publicBookingCreatedSchema = z.object({
  booking_number: z.string(),
  status: bookingStatusSchema,
  payment_status: paymentStatusSchema,
  total_amount: z.number(),
  currency: z.string(),
  starts_at: z.string(),
  ends_at: z.string(),
  billable_hours: z.number(),
  dragon_id: z.number(),
  dragon_name: z.string().nullable(),
  confirmation_email_queued: z.boolean(),
  session: customerSessionSchema.nullable(),
})

const customerBookingDragonSchema = z.object({
  id: z.number(),
  name: z.string(),
  name_en: z.string().nullable(),
  sprite_key: z.string().nullable(),
  tile_token: z.string().nullable(),
  image_url: z.string().nullable(),
})

const customerBookingPaymentSchema = z.object({
  method: paymentMethodSchema,
  amount: z.number(),
  currency: z.string(),
  paid_at: z.string().nullable(),
})

export const customerBookingResourceSchema = z.object({
  booking_number: z.string(),
  status: bookingStatusSchema,
  payment_status: paymentStatusSchema,
  is_overdue: z.boolean(),
  starts_at: z.string().nullable(),
  ends_at: z.string().nullable(),
  billable_hours: z.number(),
  hourly_rate: z.number(),
  total_amount: z.number(),
  currency: z.string(),
  issued_at: z.string().nullable(),
  returned_at: z.string().nullable(),
  cancelled_at: z.string().nullable(),
  created_at: z.string().nullable(),
  dragon: customerBookingDragonSchema,
  payment: customerBookingPaymentSchema.nullable().optional(),
})

export const customerBookingsListSchema = z.object({
  data: z.array(customerBookingResourceSchema),
})

export const customerBookingDetailSchema = z.object({
  data: customerBookingResourceSchema,
})

export const customerMeSchema = z.object({
  customer: z.object({
    name: z.string(),
    email: z.string(),
  }),
})

export const emailVerificationCreatedSchema = z.object({
  verification_id: z.string(),
  expires_at: z.string(),
  resend_after_seconds: z.number(),
})

export const emailVerificationConfirmedSchema = z.object({
  verification_token: z.string(),
  expires_at: z.string(),
  session: customerSessionSchema.nullable(),
})
