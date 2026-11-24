import { ApiError, STUB_CONFLICT_TOKEN_PREFIX, stubDelay } from '@/shared/api'

import {
  billableHours,
  isMinDurationOk,
  overlapsBusyWindow,
} from '../lib/period'
import type {
  IAvailabilityQuery,
  IAvailabilityResult,
  IBooking,
  ICreateBookingPayload,
} from '../model/types'

let bookingSeq = 1025

export type TAvailabilityStubQuery = IAvailabilityQuery & {
  hourlyRate: number
  currency: string
  dragonName?: string
}

export type TCreateBookingStubPayload = ICreateBookingPayload & {
  hourlyRate: number
  currency: string
  dragonName: string
}

/** Stub: availability + quote for a dragon interval. */
export async function getAvailabilityStub(
  query: TAvailabilityStubQuery,
): Promise<IAvailabilityResult> {
  await stubDelay(350)

  if (!isMinDurationOk(query.startsAt, query.endsAt)) {
    return { available: false }
  }

  if (overlapsBusyWindow(query.dragonId, query.startsAt, query.endsAt)) {
    return { available: false }
  }

  const hours = billableHours(query.startsAt, query.endsAt)
  return {
    available: true,
    billableHours: hours,
    hourlyRate: query.hourlyRate,
    totalAmount: hours * query.hourlyRate,
    currency: query.currency,
  }
}

/** Stub: create booking after email verification. */
export async function createBookingStub(
  payload: TCreateBookingStubPayload,
): Promise<IBooking> {
  await stubDelay(500)

  if (!payload.verificationToken) {
    throw new ApiError(401, 'EMAIL_NOT_VERIFIED', 'Email is not verified')
  }

  if (!isMinDurationOk(payload.startsAt, payload.endsAt)) {
    throw new ApiError(400, 'INVALID_PERIOD', 'Invalid booking period')
  }

  const forceConflict = payload.verificationToken.startsWith(
    STUB_CONFLICT_TOKEN_PREFIX,
  )

  if (
    forceConflict ||
    overlapsBusyWindow(payload.dragonId, payload.startsAt, payload.endsAt)
  ) {
    throw new ApiError(
      409,
      'BOOKING_CONFLICT',
      'This time slot is no longer available',
    )
  }

  const hours = billableHours(payload.startsAt, payload.endsAt)
  const number = `DR-${String(bookingSeq++).padStart(6, '0')}`

  return {
    bookingNumber: number,
    status: 'CONFIRMED',
    paymentStatus: 'UNPAID',
    totalAmount: hours * payload.hourlyRate,
    currency: payload.currency,
    startsAt: payload.startsAt,
    endsAt: payload.endsAt,
    billableHours: hours,
    dragonId: payload.dragonId,
    dragonName: payload.dragonName,
  }
}
