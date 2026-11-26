import { useMutation, useQueryClient } from '@tanstack/react-query'

import { bookingQueryKeys } from '@/entities/booking'
import { useCabinetSessionStore } from '@/entities/customer'

import {
  cancelBooking,
  type ICancelBookingPayload,
} from './cancelBookingApi'

export function useCancelBookingMutation() {
  const queryClient = useQueryClient()
  const email = useCabinetSessionStore((s) => s.email)

  return useMutation({
    mutationFn: (payload: ICancelBookingPayload) => cancelBooking(payload),
    onSuccess: () => {
      if (!email) return
      void queryClient.invalidateQueries({
        queryKey: bookingQueryKeys.customer(email),
      })
    },
  })
}
