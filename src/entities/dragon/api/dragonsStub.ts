import { ApiError } from '@/shared/api'

import { DRAGON_FIXTURES, getDragonFixture } from '../model/fixtures'
import type { IDragon, IDragonListItem } from '../model/types'

/** Local catalog from fixtures (no network until public dragons API is wired). */
export async function getDragonsStub(): Promise<{ items: IDragonListItem[] }> {
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

/** Local dragon detail by id from fixtures. */
export async function getDragonStub(id: number): Promise<IDragon> {
  const dragon = getDragonFixture(id)
  if (!dragon || dragon.operationalStatus !== 'ACTIVE') {
    throw new ApiError(404, 'DRAGON_NOT_FOUND', 'Dragon not found')
  }
  return dragon
}
