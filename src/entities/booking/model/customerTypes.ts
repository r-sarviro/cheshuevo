import type { TBookingStatus, TPaymentStatus } from './types'

export interface ICustomerBookingDragon {
  id: number
  name: string
  nameEn?: string | null
  spriteKey?: string | null
  tileToken?: string | null
  imageUrl?: string | null
}

export interface ICustomerBookingPayment {
  method: string
  amount: number
  currency: string
  paidAt: string
}

/** Booking visible in the customer cabinet (owned by the session customer). */
export interface ICustomerBooking {
  bookingNumber: string
  status: TBookingStatus
  paymentStatus: TPaymentStatus
  isOverdue: boolean
  startsAt: string
  endsAt: string
  billableHours: number
  hourlyRate: number
  totalAmount: number
  currency: string
  issuedAt?: string | null
  returnedAt?: string | null
  cancelledAt?: string | null
  createdAt?: string
  dragon: ICustomerBookingDragon
  payment: ICustomerBookingPayment | null
}
