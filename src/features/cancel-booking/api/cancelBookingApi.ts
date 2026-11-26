import { ApiError } from '@/shared/api'

export interface ICancelBookingPayload {
  bookingNumber: string
  startsAt: string
}

export interface ICancelBookingResult {
  bookingNumber: string
  status: 'CANCELLED'
  cancelledAt: string
}

/** Placeholder until customer cancel endpoint is wired. */
export async function cancelBooking(
  payload: ICancelBookingPayload,
): Promise<ICancelBookingResult> {
  void payload
  throw new ApiError(
    501,
    'NOT_IMPLEMENTED',
    'Cancel booking API is not wired yet',
  )
}
