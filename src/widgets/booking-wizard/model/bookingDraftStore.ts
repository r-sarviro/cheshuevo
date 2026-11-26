import { create } from 'zustand'

import type { IBooking } from '@/entities/booking'
import type { TBookingContactsValue } from '@/features/booking-contacts'
import type { TSelectPeriodValue } from '@/features/select-period'

export type TBookingStep = 'period' | 'contacts' | 'otp' | 'result' | 'conflict'

export type TBookingDraftState = {
  dragonId: number | null
  step: TBookingStep
  period: TSelectPeriodValue | null
  contacts: TBookingContactsValue | null
  verificationId: string | null
  verificationToken: string | null
  resendAfterSeconds: number
  otpAttemptsLeft: number | null
  otpExhausted: boolean
  createdBooking: IBooking | null
  conflictMessage: string | null
  resetForDragon: (dragonId: number, period: TSelectPeriodValue) => void
  setStep: (step: TBookingStep) => void
  setPeriod: (period: TSelectPeriodValue) => void
  setContacts: (contacts: TBookingContactsValue) => void
  setVerification: (payload: {
    verificationId: string
    resendAfterSeconds: number
  }) => void
  setVerificationToken: (token: string) => void
  setOtpFeedback: (payload: {
    attemptsLeft?: number | null
    exhausted?: boolean
  }) => void
  setCreatedBooking: (booking: IBooking) => void
  setConflict: (message: string) => void
  clearSession: () => void
}

const empty = {
  dragonId: null as number | null,
  step: 'period' as TBookingStep,
  period: null as TSelectPeriodValue | null,
  contacts: null as TBookingContactsValue | null,
  verificationId: null as string | null,
  verificationToken: null as string | null,
  resendAfterSeconds: 0,
  otpAttemptsLeft: null as number | null,
  otpExhausted: false,
  createdBooking: null as IBooking | null,
  conflictMessage: null as string | null,
}

export const useBookingDraftStore = create<TBookingDraftState>((set) => ({
  ...empty,
  resetForDragon: (dragonId, period) =>
    set({
      ...empty,
      dragonId,
      period,
      step: 'period',
    }),
  setStep: (step) => set({ step }),
  setPeriod: (period) => set({ period, conflictMessage: null }),
  setContacts: (contacts) => set({ contacts }),
  setVerification: ({ verificationId, resendAfterSeconds }) =>
    set({
      verificationId,
      resendAfterSeconds,
      verificationToken: null,
      otpAttemptsLeft: null,
      otpExhausted: false,
    }),
  setVerificationToken: (verificationToken) => set({ verificationToken }),
  setOtpFeedback: ({ attemptsLeft, exhausted }) =>
    set((state) => ({
      otpAttemptsLeft:
        attemptsLeft === undefined ? state.otpAttemptsLeft : attemptsLeft,
      otpExhausted: exhausted === undefined ? state.otpExhausted : exhausted,
    })),
  setCreatedBooking: (createdBooking) =>
    set({ createdBooking, step: 'result', conflictMessage: null }),
  setConflict: (conflictMessage) =>
    set({ conflictMessage, step: 'conflict', createdBooking: null }),
  clearSession: () => set({ ...empty }),
}))
