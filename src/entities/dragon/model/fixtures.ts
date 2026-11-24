import type { IDragon } from './types'

/** Static catalog used by stub API (no network). */
export const DRAGON_FIXTURES: IDragon[] = [
  {
    id: 1,
    name: 'Чешуйка',
    shortDescription:
      'Спокойная, любит облака и чай с чабрецом. Подходит для первой поездки.',
    description:
      'Спокойная, любит облака и чай с чабрецом. Подходит для первой поездки: летит ровно, высоты не набирает, на поворотах предупреждает.',
    tileToken: 'var(--c-tile-mint)',
    spriteKey: 'mascot',
    hourlyRate: 120,
    currency: '₽',
    operationalStatus: 'ACTIVE',
  },
  {
    id: 2,
    name: 'Лун',
    shortDescription:
      'Гоняется за жемчужиной и приносит дождь. Летит плавно, без рывков.',
    description:
      'Гоняется за жемчужиной и приносит дождь. Летит плавно, без рывков. Подходит для спокойных прогулок над облаками.',
    tileToken: 'var(--c-tile-peach)',
    spriteKey: 'china',
    hourlyRate: 150,
    currency: '₽',
    operationalStatus: 'ACTIVE',
  },
  {
    id: 3,
    name: 'Горыныч',
    shortDescription:
      'Три головы и одно доброе сердце. Места хватит всей семье.',
    description:
      'Три головы и одно доброе сердце. Места хватит всей семье: летит устойчиво и любит короткие маршруты.',
    tileToken: 'var(--c-tile-moss)',
    spriteKey: 'gorynych',
    hourlyRate: 180,
    currency: '₽',
    operationalStatus: 'ACTIVE',
  },
  {
    id: 4,
    name: 'Рю',
    shortDescription: 'Быстрый речной дракон. Любит петлять между островами.',
    description:
      'Быстрый речной дракон. Любит петлять между островами и не любит долгие ожидания на земле.',
    tileToken: 'var(--c-tile-sky)',
    spriteKey: 'river',
    hourlyRate: 140,
    currency: '₽',
    operationalStatus: 'ACTIVE',
  },
]

export function getDragonFixture(id: number): IDragon | undefined {
  return DRAGON_FIXTURES.find((dragon) => dragon.id === id)
}
