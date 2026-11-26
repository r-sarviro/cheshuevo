import { useMutation } from '@tanstack/react-query'

import {
  confirmEmailCode,
  requestEmailCode,
  type IConfirmEmailCodePayload,
  type IRequestEmailCodePayload,
} from './emailVerificationApi'

export function useRequestEmailCodeMutation() {
  return useMutation({
    mutationFn: (payload: IRequestEmailCodePayload) =>
      requestEmailCode(payload),
  })
}

export function useConfirmEmailCodeMutation() {
  return useMutation({
    mutationFn: (payload: IConfirmEmailCodePayload) =>
      confirmEmailCode(payload),
  })
}
