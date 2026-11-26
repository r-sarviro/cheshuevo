export type {
  IAvailabilityQuery,
  IAvailabilityResult,
  IBooking,
  IBookingInterval,
  ICreateBookingPayload,
  ICreateCustomerBookingPayload,
  TBookingStatus,
  TPaymentStatus,
} from './model/types'
export type { ICustomerBooking } from './model/customerTypes'
export {
  BOOKING_STATUSES,
  BOOKING_STATUS_TO_BADGE,
  PAYMENT_STATUSES,
  PAYMENT_STATUS_TO_BADGE,
} from './model/types'
export {
  createBooking,
  createCustomerBooking,
  getAvailability,
} from './api/bookingsApi'
export {
  createBookingStub,
  createCustomerBookingStub,
  getAvailabilityStub,
  type TAvailabilityStubQuery,
  type TCreateBookingStubPayload,
  type TCreateCustomerBookingStubPayload,
} from './api/bookingsStub'
export {
  assertCustomerCanRequestLoginStub,
  CABINET_DEMO_EMAIL,
  customerHasBookingsStub,
  getCustomerBookingStub,
  getCustomerNameStub,
  listCustomerBookingsStub,
  markCustomerBookingCancelled,
  rememberCreatedBooking,
  rememberCustomerName,
  resetCustomerBookingsStub,
} from './api/customerBookingsStub'
export { bookingQueryKeys } from './api/queryKeys'
export {
  useAvailabilityQuery,
  useCreateBookingMutation,
  useCreateCustomerBookingMutation,
  useCustomerBookingQuery,
  useCustomerBookingsQuery,
} from './api/useBookingQueries'
export {
  billableHours,
  isMinDurationOk,
  overlapsBusyWindow,
  periodToInterval,
  periodToIso,
  type TBookingPeriodValue,
} from './lib/period'
export { splitCustomerBookings } from './lib/splitCustomerBookings'
export { default as BookingResult } from './ui/BookingResult'
export type { IBookingResultProps } from './ui/BookingResult'
