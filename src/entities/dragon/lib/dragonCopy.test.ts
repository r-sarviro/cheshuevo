import { describe, expect, it } from 'vitest'

import { resolveDragonLocale } from './dragonCopy'

const BRIZ = {
  name: 'Бриз',
  shortDescription: 'Лёгкий',
  description: 'Полное описание',
  nameEn: 'Breeze',
  shortDescriptionEn: 'Light',
  descriptionEn: 'Full description',
  tags: [{ label: 'Ветреный дракон' }, { key: 'Стихия', label: 'Ветер' }],
  fit: 'Полёты над морем',
}

describe('resolveDragonLocale', () => {
  it('uses Russian fields for ru and dr', () => {
    expect(resolveDragonLocale(BRIZ, 'ru')).toMatchObject({
      name: 'Бриз',
      shortDescription: 'Лёгкий',
      description: 'Полное описание',
      fit: 'Полёты над морем',
    })
    expect(resolveDragonLocale(BRIZ, 'dr').name).toBe('Бриз')
  })

  it('uses English fields for en with RU fallback', () => {
    expect(resolveDragonLocale(BRIZ, 'en')).toMatchObject({
      name: 'Breeze',
      shortDescription: 'Light',
      description: 'Full description',
    })
    expect(
      resolveDragonLocale(
        { name: 'Бриз', shortDescription: 'Лёгкий', nameEn: '  ' },
        'en',
      ).name,
    ).toBe('Бриз')
  })

  it('passes through empty tags/fit when missing', () => {
    const copy = resolveDragonLocale(
      { name: 'Бриз', shortDescription: 'Лёгкий' },
      'ru',
    )
    expect(copy.tags).toEqual([])
    expect(copy.fit).toBe('')
  })
})
