import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type {
  IAvailabilityQuery,
  ICreateBookingPayload,
  ICreateCustomerBookingPayload,
} from '../model/types'
import {
  createBooking,
  createCustomerBooking,
  getAvailability,
  getCustomerBooking,
  getCustomerBookings,
} from './bookingsApi'
import { bookingQueryKeys } from './queryKeys'

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
    queryFn: ({ signal }) =>
      getAvailability(query as IAvailabilityQuery, signal),
    enabled: Boolean(query) && enabled,
  })
}

async function invalidateAfterCreate(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: bookingQueryKeys.customer(),
    }),
    queryClient.invalidateQueries({
      queryKey: [...bookingQueryKeys.all, 'availability'],
    }),
  ])
}

export function useCreateBookingMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ICreateBookingPayload) => createBooking(payload),
    onSuccess: async () => {
      await invalidateAfterCreate(queryClient)
    },
  })
}

export function useCreateCustomerBookingMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ICreateCustomerBookingPayload) =>
      createCustomerBooking(payload),
    onSuccess: async () => {
      await invalidateAfterCreate(queryClient)
    },
  })
}

/** `enabled` comes from the cabinet session (pages/features), not a cross-entity import. */
export function useCustomerBookingsQuery(enabled = true) {
  return useQuery({
    queryKey: bookingQueryKeys.customer(),
    queryFn: ({ signal }) => getCustomerBookings(signal),
    enabled,
  })
}

export function useCustomerBookingQuery(
  bookingNumber: string | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: bookingNumber
      ? bookingQueryKeys.customerDetail(bookingNumber)
      : [...bookingQueryKeys.customer(), 'detail', 'idle'],
    queryFn: ({ signal }) =>
      getCustomerBooking(bookingNumber as string, signal),
    enabled: Boolean(bookingNumber) && enabled,
  })
}
