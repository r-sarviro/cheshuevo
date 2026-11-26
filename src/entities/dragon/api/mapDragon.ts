import type { TDragonResourceWire } from '@/shared/api'

import type { IDragon, IDragonListItem, IDragonTag } from '../model/types'

function mapTags(raw: TDragonResourceWire['tags']): IDragonTag[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0) return undefined
  const tags = raw
    .map((item): IDragonTag | null => {
      if (!item || typeof item.label !== 'string' || !item.label.trim()) {
        return null
      }
      const label = item.label.trim()
      if (typeof item.key === 'string' && item.key.trim()) {
        return { key: item.key.trim(), label }
      }
      return { label }
    })
    .filter((tag): tag is IDragonTag => tag !== null)
  return tags.length ? tags : undefined
}

function mapFit(wire: TDragonResourceWire): string | undefined {
  const value = wire.fit ?? wire.best_for
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed || undefined
}

export function mapDragonListItem(wire: TDragonResourceWire): IDragonListItem {
  return {
    id: wire.id,
    name: wire.name,
    shortDescription: wire.short_description,
    nameEn: wire.name_en ?? undefined,
    shortDescriptionEn: wire.short_description_en ?? undefined,
    imageUrl: wire.image_url ?? null,
    spriteKey: wire.sprite_key ?? undefined,
    tileToken: wire.tile_token ?? undefined,
    tags: mapTags(wire.tags),
    fit: mapFit(wire),
    hourlyRate: wire.hourly_rate,
    currency: wire.currency,
    operationalStatus: wire.operational_status,
  }
}

export function mapDragon(wire: TDragonResourceWire): IDragon {
  return {
    ...mapDragonListItem(wire),
    description: wire.description,
    descriptionEn: wire.description_en ?? undefined,
  }
}
