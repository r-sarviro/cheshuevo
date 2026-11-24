import { afterEach, describe, expect, it } from 'vitest'

import { defaultLocale, i18n } from '@/shared/config'

import { getDragonCopy } from './dragonCopy'

const SAKURKA = {
  name: 'Сакурка',
  shortDescription: 'Весной цветёт и сразу просит её сфотографировать.',
  description: 'Весной цветёт и сразу просит её сфотографировать.',
  spriteKey: 'sakurka',
}

afterEach(async () => {
  await i18n.changeLanguage(defaultLocale)
})

describe('getDragonCopy', () => {
  it('returns fixture text when spriteKey is missing', () => {
    const copy = getDragonCopy(i18n.t.bind(i18n), {
      name: 'Stub',
      shortDescription: 'Short',
      description: 'Long',
    })

    expect(copy).toEqual({
      name: 'Stub',
      shortDescription: 'Short',
      description: 'Long',
    })
  })

  it('reads ru keys by spriteKey', () => {
    const copy = getDragonCopy(i18n.t.bind(i18n), SAKURKA)

    expect(copy.name).toBe('Сакурка')
    expect(copy.shortDescription).toContain('сфотографировать')
  })

  it('reads en keys by spriteKey', async () => {
    await i18n.changeLanguage('en')
    const copy = getDragonCopy(i18n.t.bind(i18n), SAKURKA)

    expect(copy.name).toBe('Sakurka')
    expect(copy.shortDescription).toContain('photographed')
  })
})
