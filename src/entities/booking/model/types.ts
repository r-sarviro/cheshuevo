import type { ICabinetApiSession } from '@/shared/api'

export type { ICabinetApiSession }

export const BOOKING_STATUSES = [
  'CONFIRMED',
  'IN_RENT',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
] as const

export type TBookingStatus = (typeof BOOKING_STATUSES)[number]

export const PAYMENT_STATUSES = ['UNPAID', 'PAID'] as const

export type TPaymentStatus = (typeof PAYMENT_STATUSES)[number]

export interface IBookingInterval {
  startsAt: string
  endsAt: string
}

export interface IAvailabilityQuery extends IBookingInterval {
  dragonId: number
}

export interface IAvailabilityResult {
  available: boolean
  billableHours?: number
  hourlyRate?: number
  totalAmount?: number
  currency?: string
  reason?: string
}

export interface ICreateBookingPayload extends IBookingInterval {
  dragonId: number
  customerName: string
  customerEmail: string
  verificationToken: string
}

/** Session booking: identity comes from cabinet session (no OTP token). */
export interface ICreateCustomerBookingPayload extends IBookingInterval {
  dragonId: number
}

export interface IBooking {
  bookingNumber: string
  status: TBookingStatus
  paymentStatus: TPaymentStatus
  totalAmount: number
  currency: string
  startsAt: string
  endsAt: string
  billableHours?: number
  dragonId?: number
  dragonName?: string
  confirmationEmailQueued?: boolean
  session?: ICabinetApiSession | null
}

/** Maps TZ booking status to foundation badge data-status keys. */
export const BOOKING_STATUS_TO_BADGE = {
  CONFIRMED: 'confirmed',
  IN_RENT: 'in_rent',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
} as const

export const PAYMENT_STATUS_TO_BADGE = {
  UNPAID: 'unpaid',
  PAID: 'paid',
} as const
