export type {
  IAvailabilityQuery,
  IAvailabilityResult,
  IBooking,
  IBookingInterval,
  ICabinetApiSession,
  ICreateBookingPayload,
  ICreateCustomerBookingPayload,
  TBookingStatus,
  TPaymentStatus,
} from './model/types'
export type {
  ICustomerBooking,
  ICustomerBookingDragon,
  ICustomerBookingPayment,
} from './model/customerTypes'
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
  getCustomerBooking,
  getCustomerBookings,
} from './api/bookingsApi'
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
  periodToInterval,
  periodToIso,
  type TBookingPeriodValue,
} from './lib/period'
export { splitCustomerBookings } from './lib/splitCustomerBookings'
export { default as BookingResult } from './ui/BookingResult'
export type { IBookingResultProps } from './ui/BookingResult'
