import type { IBooking } from './types'

/** Booking visible in the customer cabinet (owned by email). */
export interface ICustomerBooking extends IBooking {
  customerEmail: string
  cancelledAt?: string
  issuedAt?: string
  returnedAt?: string
}
