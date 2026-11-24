import { ApiError, stubDelay } from '@/shared/api'

import { DRAGON_FIXTURES, getDragonFixture } from '../model/fixtures'
import type { IDragon, IDragonListItem } from '../model/types'

/** Stub: list active dragons (no network). */
export async function getDragonsStub(): Promise<{ items: IDragonListItem[] }> {
  await stubDelay()
  const items = DRAGON_FIXTURES.filter(
    (dragon) => dragon.operationalStatus === 'ACTIVE',
  ).map(
    ({
      id,
      name,
      shortDescription,
      imageUrl,
      tileToken,
      spriteKey,
      hourlyRate,
      currency,
      operationalStatus,
    }) => ({
      id,
      name,
      shortDescription,
      imageUrl,
      tileToken,
      spriteKey,
      hourlyRate,
      currency,
      operationalStatus,
    }),
  )
  return { items }
}

/** Stub: dragon detail by id. */
export async function getDragonStub(id: number): Promise<IDragon> {
  await stubDelay()
  const dragon = getDragonFixture(id)
  if (!dragon || dragon.operationalStatus !== 'ACTIVE') {
    throw new ApiError(404, 'DRAGON_NOT_FOUND', 'Dragon not found')
  }
  return dragon
}
