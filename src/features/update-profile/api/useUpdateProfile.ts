import { useMutation } from '@tanstack/react-query'

import { rememberCustomerName } from '@/entities/booking'
import { useCabinetSessionStore } from '@/entities/customer'

import {
  updateProfileStub,
  type IUpdateProfilePayload,
} from './updateProfileStub'

export function useUpdateProfileMutation() {
  const email = useCabinetSessionStore((s) => s.email)
  const setProfile = useCabinetSessionStore((s) => s.setProfile)

  return useMutation({
    mutationFn: (payload: IUpdateProfilePayload) => updateProfileStub(payload),
    onSuccess: (result) => {
      setProfile({ name: result.name, phone: result.phone })
      if (email && result.name) rememberCustomerName(email, result.name)
    },
  })
}
