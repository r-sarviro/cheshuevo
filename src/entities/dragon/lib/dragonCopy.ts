import type { TFunction } from 'i18next'

export interface IDragonCopySource {
  name: string
  shortDescription: string
  description?: string
  spriteKey?: string
}

export interface IDragonCopy {
  name: string
  shortDescription: string
  description: string
}

/** Localized name/blurb for a catalog dragon via dragons.{spriteKey}.* keys. */
export function getDragonCopy(
  t: TFunction,
  dragon: IDragonCopySource,
): IDragonCopy {
  const key = dragon.spriteKey
  const fallbackDescription = dragon.description ?? dragon.shortDescription

  if (!key) {
    return {
      name: dragon.name,
      shortDescription: dragon.shortDescription,
      description: fallbackDescription,
    }
  }

  return {
    name: t(`dragons.${key}.name`, { defaultValue: dragon.name }),
    shortDescription: t(`dragons.${key}.shortDescription`, {
      defaultValue: dragon.shortDescription,
    }),
    description: t(`dragons.${key}.description`, {
      defaultValue: fallbackDescription,
    }),
  }
}
