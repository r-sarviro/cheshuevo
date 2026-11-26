import { useQuery } from '@tanstack/react-query'

import { useCabinetSessionStore } from '../model/sessionStore'
import { getCustomerMe } from './customerApi'

export const customerQueryKeys = {
  all: ['customer'] as const,
  me: () => [...customerQueryKeys.all, 'me'] as const,
}

export function useCustomerMeQuery(enabled = true) {
  const isAuthenticated = useCabinetSessionStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: customerQueryKeys.me(),
    queryFn: ({ signal }) => getCustomerMe(signal),
    enabled: enabled && isAuthenticated(),
  })
}
