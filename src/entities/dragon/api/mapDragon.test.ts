import { describe, expect, it } from 'vitest'

import { mapDragon, mapDragonListItem } from './mapDragon'

const WIRE = {
  id: 17,
  name: 'Бриз',
  short_description: 'Лёгкий',
  description: 'Полное',
  name_en: 'Breeze',
  short_description_en: 'Light',
  description_en: 'Full',
  image_url: null,
  sprite_key: 'briz',
  tile_token: '#E0F3EF',
  hourly_rate: 140,
  currency: 'RUB',
  operational_status: 'ACTIVE' as const,
}

describe('mapDragon', () => {
  it('maps list and detail fields', () => {
    expect(mapDragonListItem(WIRE)).toMatchObject({
      id: 17,
      shortDescription: 'Лёгкий',
      spriteKey: 'briz',
      hourlyRate: 140,
      currency: 'RUB',
    })
    expect(mapDragon(WIRE).description).toBe('Полное')
    expect(mapDragon(WIRE).nameEn).toBe('Breeze')
    expect(mapDragonListItem(WIRE).tags).toBeUndefined()
    expect(mapDragonListItem(WIRE).fit).toBeUndefined()
  })

  it('maps optional tags and fit/best_for when present', () => {
    const withExtras = mapDragonListItem({
      ...WIRE,
      tags: [
        { label: 'Ветреный дракон' },
        { key: 'Стихия', label: 'Ветер' },
        { label: '  ' },
      ],
      best_for: 'Полёты над морем',
    })

    expect(withExtras.tags).toEqual([
      { label: 'Ветреный дракон' },
      { key: 'Стихия', label: 'Ветер' },
    ])
    expect(withExtras.fit).toBe('Полёты над морем')
    expect(
      mapDragonListItem({ ...WIRE, fit: 'Пикники', best_for: 'ignored' }).fit,
    ).toBe('Пикники')
  })
})
