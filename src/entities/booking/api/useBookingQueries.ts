import { useMutation, useQuery } from '@tanstack/react-query'

import { ApiError } from '@/shared/api'

import type { ICustomerBooking } from '../model/customerTypes'
import type {
  IAvailabilityQuery,
  ICreateBookingPayload,
  ICreateCustomerBookingPayload,
} from '../model/types'
import {
  createBooking,
  createCustomerBooking,
  getAvailability,
} from './bookingsApi'
import { bookingQueryKeys } from './queryKeys'

function notImplementedCustomerApi(): never {
  throw new ApiError(
    501,
    'NOT_IMPLEMENTED',
    'Customer bookings API is not wired yet',
  )
}

export function useAvailabilityQuery(
  query: IAvailabilityQuery | null,
  enabled: boolean,
) {
  return useQuery({
    queryKey: query
      ? bookingQueryKeys.availability(
          query.dragonId,
          query.startsAt,
          query.endsAt,
        )
      : [...bookingQueryKeys.all, 'availability', 'idle'],
    queryFn: () => getAvailability(query as IAvailabilityQuery),
    enabled: Boolean(query) && enabled,
  })
}

export function useCreateBookingMutation() {
  return useMutation({
    mutationFn: (payload: ICreateBookingPayload) => createBooking(payload),
  })
}

export function useCreateCustomerBookingMutation() {
  return useMutation({
    mutationFn: (payload: ICreateCustomerBookingPayload) =>
      createCustomerBooking(payload),
  })
}

export function useCustomerBookingsQuery(email: string | null) {
  return useQuery({
    queryKey: email
      ? bookingQueryKeys.customer(email)
      : [...bookingQueryKeys.all, 'customer', 'idle'],
    queryFn: async (): Promise<ICustomerBooking[]> =>
      notImplementedCustomerApi(),
    enabled: Boolean(email),
  })
}

export function useCustomerBookingQuery(
  email: string | null,
  bookingNumber: string | undefined,
) {
  return useQuery({
    queryKey:
      email && bookingNumber
        ? bookingQueryKeys.customerDetail(email, bookingNumber)
        : [...bookingQueryKeys.all, 'customer', 'detail', 'idle'],
    queryFn: async (): Promise<ICustomerBooking> => notImplementedCustomerApi(),
    enabled: Boolean(email && bookingNumber),
  })
}
