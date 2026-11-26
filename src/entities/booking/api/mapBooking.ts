import {
  ApiError,
  mapCustomerSession,
  type TAvailabilitySchema,
  type TCustomerBookingResource,
  type TCustomerSessionSchema,
  type TPublicBookingCreated,
} from '@/shared/api'

import type { ICustomerBooking } from '../model/customerTypes'
import type {
  IAvailabilityResult,
  IBooking,
  ICabinetApiSession,
} from '../model/types'

/** Thin alias over shared mapCustomerSession (kept for local mapper tests). */
export function mapSession(
  wire: TCustomerSessionSchema | null,
): ICabinetApiSession | null {
  return mapCustomerSession(wire)
}

export function mapCreatedBooking(wire: TPublicBookingCreated): IBooking {
  return {
    bookingNumber: wire.booking_number,
    status: wire.status,
    paymentStatus: wire.payment_status,
    totalAmount: wire.total_amount,
    currency: wire.currency,
    startsAt: wire.starts_at,
    endsAt: wire.ends_at,
    billableHours: wire.billable_hours,
    dragonId: wire.dragon_id,
    dragonName: wire.dragon_name ?? undefined,
    confirmationEmailQueued: wire.confirmation_email_queued,
    session: mapCustomerSession(wire.session),
  }
}

export function mapCustomerBooking(
  wire: TCustomerBookingResource,
): ICustomerBooking {
  const dragon = wire.dragon
  if (!dragon) {
    throw new ApiError(
      0,
      'INVALID_RESPONSE',
      'Customer booking is missing dragon payload',
    )
  }

  return {
    bookingNumber: wire.booking_number,
    status: wire.status,
    paymentStatus: wire.payment_status,
    isOverdue: wire.is_overdue,
    startsAt: wire.starts_at ?? '',
    endsAt: wire.ends_at ?? '',
    billableHours: wire.billable_hours,
    hourlyRate: wire.hourly_rate,
    totalAmount: wire.total_amount,
    currency: wire.currency,
    issuedAt: wire.issued_at,
    returnedAt: wire.returned_at,
    cancelledAt: wire.cancelled_at,
    createdAt: wire.created_at ?? undefined,
    dragon: {
      id: dragon.id,
      name: dragon.name,
      nameEn: dragon.name_en,
      spriteKey: dragon.sprite_key,
      tileToken: dragon.tile_token,
      imageUrl: dragon.image_url,
    },
    payment: wire.payment
      ? {
          method: wire.payment.method,
          amount: wire.payment.amount,
          currency: wire.payment.currency,
          paidAt: wire.payment.paid_at ?? '',
        }
      : null,
  }
}

export function mapAvailability(wire: TAvailabilitySchema): IAvailabilityResult {
  return {
    available: wire.available,
    billableHours: wire.billable_hours,
    hourlyRate: wire.hourly_rate,
    totalAmount: wire.total_amount,
    currency: wire.currency,
    reason: wire.reason ?? undefined,
  }
}
