import { expect, test } from '@playwright/test'
import { randomUUID } from 'node:crypto'

import {
  fillFreeBookingPeriod,
  LIVE_DRAGON_ID,
  LIVE_DRAGON_NAME,
  readLatestOtp,
  seedCabinetSession,
  skipUnlessLiveApi,
} from './fixtures/liveApi'

/**
 * Live smoke against localhost:8000 (no page.route mocks).
 * Run: yarn test:e2e:live
 * Requires API + Vite; OTP is read from Laravel local log.
 */

test('live availability enables continue CTA', async ({ page }) => {
  skipUnlessLiveApi(test)
  test.setTimeout(60_000)

  await page.goto(`/dragons/${LIVE_DRAGON_ID}`)
  await expect(
    page.getByRole('heading', { name: LIVE_DRAGON_NAME }),
  ).toBeVisible()

  await fillFreeBookingPeriod(page)
  await expect(page.getByText(/свободно/i)).toBeVisible({ timeout: 15_000 })

  const continueBtn = page.getByRole('button', { name: /Продолжить/i })
  await expect(continueBtn).toBeEnabled()
  await continueBtn.click()

  await expect(page.getByLabel(/^Имя/i)).toBeVisible()
})

test('live cabinet booking reaches result step', async ({ page }) => {
  skipUnlessLiveApi(test)
  test.setTimeout(90_000)

  await seedCabinetSession(page)

  await page.goto(`/dragons/${LIVE_DRAGON_ID}`)
  await expect(
    page.getByRole('heading', { name: LIVE_DRAGON_NAME }),
  ).toBeVisible()

  await fillFreeBookingPeriod(page, { daysAhead: 14, startTime: '13:00', endTime: '15:00' })
  await expect(page.getByText(/свободно/i)).toBeVisible({ timeout: 15_000 })

  const bookBtn = page.getByRole('button', { name: /Забронировать/i })
  await expect(bookBtn).toBeEnabled()
  await bookBtn.click()

  await expect(page.getByText(/DR-\d+/)).toBeVisible({ timeout: 20_000 })
  await expect(
    page.getByText(/Подтверждение отправили|Оплата/i).first(),
  ).toBeVisible()
})

test('live guest booking creates confirmed booking', async ({ page }) => {
  skipUnlessLiveApi(test)
  test.setTimeout(90_000)

  const email = `live-book-${randomUUID().slice(0, 8)}@example.com`
  const name = 'Живая Проверка'

  await page.goto(`/dragons/${LIVE_DRAGON_ID}`)
  await expect(
    page.getByRole('heading', { name: LIVE_DRAGON_NAME }),
  ).toBeVisible()

  await fillFreeBookingPeriod(page, { daysAhead: 15 })
  await expect(page.getByText(/свободно/i)).toBeVisible({ timeout: 15_000 })

  await page.getByRole('button', { name: /Продолжить/i }).click()

  await page.getByLabel(/^Имя/i).fill(name)
  await page.locator('input[type="email"]').fill(email)
  await page.getByRole('button', { name: /Получить код/i }).click()

  await expect(page.locator('input[inputmode="numeric"]').first()).toBeVisible({
    timeout: 15_000,
  })

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
  await expect(
    page.getByRole('link', { name: /Открыть бронь/i }),
  ).toBeVisible()

  const bookingNumber = (
    await page.getByText(/DR-\d+/).first().textContent()
  )?.trim()
  expect(bookingNumber).toMatch(/^DR-\d+/)

  await page.getByRole('link', { name: /Открыть бронь/i }).click()
  await expect(page).toHaveURL(
    new RegExp(`/cabinet/bookings/${bookingNumber}`),
  )
  await expect(page.getByText(LIVE_DRAGON_NAME).first()).toBeVisible()
  await expect(page.getByText(bookingNumber!)).toBeVisible()
})
