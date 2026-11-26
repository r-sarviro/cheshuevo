import { useQuery } from '@tanstack/react-query'

import { getDragon, getDragons } from './dragonsApi'
import { dragonQueryKeys } from './queryKeys'

export function useDragonsQuery() {
  return useQuery({
    queryKey: dragonQueryKeys.lists(),
    queryFn: ({ signal }) => getDragons(signal),
  })
}

export function useDragonQuery(id: number | null | undefined) {
  return useQuery({
    queryKey: id != null ? dragonQueryKeys.detail(id) : dragonQueryKeys.all,
    queryFn: ({ signal }) => getDragon(id as number, signal),
    enabled: id != null,
  })
}
