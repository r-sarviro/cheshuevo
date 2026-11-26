import {
  apiRequest,
  availabilitySchema,
  createIdempotencyKey,
  customerBookingDetailSchema,
  customerBookingsListSchema,
  parseWire,
  publicBookingCreatedSchema,
  type TCustomerBookingRequest,
  type TPublicBookingRequest,
} from '@/shared/api'

import type { ICustomerBooking } from '../model/customerTypes'
import type {
  IAvailabilityQuery,
  IAvailabilityResult,
  IBooking,
  ICreateBookingPayload,
  ICreateCustomerBookingPayload,
} from '../model/types'
import {
  mapAvailability,
  mapCreatedBooking,
  mapCustomerBooking,
} from './mapBooking'

/** GET /api/v1/public/availability */
export async function getAvailability(
  query: IAvailabilityQuery,
  signal?: AbortSignal,
): Promise<IAvailabilityResult> {
  const params = new URLSearchParams({
    dragon_id: String(query.dragonId),
    starts_at: query.startsAt,
    ends_at: query.endsAt,
  })
  const raw = await apiRequest<unknown>(
    `/public/availability?${params.toString()}`,
    { signal },
  )
  return mapAvailability(parseWire(availabilitySchema, raw))
}

/** POST /api/v1/public/bookings */
export async function createBooking(
  payload: ICreateBookingPayload,
  idempotencyKey: string = createIdempotencyKey(),
): Promise<IBooking> {
  const body: TPublicBookingRequest = {
    dragon_id: payload.dragonId,
    starts_at: payload.startsAt,
    ends_at: payload.endsAt,
    customer_name: payload.customerName,
    customer_email: payload.customerEmail,
    verification_token: payload.verificationToken,
  }
  const raw = await apiRequest<unknown>('/public/bookings', {
    method: 'POST',
    body,
    idempotencyKey,
  })
  return mapCreatedBooking(parseWire(publicBookingCreatedSchema, raw))
}

/** POST /api/v1/customer/bookings — session booking, no OTP. */
export async function createCustomerBooking(
  payload: ICreateCustomerBookingPayload,
  idempotencyKey: string = createIdempotencyKey(),
): Promise<IBooking> {
  const body: TCustomerBookingRequest = {
    dragon_id: payload.dragonId,
    starts_at: payload.startsAt,
    ends_at: payload.endsAt,
  }
  const raw = await apiRequest<unknown>('/customer/bookings', {
    method: 'POST',
    auth: 'customer',
    body,
    idempotencyKey,
  })
  return mapCreatedBooking(parseWire(publicBookingCreatedSchema, raw))
}

/** GET /api/v1/customer/bookings */
export async function getCustomerBookings(
  signal?: AbortSignal,
): Promise<ICustomerBooking[]> {
  const raw = await apiRequest<unknown>('/customer/bookings', {
    auth: 'customer',
    signal,
  })
  const wire = parseWire(customerBookingsListSchema, raw)
  return wire.data.map(mapCustomerBooking)
}

/** GET /api/v1/customer/bookings/{booking_number} */
export async function getCustomerBooking(
  bookingNumber: string,
  signal?: AbortSignal,
): Promise<ICustomerBooking> {
  const raw = await apiRequest<unknown>(
    `/customer/bookings/${encodeURIComponent(bookingNumber)}`,
    {
      auth: 'customer',
      signal,
    },
  )
  const wire = parseWire(customerBookingDetailSchema, raw)
  return mapCustomerBooking(wire.data)
}
