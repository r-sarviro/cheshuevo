export type {
  IAvailabilityQuery,
  IAvailabilityResult,
  IBooking,
  IBookingInterval,
  ICreateBookingPayload,
  TBookingStatus,
  TPaymentStatus,
} from './model/types'
export {
  BOOKING_STATUSES,
  BOOKING_STATUS_TO_BADGE,
  PAYMENT_STATUSES,
  PAYMENT_STATUS_TO_BADGE,
} from './model/types'
export { createBooking, getAvailability } from './api/bookingsApi'
export {
  createBookingStub,
  getAvailabilityStub,
  type TAvailabilityStubQuery,
  type TCreateBookingStubPayload,
} from './api/bookingsStub'
export { bookingQueryKeys } from './api/queryKeys'
export {
  useAvailabilityQuery,
  useCreateBookingMutation,
} from './api/useBookingQueries'
export {
  billableHours,
  isMinDurationOk,
  overlapsBusyWindow,
  periodToInterval,
  periodToIso,
  type TBookingPeriodValue,
} from './lib/period'
export { default as BookingResult } from './ui/BookingResult'
export type { IBookingResultProps } from './ui/BookingResult'
