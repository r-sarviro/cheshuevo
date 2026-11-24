import { useQuery } from '@tanstack/react-query'

import { getDragonStub, getDragonsStub } from './dragonsStub'
import { dragonQueryKeys } from './queryKeys'

export function useDragonsQuery() {
  return useQuery({
    queryKey: dragonQueryKeys.lists(),
    queryFn: getDragonsStub,
  })
}

export function useDragonQuery(id: number | undefined) {
  return useQuery({
    queryKey: dragonQueryKeys.detail(id ?? 0),
    queryFn: () => getDragonStub(id as number),
    enabled: typeof id === 'number' && Number.isFinite(id) && id > 0,
  })
}
