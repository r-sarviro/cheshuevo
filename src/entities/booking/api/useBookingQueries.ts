import { useMutation, useQuery } from '@tanstack/react-query'

import {
  createBookingStub,
  getAvailabilityStub,
  type TAvailabilityStubQuery,
  type TCreateBookingStubPayload,
} from './bookingsStub'
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
