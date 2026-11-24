import { useMutation } from '@tanstack/react-query'

import type {
  IConfirmEmailCodePayload,
  IRequestEmailCodePayload,
} from './emailVerificationApi'
import {
  confirmEmailCodeStub,
  requestEmailCodeStub,
} from './emailVerificationStub'

export function useRequestEmailCodeMutation() {
  return useMutation({
    mutationFn: (payload: IRequestEmailCodePayload) =>
      requestEmailCodeStub(payload),
  })
}

export function useConfirmEmailCodeMutation() {
  return useMutation({
    mutationFn: (payload: IConfirmEmailCodePayload) =>
      confirmEmailCodeStub(payload),
  })
}
