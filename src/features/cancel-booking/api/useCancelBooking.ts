import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  bookingQueryKeys,
  markCustomerBookingCancelled,
} from '@/entities/booking'
import { useCabinetSessionStore } from '@/entities/customer'

import {
  cancelBookingStub,
  type ICancelBookingPayload,
} from './cancelBookingStub'

export function useCancelBookingMutation() {
  const queryClient = useQueryClient()
  const email = useCabinetSessionStore((s) => s.email)

  return useMutation({
    mutationFn: (payload: ICancelBookingPayload) => cancelBookingStub(payload),
    onSuccess: (result) => {
      if (!email) return
      markCustomerBookingCancelled(
        email,
        result.bookingNumber,
        result.cancelledAt,
      )
      void queryClient.invalidateQueries({
        queryKey: bookingQueryKeys.customer(email),
      })
    },
  })
}
