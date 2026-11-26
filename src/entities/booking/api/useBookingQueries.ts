import { useMutation, useQuery } from '@tanstack/react-query'

import {
  createBookingStub,
  createCustomerBookingStub,
  getAvailabilityStub,
  type TAvailabilityStubQuery,
  type TCreateBookingStubPayload,
  type TCreateCustomerBookingStubPayload,
} from './bookingsStub'
import {
  getCustomerBookingStub,
  listCustomerBookingsStub,
} from './customerBookingsStub'
import { bookingQueryKeys } from './queryKeys'

export function useAvailabilityQuery(
  query: TAvailabilityStubQuery | null,
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
    queryFn: () => getAvailabilityStub(query as TAvailabilityStubQuery),
    enabled: Boolean(query) && enabled,
  })
}

export function useCreateBookingMutation() {
  return useMutation({
    mutationFn: (payload: TCreateBookingStubPayload) =>
      createBookingStub(payload),
  })
}

export function useCreateCustomerBookingMutation() {
  return useMutation({
    mutationFn: (payload: TCreateCustomerBookingStubPayload) =>
      createCustomerBookingStub(payload),
  })
}

export function useCustomerBookingsQuery(email: string | null) {
  return useQuery({
    queryKey: email
      ? bookingQueryKeys.customer(email)
      : [...bookingQueryKeys.all, 'customer', 'idle'],
    queryFn: () => listCustomerBookingsStub(email as string),
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
    queryFn: () =>
      getCustomerBookingStub(email as string, bookingNumber as string),
    enabled: Boolean(email && bookingNumber),
  })
}
