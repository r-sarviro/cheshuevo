import type { Page } from '@playwright/test'

const API = '**/api/v1/**'

export const MOCK_DRAGON = {
  id: 17,
  name: 'Бриз',
  short_description: 'Лёгкий, как дуновение.',
  description: 'Лёгкий, как дуновение. Уверен, что он воздушный змей.',
  name_en: 'Breeze',
  short_description_en: 'Light as a puff of air.',
  description_en: 'Light as a puff of air.',
  image_url: null,
  sprite_key: 'briz',
  tile_token: '#E0F3EF',
  hourly_rate: 140,
  currency: 'RUB',
  operational_status: 'ACTIVE',
}

export const MOCK_BOOKING = {
  booking_number: 'DR-000001',
  status: 'CONFIRMED',
  payment_status: 'UNPAID',
  is_overdue: false,
  starts_at: '2099-11-28T11:00:00Z',
  ends_at: '2099-11-28T13:15:00Z',
  billable_hours: 3,
  hourly_rate: 140,
  total_amount: 420,
  currency: 'RUB',
  issued_at: null,
  returned_at: null,
  cancelled_at: null,
  created_at: '2026-11-26T14:16:06Z',
  dragon: {
    id: 17,
    name: 'Бриз',
    name_en: 'Breeze',
    sprite_key: 'briz',
    tile_token: '#E0F3EF',
    image_url: null,
  },
  payment: null,
}

export const MOCK_SESSION = {
  token: 'test-token',
  token_type: 'Bearer',
  expires_at: '2099-12-26T14:16:06Z',
}

/** Install JSON API mocks for Playwright (no live Laravel). */
export async function mockApi(
  page: Page,
  options?: {
    noBookingsOnLogin?: boolean
    bookings?: typeof MOCK_BOOKING[]
    availabilityUnavailable?: boolean
    /** Default: succeed. */
    otpConfirm?: 'ok' | 'invalid' | 'exhausted'
    /** Default: succeed after OTP. */
    createBooking?: 'ok' | 'conflict'
  },
) {
  const bookings = options?.bookings ?? [MOCK_BOOKING]
  let lastPurpose: string = 'booking'
  const otpConfirm = options?.otpConfirm ?? 'ok'
  const createBooking = options?.createBooking ?? 'ok'

  await page.route(API, async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname.replace(/^\/api\/v1/, '')
    const method = request.method()

    const json = (status: number, body: unknown) =>
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(body),
      })

    if (method === 'GET' && path === '/public/dragons') {
      return json(200, { data: [MOCK_DRAGON] })
    }

    if (method === 'GET' && path === `/public/dragons/${MOCK_DRAGON.id}`) {
      return json(200, { data: MOCK_DRAGON })
    }

    if (method === 'GET' && path === '/public/availability') {
      if (options?.availabilityUnavailable) {
        return json(200, {
          available: false,
          reason: 'SLOT_TAKEN',
          billable_hours: 2,
          hourly_rate: 140,
          total_amount: 280,
          currency: 'RUB',
        })
      }
      return json(200, {
        available: true,
        billable_hours: 3,
        hourly_rate: 140,
        total_amount: 420,
        currency: 'RUB',
        reason: null,
      })
    }

    if (method === 'POST' && path === '/public/email-verifications') {
      const body = request.postDataJSON() as {
        purpose?: string
        email?: string
      }
      lastPurpose = body.purpose ?? 'booking'
      if (lastPurpose === 'login' && options?.noBookingsOnLogin) {
        return json(404, {
          error: {
            code: 'NO_BOOKINGS',
            message: 'Броней на эту почту нет.',
          },
        })
      }
      return json(200, {
        verification_id: 'ver-1',
        expires_at: '2099-11-26T14:26:06Z',
        resend_after_seconds: 60,
      })
    }

    if (method === 'POST' && path === '/public/email-verifications/confirm') {
      if (otpConfirm === 'invalid') {
        return json(422, {
          error: {
            code: 'OTP_INVALID',
            message: 'Wrong code',
            details: { attempts_left: 2 },
          },
        })
      }
      if (otpConfirm === 'exhausted') {
        return json(422, {
          error: {
            code: 'OTP_EXHAUSTED',
            message: 'Too many attempts',
          },
        })
      }
      return json(200, {
        verification_token: 'vt-1',
        expires_at: '2099-11-26T14:26:06Z',
        session: lastPurpose === 'login' ? MOCK_SESSION : null,
      })
    }

    if (method === 'POST' && path === '/public/bookings') {
      if (createBooking === 'conflict') {
        return json(409, {
          error: {
            code: 'BOOKING_CONFLICT',
            message: 'Slot taken',
          },
        })
      }
      return json(201, {
        booking_number: MOCK_BOOKING.booking_number,
        status: MOCK_BOOKING.status,
        payment_status: MOCK_BOOKING.payment_status,
        total_amount: MOCK_BOOKING.total_amount,
        currency: MOCK_BOOKING.currency,
        starts_at: MOCK_BOOKING.starts_at,
        ends_at: MOCK_BOOKING.ends_at,
        billable_hours: MOCK_BOOKING.billable_hours,
        dragon_id: MOCK_DRAGON.id,
        dragon_name: MOCK_DRAGON.name,
        confirmation_email_queued: true,
        session: MOCK_SESSION,
      })
    }

    if (method === 'GET' && path === '/customer/me') {
      return json(200, {
        customer: { name: 'Анна', email: 'anna@example.com' },
      })
    }

    if (method === 'GET' && path === '/customer/bookings') {
      return json(200, { data: bookings })
    }

    if (method === 'GET' && path.startsWith('/customer/bookings/')) {
      const number = decodeURIComponent(path.split('/').pop() || '')
      const found = bookings.find((b) => b.booking_number === number)
      if (!found) {
        return json(404, {
          error: {
            code: 'BOOKING_NOT_FOUND',
            message: 'Такой брони нет.',
          },
        })
      }
      return json(200, { data: found })
    }

    if (method === 'POST' && path === '/customer/logout') {
      return route.fulfill({ status: 204, body: '' })
    }

    return json(404, {
      error: { code: 'NOT_FOUND', message: `Unmocked ${method} ${path}` },
    })
  })
}

export async function seedCabinetSession(page: Page) {
  await page.addInitScript(
    ({ session, key }) => {
      window.localStorage.setItem(key, JSON.stringify(session))
    },
    {
      key: 'drakonsk.cabinet.session.v2',
      session: {
        token: MOCK_SESSION.token,
        tokenType: MOCK_SESSION.token_type,
        expiresAt: MOCK_SESSION.expires_at,
        email: 'anna@example.com',
        name: 'Анна',
      },
    },
  )
}
