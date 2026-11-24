export const STATUS_KEYS = [
  'confirmed',
  'in_rent',
  'completed',
  'cancelled',
  'no_show',
  'overdue',
  'unpaid',
  'paid',
  'active',
  'maintenance',
  'inactive',
  'free',
  'booked',
] as const

export type TStatusKey = (typeof STATUS_KEYS)[number]

export const TONE_KEYS = [
  'jade',
  'sky',
  'lavender',
  'neutral',
  'peach',
  'butter',
  'moss',
  'sand',
  'ember',
] as const

export type TToneKey = (typeof TONE_KEYS)[number]
