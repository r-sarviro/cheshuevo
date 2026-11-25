import { useMutation } from '@tanstack/react-query'

import { useCabinetSessionStore } from '@/entities/customer'

import {
  updateProfileStub,
  type IUpdateProfilePayload,
} from './updateProfileStub'

export function useUpdateProfileMutation() {
  const setProfile = useCabinetSessionStore((s) => s.setProfile)

  return useMutation({
    mutationFn: (payload: IUpdateProfilePayload) => updateProfileStub(payload),
    onSuccess: (result) => {
      setProfile({ name: result.name, phone: result.phone })
    },
  })
}
