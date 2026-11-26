/** Public rental shop contacts and place assets (single source for landing + cabinet). */

export const RENTAL_PHONE = '+7 900 555-12-34'

export const RENTAL_PHONE_TEL = '+79005551234'

export const RENTAL_EMAIL = 'hello@drakonsk.ru'

/** Hours in company local time (TZ §25.3). */
export const RENTAL_HOURS_OPEN = '08:00'

export const RENTAL_HOURS_CLOSE = '20:00'

export const RENTAL_PLACE_MAP_SRC = '/maps/rental-place.png'

/** Compact “phone or email” line for cabinet notes and similar templates. */
export function formatRentalContacts(
  phone: string = RENTAL_PHONE,
  email: string = RENTAL_EMAIL,
): string {
  return `${phone} / ${email}`
}
