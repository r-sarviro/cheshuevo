export const DRAGON_OPERATIONAL_STATUSES = [
  'ACTIVE',
  'MAINTENANCE',
  'INACTIVE',
] as const

export type TDragonOperationalStatus =
  (typeof DRAGON_OPERATIONAL_STATUSES)[number]

/** Catalog chip: plain label or key+value («Стихия», «Ветер»). */
export interface IDragonTag {
  label: string
  key?: string
}

/** Public catalog dragon as returned by the API contract. */
export interface IDragon {
  id: number
  name: string
  shortDescription: string
  description?: string
  nameEn?: string
  shortDescriptionEn?: string
  descriptionEn?: string
  imageUrl?: string | null
  tileToken?: string
  /** Sheet sprite slug from the nursery catalog (sakurka, snezhok, …). */
  spriteKey?: string
  /** Trait chips shown under the name (breed / element / mood). */
  tags?: IDragonTag[]
  /** Short “good for” line under the blurb. */
  fit?: string
  hourlyRate: number
  currency: string
  operationalStatus: TDragonOperationalStatus
}

export type IDragonListItem = Pick<
  IDragon,
  | 'id'
  | 'name'
  | 'shortDescription'
  | 'nameEn'
  | 'shortDescriptionEn'
  | 'imageUrl'
  | 'tileToken'
  | 'spriteKey'
  | 'tags'
  | 'fit'
  | 'hourlyRate'
  | 'currency'
  | 'operationalStatus'
>
