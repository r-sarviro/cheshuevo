import type { TFunction } from 'i18next'

import type { IDragonTag } from '../model/types'

export interface IDragonCopySource {
  name: string
  shortDescription: string
  description?: string
  spriteKey?: string
  tags?: IDragonTag[]
  fit?: string
}

export interface IDragonCopy {
  name: string
  shortDescription: string
  description: string
  tags: IDragonTag[]
  fit: string
}

function normalizeTag(raw: unknown): IDragonTag | null {
  if (!raw || typeof raw !== 'object') return null
  const item = raw as { label?: unknown; key?: unknown }
  if (typeof item.label !== 'string' || !item.label) return null
  if (item.key === undefined) return { label: item.label }
  if (typeof item.key !== 'string' || !item.key) return { label: item.label }
  return { key: item.key, label: item.label }
}

function readTags(
  t: TFunction,
  key: string,
  fallback: IDragonTag[],
): IDragonTag[] {
  const raw = t(`dragons.${key}.tags`, {
    returnObjects: true,
    defaultValue: fallback,
  })
  if (!Array.isArray(raw)) return fallback
  const tags = raw.map(normalizeTag).filter((tag): tag is IDragonTag => !!tag)
  return tags.length ? tags : fallback
}

/** Localized name/blurb/tags/fit for a catalog dragon via dragons.{spriteKey}.* keys. */
export function getDragonCopy(
  t: TFunction,
  dragon: IDragonCopySource,
): IDragonCopy {
  const key = dragon.spriteKey
  const fallbackDescription = dragon.description ?? dragon.shortDescription
  const fallbackTags = dragon.tags ?? []
  const fallbackFit = dragon.fit ?? ''

  if (!key) {
    return {
      name: dragon.name,
      shortDescription: dragon.shortDescription,
      description: fallbackDescription,
      tags: fallbackTags,
      fit: fallbackFit,
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
    tags: readTags(t, key, fallbackTags),
    fit: t(`dragons.${key}.fit`, { defaultValue: fallbackFit }),
  }
}
