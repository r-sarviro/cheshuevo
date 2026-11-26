import { useMutation } from '@tanstack/react-query'

import { useCabinetSessionStore } from '@/entities/customer'

import {
  updateProfile,
  type IUpdateProfilePayload,
} from './updateProfileApi'

export function useUpdateProfileMutation() {
  const setProfile = useCabinetSessionStore((s) => s.setProfile)

  return useMutation({
    mutationFn: (payload: IUpdateProfilePayload) => updateProfile(payload),
    onSuccess: (result) => {
      setProfile({ name: result.name, phone: result.phone })
    },
  })
}
