import { apiRequest } from '@/shared/api'

import type { IDragon, IDragonListItem } from '../model/types'

type TDragonsListResponse = {
  items: IDragonListItem[]
}

/** GET /api/v1/public/dragons */
export function getDragons() {
  return apiRequest<TDragonsListResponse | IDragonListItem[]>(
    '/public/dragons',
  )
}

/** GET /api/v1/public/dragons/{id} */
export function getDragon(id: number) {
  return apiRequest<IDragon>(`/public/dragons/${id}`)
}
