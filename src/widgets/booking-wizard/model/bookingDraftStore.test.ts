import { beforeEach, describe, expect, it } from 'vitest'

import type { IBooking } from '@/entities/booking'

import { useBookingDraftStore } from './bookingDraftStore'

const PERIOD = {
  startDate: '2026-11-25',
  startTime: '13:00',
  endDate: '2026-11-25',
  endTime: '15:00',
}

const CONTACTS = {
  name: 'Тест',
  email: 'test@example.com',
}

const BOOKING: IBooking = {
  bookingNumber: 'DR-001025',
  status: 'CONFIRMED',
  paymentStatus: 'UNPAID',
  totalAmount: 340,
  currency: 'RUB',
  startsAt: '2026-11-25T13:00:00',
  endsAt: '2026-11-25T15:00:00',
  billableHours: 2,
  dragonId: 2,
  dragonName: 'Кристаллион',
}

describe('useBookingDraftStore', () => {
  beforeEach(() => {
    useBookingDraftStore.getState().clearSession()
  })

  it('resets draft for a dragon on period step', () => {
    useBookingDraftStore.getState().setStep('otp')
    useBookingDraftStore.getState().setContacts(CONTACTS)

    useBookingDraftStore.getState().resetForDragon(2, PERIOD)

    const state = useBookingDraftStore.getState()
    expect(state.dragonId).toBe(2)
    expect(state.step).toBe('period')
    expect(state.period).toEqual(PERIOD)
    expect(state.contacts).toBeNull()
    expect(state.verificationId).toBeNull()
    expect(state.createdBooking).toBeNull()
    expect(state.conflictMessage).toBeNull()
  })

  it('moves through period → contacts → otp', () => {
    useBookingDraftStore.getState().resetForDragon(2, PERIOD)
    useBookingDraftStore.getState().setStep('contacts')
    useBookingDraftStore.getState().setContacts(CONTACTS)
    useBookingDraftStore.getState().setVerification({
      verificationId: 'ver-1',
      resendAfterSeconds: 42,
    })
    useBookingDraftStore.getState().setStep('otp')

    const state = useBookingDraftStore.getState()
    expect(state.step).toBe('otp')
    expect(state.contacts).toEqual(CONTACTS)
    expect(state.verificationId).toBe('ver-1')
    expect(state.resendAfterSeconds).toBe(42)
    expect(state.verificationToken).toBeNull()
    expect(state.otpAttemptsLeft).toBeNull()
    expect(state.otpExhausted).toBe(false)
  })

  it('sets result step on successful booking', () => {
    useBookingDraftStore.getState().resetForDragon(2, PERIOD)
    useBookingDraftStore.getState().setConflict('stale')
    useBookingDraftStore.getState().setCreatedBooking(BOOKING)

    const state = useBookingDraftStore.getState()
    expect(state.step).toBe('result')
    expect(state.createdBooking).toEqual(BOOKING)
    expect(state.conflictMessage).toBeNull()
  })

  it('sets conflict step and clears booking', () => {
    useBookingDraftStore.getState().resetForDragon(2, PERIOD)
    useBookingDraftStore.getState().setCreatedBooking(BOOKING)
    useBookingDraftStore.getState().setConflict('Слот занят')

    const state = useBookingDraftStore.getState()
    expect(state.step).toBe('conflict')
    expect(state.conflictMessage).toBe('Слот занят')
    expect(state.createdBooking).toBeNull()
  })

  it('stores OTP feedback without wiping other fields', () => {
    useBookingDraftStore.getState().resetForDragon(2, PERIOD)
    useBookingDraftStore.getState().setVerification({
      verificationId: 'ver-2',
      resendAfterSeconds: 42,
    })
    useBookingDraftStore.getState().setOtpFeedback({ attemptsLeft: 3 })
    useBookingDraftStore.getState().setOtpFeedback({ exhausted: true })

    const state = useBookingDraftStore.getState()
    expect(state.otpAttemptsLeft).toBe(3)
    expect(state.otpExhausted).toBe(true)
    expect(state.verificationId).toBe('ver-2')
  })

  it('clears the whole session', () => {
    useBookingDraftStore.getState().resetForDragon(2, PERIOD)
    useBookingDraftStore.getState().setContacts(CONTACTS)
    useBookingDraftStore.getState().setCreatedBooking(BOOKING)
    useBookingDraftStore.getState().clearSession()

    const state = useBookingDraftStore.getState()
    expect(state.dragonId).toBeNull()
    expect(state.step).toBe('period')
    expect(state.period).toBeNull()
    expect(state.contacts).toBeNull()
    expect(state.createdBooking).toBeNull()
  })
})
