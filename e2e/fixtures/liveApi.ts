import { expect, type Page } from '@playwright/test'
import { execSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'

/** Live smoke against real API — no page.route mocks. */
export const LIVE_API_BASE =
  process.env.LIVE_API_BASE ?? 'http://localhost:8000/api/v1'

export const LIVE_DRAGON_ID = 17
export const LIVE_DRAGON_NAME = 'Бриз'

export const LARAVEL_LOG =
  process.env.LIVE_LARAVEL_LOG ??
  '/Users/r.sarviro/Documents/Projects/cheshuevo-gitlab/admin/backend/storage/logs/laravel.log'

const STORAGE_KEY = 'drakonsk.cabinet.session.v2'

/** Skip the whole test when LIVE_API is not set. */
export function skipUnlessLiveApi(t: {
  skip: (condition: boolean, description: string) => void
}): void {
  t.skip(process.env.LIVE_API !== '1', 'Set LIVE_API=1 to run against real API')
}

/** Local calendar date +N days as YYYY-MM-DD. */
export function localDatePlusDays(days: number, now = new Date()): string {
  const day = new Date(now)
  day.setHours(12, 0, 0, 0)
  day.setDate(day.getDate() + days)
  return [
    day.getFullYear(),
    String(day.getMonth() + 1).padStart(2, '0'),
    String(day.getDate()).padStart(2, '0'),
  ].join('-')
}

export function readLatestOtp(email: string): string {
  const out = execSync(`rg -n "rental\\.otp" "${LARAVEL_LOG}" | tail -30`, {
    encoding: 'utf8',
  })
  const lines = out.trim().split('\n').reverse()
  for (const line of lines) {
    if (!line.includes(email)) continue
    const match = /"code":"(\d{6})"/.exec(line)
    if (match) return match[1]
  }
  throw new Error(`OTP for ${email} not found in laravel.log`)
}

async function setNativeInputValue(
  page: Page,
  label: string | RegExp,
  value: string,
): Promise<void> {
  const input = page.getByLabel(label)
  await input.waitFor({ state: 'visible' })
  await input.evaluate((el, next) => {
    const proto = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )
    proto?.set?.call(el, next)
    el.dispatchEvent(new Event('input', { bubbles: true }))
    el.dispatchEvent(new Event('change', { bubbles: true }))
  }, value)
}

/**
 * Far free window (default +14d, 13:00–15:00) via native setters
 * so controlled React inputs pick up the change.
 */
export async function fillFreeBookingPeriod(
  page: Page,
  options?: {
    daysAhead?: number
    startTime?: string
    endTime?: string
  },
): Promise<{ date: string; startTime: string; endTime: string }> {
  const daysAhead = options?.daysAhead ?? 14
  const startTime = options?.startTime ?? '13:00'
  const endTime = options?.endTime ?? '15:00'
  const date = localDatePlusDays(daysAhead)

  await setNativeInputValue(page, /^Дата начала$/i, date)
  await setNativeInputValue(page, /^Время начала$/i, startTime)
  await setNativeInputValue(page, /^Дата окончания$/i, date)
  await setNativeInputValue(page, /^Время окончания$/i, endTime)

  return { date, startTime, endTime }
}

type TWireSession = {
  token: string
  token_type: string
  expires_at: string
}

/**
 * Seed a real customer session: OTP → guest booking → localStorage.
 * Uses a distant slot so UI +14d smoke does not collide.
 */
export async function seedCabinetSession(
  page: Page,
  options?: { name?: string; seedDaysAhead?: number },
): Promise<{ email: string; name: string }> {
  const email = `live-auth-${randomUUID().slice(0, 8)}@example.com`
  const name = options?.name ?? 'Live Auth'
  const date = localDatePlusDays(options?.seedDaysAhead ?? 21)

  const sendRes = await page.request.post(
    `${LIVE_API_BASE}/public/email-verifications`,
    { data: { email, purpose: 'booking' } },
  )
  expect(sendRes.ok(), `OTP send failed: ${sendRes.status()}`).toBeTruthy()
  const sendBody = (await sendRes.json()) as { verification_id: string }

  await page.waitForTimeout(800)
  const code = readLatestOtp(email)

  const confirmRes = await page.request.post(
    `${LIVE_API_BASE}/public/email-verifications/confirm`,
    {
      data: {
        verification_id: sendBody.verification_id,
        email,
        code,
      },
    },
  )
  expect(
    confirmRes.ok(),
    `OTP confirm failed: ${confirmRes.status()}`,
  ).toBeTruthy()
  const confirmBody = (await confirmRes.json()) as {
    verification_token: string
  }

  const createRes = await page.request.post(
    `${LIVE_API_BASE}/public/bookings`,
    {
      headers: { 'Idempotency-Key': randomUUID() },
      data: {
        dragon_id: LIVE_DRAGON_ID,
        starts_at: `${date}T10:00:00`,
        ends_at: `${date}T12:00:00`,
        customer_name: name,
        customer_email: email,
        verification_token: confirmBody.verification_token,
      },
    },
  )
  expect(
    createRes.ok(),
    `Seed booking failed: ${createRes.status()} ${await createRes.text()}`,
  ).toBeTruthy()
  const createBody = (await createRes.json()) as {
    session: TWireSession | null
  }
  expect(createBody.session?.token).toBeTruthy()

  const session = createBody.session!

  await page.addInitScript(
    ({ key, token, tokenType, expiresAt, email: e, name: n }) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          token,
          tokenType,
          expiresAt,
          email: e,
          name: n,
        }),
      )
    },
    {
      key: STORAGE_KEY,
      token: session.token,
      tokenType: session.token_type,
      expiresAt: session.expires_at,
      email,
      name,
    },
  )

  return { email, name }
}
