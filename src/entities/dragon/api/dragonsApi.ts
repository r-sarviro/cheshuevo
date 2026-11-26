import {
  apiRequest,
  dragonDetailSchema,
  dragonsListSchema,
  parseWire,
} from '@/shared/api'

import type { IDragon, IDragonListItem } from '../model/types'
import { mapDragon, mapDragonListItem } from './mapDragon'

/** GET /api/v1/public/dragons */
export async function getDragons(
  signal?: AbortSignal,
): Promise<{ items: IDragonListItem[] }> {
  const raw = await apiRequest<unknown>('/public/dragons', { signal })
  const wire = parseWire(dragonsListSchema, raw)
  return { items: wire.data.map(mapDragonListItem) }
}

/** GET /api/v1/public/dragons/{id} */
export async function getDragon(
  id: number,
  signal?: AbortSignal,
): Promise<IDragon> {
  const raw = await apiRequest<unknown>(`/public/dragons/${id}`, { signal })
  const wire = parseWire(dragonDetailSchema, raw)
  return mapDragon(wire.data)
}
