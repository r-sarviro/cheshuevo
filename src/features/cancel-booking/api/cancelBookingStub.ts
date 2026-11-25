import { ApiError, stubDelay } from '@/shared/api'

export interface ICancelBookingPayload {
  bookingNumber: string
  /** ISO start; stub checks against "now" for already-started. */
  startsAt: string
}

export interface ICancelBookingResult {
  bookingNumber: string
  status: 'CANCELLED'
  cancelledAt: string
}

type TNextOutcome = 'ok' | 'fail' | 'started'

let nextOutcome: TNextOutcome = 'ok'

/** Test/demo helper for cancel stub outcomes. */
export function setCancelBookingStubOutcome(outcome: TNextOutcome) {
  nextOutcome = outcome
}

/** Stub: POST /api/v1/customer/bookings/{booking_number}/cancel */
export async function cancelBookingStub(
  payload: ICancelBookingPayload,
): Promise<ICancelBookingResult> {
  await stubDelay(400)
  const outcome = nextOutcome
  nextOutcome = 'ok'

  if (outcome === 'fail') {
    throw new ApiError(500, 'CANCEL_FAILED', 'Failed to cancel booking')
  }

  const start = Date.parse(payload.startsAt)
  if (outcome === 'started' || (!Number.isNaN(start) && start <= Date.now())) {
    throw new ApiError(409, 'RENTAL_STARTED', 'Rental already started')
  }

  return {
    bookingNumber: payload.bookingNumber,
    status: 'CANCELLED',
    cancelledAt: new Date().toISOString(),
  }
}
