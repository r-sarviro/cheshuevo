export const DRAGON_OPERATIONAL_STATUSES = [
  'ACTIVE',
  'MAINTENANCE',
  'INACTIVE',
] as const

export type TDragonOperationalStatus =
  (typeof DRAGON_OPERATIONAL_STATUSES)[number]

/** Public catalog dragon as returned by the API contract. */
export interface IDragon {
  id: number
  name: string
  shortDescription: string
  description?: string
  imageUrl?: string | null
  tileToken?: string
  /** Sheet sprite slug from the nursery catalog (sakurka, snezhok, …). */
  spriteKey?: string
  hourlyRate: number
  currency: string
  operationalStatus: TDragonOperationalStatus
}

export type IDragonListItem = Pick<
  IDragon,
  | 'id'
  | 'name'
  | 'shortDescription'
  | 'imageUrl'
  | 'tileToken'
  | 'spriteKey'
  | 'hourlyRate'
  | 'currency'
  | 'operationalStatus'
>
