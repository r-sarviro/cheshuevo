import { expect, test } from '@playwright/test'
import { execSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'

const LARAVEL_LOG =
  '/Users/r.sarviro/Documents/Projects/cheshuevo-gitlab/admin/backend/storage/logs/laravel.log'

function readLatestOtp(email: string): string {
  const out = execSync(`rg -n "rental\\.otp" "${LARAVEL_LOG}" | tail -20`, {
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

/**
 * Live smoke against localhost:8000 (no page.route mocks).
 * Run: LIVE_API=1 yarn test:e2e e2e/booking-live.spec.ts
 * Requires API + yarn dev; OTP is read from Laravel local log.
 */
test('live guest booking creates confirmed booking', async ({ page }) => {
  test.skip(
    process.env.LIVE_API !== '1',
    'Set LIVE_API=1 to run against real API',
  )
  test.setTimeout(90_000)

  const email = `live-book-${randomUUID().slice(0, 8)}@example.com`
  const name = 'Живая Проверка'

  await page.goto('/dragons/17')
  await expect(page.getByRole('heading', { name: 'Бриз' })).toBeVisible()
  await expect(page.getByText(/свободно/i)).toBeVisible({ timeout: 15_000 })

  await page.getByRole('button', { name: /Продолжить/i }).click()

  await page.getByLabel(/^Имя/i).fill(name)
  await page.locator('input[type="email"]').fill(email)
  await page.getByRole('button', { name: /Получить код/i }).click()

  await expect(page.locator('input[inputmode="numeric"]').first()).toBeVisible({
    timeout: 15_000,
  })

  // Wait for log line after API accepts the send.
  await page.waitForTimeout(1000)
  const code = readLatestOtp(email)

  const firstDigit = page.locator('input[inputmode="numeric"]').first()
  await firstDigit.click()
  await page.keyboard.type(code)

  await page.getByRole('button', { name: /Подтвердить бронь/i }).click()

  await expect(page.getByText(/DR-\d+/)).toBeVisible({ timeout: 20_000 })
  await expect(
    page.getByText(/Подтверждение отправили|Оплата/i).first(),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: /Открыть бронь/i })).toBeVisible()

  const bookingNumber = (
    await page
      .getByText(/DR-\d+/)
      .first()
      .textContent()
  )?.trim()
  expect(bookingNumber).toMatch(/^DR-\d+/)

  await page.getByRole('link', { name: /Открыть бронь/i }).click()
  await expect(page).toHaveURL(new RegExp(`/cabinet/bookings/${bookingNumber}`))
  await expect(page.getByText('Бриз').first()).toBeVisible()
  await expect(page.getByText(bookingNumber!)).toBeVisible()
})
