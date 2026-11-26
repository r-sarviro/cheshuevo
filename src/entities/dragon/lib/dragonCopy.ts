import type { AppLocale } from '@/shared/config'

import type { IDragonTag } from '../model/types'

export interface IDragonLocaleSource {
  name: string
  shortDescription: string
  description?: string
  nameEn?: string
  shortDescriptionEn?: string
  descriptionEn?: string
  tags?: IDragonTag[]
  fit?: string
}

export interface IDragonLocaleCopy {
  name: string
  shortDescription: string
  description: string
  tags: IDragonTag[]
  fit: string
}

function pickLocalized(
  preferred: string | undefined,
  fallback: string,
): string {
  const value = preferred?.trim()
  return value ? value : fallback
}

/** Pick display fields from API dragon data for the active UI locale. */
export function resolveDragonLocale(
  dragon: IDragonLocaleSource,
  locale: AppLocale | string,
): IDragonLocaleCopy {
  const useEn = locale === 'en' || String(locale).startsWith('en')
  const descriptionRu = dragon.description ?? dragon.shortDescription

  return {
    name: useEn ? pickLocalized(dragon.nameEn, dragon.name) : dragon.name,
    shortDescription: useEn
      ? pickLocalized(dragon.shortDescriptionEn, dragon.shortDescription)
      : dragon.shortDescription,
    description: useEn
      ? pickLocalized(dragon.descriptionEn, descriptionRu)
      : descriptionRu,
    tags: dragon.tags ?? [],
    fit: dragon.fit?.trim() ? dragon.fit.trim() : '',
  }
}
