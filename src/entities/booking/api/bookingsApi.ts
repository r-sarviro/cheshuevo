import { apiRequest } from '@/shared/api'

import type {
  IAvailabilityQuery,
  IAvailabilityResult,
  IBooking,
  ICreateBookingPayload,
  ICreateCustomerBookingPayload,
} from '../model/types'

/** GET /api/v1/public/availability */
export function getAvailability(query: IAvailabilityQuery) {
  const params = new URLSearchParams({
    dragon_id: String(query.dragonId),
    starts_at: query.startsAt,
    ends_at: query.endsAt,
  })
  return apiRequest<IAvailabilityResult>(
    `/public/availability?${params.toString()}`,
  )
}

/** POST /api/v1/public/bookings */
export function createBooking(
  payload: ICreateBookingPayload,
  idempotencyKey?: string,
) {
  return apiRequest<IBooking>('/public/bookings', {
    method: 'POST',
    body: {
      dragon_id: payload.dragonId,
      starts_at: payload.startsAt,
      ends_at: payload.endsAt,
      customer_name: payload.customerName,
      customer_email: payload.customerEmail,
      verification_token: payload.verificationToken,
    },
    idempotencyKey,
  })
}

/** POST /api/v1/customer/bookings — session booking, no OTP. */
export function createCustomerBooking(
  payload: ICreateCustomerBookingPayload,
  idempotencyKey?: string,
) {
  return apiRequest<IBooking>('/customer/bookings', {
    method: 'POST',
    body: {
      dragon_id: payload.dragonId,
      starts_at: payload.startsAt,
      ends_at: payload.endsAt,
    },
    idempotencyKey,
  })
}
