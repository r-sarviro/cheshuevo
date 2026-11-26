import { ApiError, stubDelay } from '@/shared/api'

import type { ICustomerBooking } from '../model/customerTypes'
import type { IBooking } from '../model/types'

/** Demo mailbox from the LK prototype. */
export const CABINET_DEMO_EMAIL = 'anna@example.com'

const DAY_MS = 24 * 60 * 60 * 1000

function isoDaysFromNow(days: number, hourUTC: number): string {
  const d = new Date()
  d.setUTCHours(hourUTC, 0, 0, 0)
  d.setTime(d.getTime() + days * DAY_MS)
  return d.toISOString()
}

function buildSeed(email: string): ICustomerBooking[] {
  return [
    {
      bookingNumber: 'DR-001025',
      customerEmail: email,
      status: 'IN_RENT',
      paymentStatus: 'PAID',
      totalAmount: 450,
      currency: '₽',
      startsAt: isoDaysFromNow(-1, 11),
      endsAt: isoDaysFromNow(-1, 14),
      billableHours: 3,
      dragonId: 16,
      dragonName: 'Уголёк',
      issuedAt: isoDaysFromNow(-1, 11),
    },
    {
      bookingNumber: 'DR-001031',
      customerEmail: email,
      status: 'CONFIRMED',
      paymentStatus: 'UNPAID',
      totalAmount: 340,
      currency: '₽',
      startsAt: isoDaysFromNow(2, 10),
      endsAt: isoDaysFromNow(2, 12),
      billableHours: 2,
      dragonId: 7,
      dragonName: 'Хранитель Приливов',
    },
    {
      bookingNumber: 'DR-001028',
      customerEmail: email,
      status: 'CONFIRMED',
      paymentStatus: 'UNPAID',
      totalAmount: 450,
      currency: '₽',
      startsAt: isoDaysFromNow(4, 15),
      endsAt: isoDaysFromNow(4, 18),
      billableHours: 3,
      dragonId: 1,
      dragonName: 'Сакурка',
    },
    {
      bookingNumber: 'DR-001033',
      customerEmail: email,
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      totalAmount: 340,
      currency: '₽',
      startsAt: isoDaysFromNow(6, 12),
      endsAt: isoDaysFromNow(6, 14),
      billableHours: 2,
      dragonId: 13,
      dragonName: 'Ирида',
    },
    {
      bookingNumber: 'DR-001022',
      customerEmail: email,
      status: 'CANCELLED',
      paymentStatus: 'UNPAID',
      totalAmount: 150,
      currency: '₽',
      startsAt: isoDaysFromNow(-3, 18),
      endsAt: isoDaysFromNow(-3, 19),
      billableHours: 1,
      dragonId: 19,
      dragonName: 'Нотка',
      cancelledAt: isoDaysFromNow(-4, 9),
    },
    {
      bookingNumber: 'DR-001019',
      customerEmail: email,
      status: 'COMPLETED',
      paymentStatus: 'PAID',
      totalAmount: 340,
      currency: '₽',
      startsAt: isoDaysFromNow(-5, 12),
      endsAt: isoDaysFromNow(-5, 14),
      billableHours: 2,
      dragonId: 6,
      dragonName: 'Снежок',
      issuedAt: isoDaysFromNow(-5, 12),
      returnedAt: isoDaysFromNow(-5, 14),
    },
    {
      bookingNumber: 'DR-001012',
      customerEmail: email,
      status: 'NO_SHOW',
      paymentStatus: 'UNPAID',
      totalAmount: 170,
      currency: '₽',
      startsAt: isoDaysFromNow(-8, 10),
      endsAt: isoDaysFromNow(-8, 11),
      billableHours: 1,
      dragonId: 17,
      dragonName: 'Бриз',
    },
  ]
}

const store = new Map<string, ICustomerBooking>()
const namesByEmail = new Map<string, string>()

function storeKey(email: string, bookingNumber: string): string {
  return `${email.trim().toLowerCase()}::${bookingNumber}`
}

function ensureSeed(email: string) {
  const normalized = email.trim().toLowerCase()
  // Prototype demo data only for the known mailbox; other emails start empty.
  if (normalized !== CABINET_DEMO_EMAIL) return
  const hasAny = [...store.values()].some((b) => b.customerEmail === normalized)
  if (hasAny) return
  for (const booking of buildSeed(normalized)) {
    store.set(storeKey(normalized, booking.bookingNumber), booking)
  }
  if (!namesByEmail.has(normalized)) {
    namesByEmail.set(normalized, 'Анна')
  }
}

/** Reset stub store (tests). */
export function resetCustomerBookingsStub() {
  store.clear()
  namesByEmail.clear()
}

/** Persist display name from a booking or profile update. */
export function rememberCustomerName(email: string, name: string) {
  const trimmed = name.trim()
  if (!trimmed) return
  namesByEmail.set(email.trim().toLowerCase(), trimmed)
}

/** Name known for an email after booking / demo seed (sync). */
export function getCustomerNameStub(email: string): string | null {
  const normalized = email.trim().toLowerCase()
  ensureSeed(normalized)
  return namesByEmail.get(normalized) ?? null
}

/** Whether the mailbox has at least one booking (sync; seeds demo data). */
export function customerHasBookingsStub(email: string): boolean {
  const normalized = email.trim().toLowerCase()
  if (!normalized) return false
  ensureSeed(normalized)
  return [...store.values()].some((b) => b.customerEmail === normalized)
}

/**
 * Cabinet login gate: throw if the email has no bookings.
 * Code must not be sent in that case (CAB-002 / 4.6).
 */
export function assertCustomerCanRequestLoginStub(email: string) {
  if (customerHasBookingsStub(email)) return
  throw new ApiError(404, 'NO_BOOKINGS', 'No bookings for this email')
}

/** Attach a newly created public booking to the cabinet stub store. */
export function rememberCreatedBooking(
  booking: IBooking,
  customerEmail: string,
  customerName?: string,
) {
  const email = customerEmail.trim().toLowerCase()
  store.set(storeKey(email, booking.bookingNumber), {
    ...booking,
    customerEmail: email,
  })
  if (customerName) rememberCustomerName(email, customerName)
}

/** Stub: GET /api/v1/customer/bookings */
export async function listCustomerBookingsStub(
  email: string,
): Promise<ICustomerBooking[]> {
  await stubDelay(350)
  const normalized = email.trim().toLowerCase()
  if (!normalized) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Not signed in')
  }
  ensureSeed(normalized)
  return [...store.values()]
    .filter((b) => b.customerEmail === normalized)
    .sort((a, b) => Date.parse(b.startsAt) - Date.parse(a.startsAt))
}

/** Stub: GET /api/v1/customer/bookings/{booking_number} */
export async function getCustomerBookingStub(
  email: string,
  bookingNumber: string,
): Promise<ICustomerBooking> {
  await stubDelay(300)
  const normalized = email.trim().toLowerCase()
  if (!normalized) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Not signed in')
  }
  ensureSeed(normalized)
  const booking = store.get(storeKey(normalized, bookingNumber))
  if (!booking || booking.customerEmail !== normalized) {
    throw new ApiError(404, 'BOOKING_NOT_FOUND', 'Booking not found')
  }
  return booking
}

/** Apply cancel result into the stub store. */
export function markCustomerBookingCancelled(
  email: string,
  bookingNumber: string,
  cancelledAt: string,
) {
  const normalized = email.trim().toLowerCase()
  const key = storeKey(normalized, bookingNumber)
  const booking = store.get(key)
  if (!booking || booking.customerEmail !== normalized) return
  store.set(key, {
    ...booking,
    status: 'CANCELLED',
    paymentStatus: 'UNPAID',
    cancelledAt,
  })
}
