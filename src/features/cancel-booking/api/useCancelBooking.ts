import { useMutation } from '@tanstack/react-query'

import {
  cancelBookingStub,
  type ICancelBookingPayload,
} from './cancelBookingStub'

export function useCancelBookingMutation() {
  return useMutation({
    mutationFn: (payload: ICancelBookingPayload) => cancelBookingStub(payload),
  })
}
