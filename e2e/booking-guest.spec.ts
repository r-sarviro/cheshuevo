import { expect, test, type Page } from '@playwright/test'

import { MOCK_BOOKING, MOCK_DRAGON, mockApi } from './fixtures/apiMocks'

async function goToContacts(page: Page) {
  await page.goto(`/dragons/${MOCK_DRAGON.id}`)
  await expect(
    page.getByRole('heading', { name: MOCK_DRAGON.name }),
  ).toBeVisible()
  await expect(page.getByText(/свободно|free/i)).toBeVisible({
    timeout: 10_000,
  })
  await page.getByRole('button', { name: /Продолжить|Continue/i }).click()
  await expect(page.getByLabel(/^Имя/i)).toBeVisible()
}

async function goToOtp(page: Page) {
  await goToContacts(page)
  await page.getByLabel(/^Имя/i).fill('Анна Тест')
  await page.locator('input[type="email"]').fill('anna-e2e@example.com')
  await page.getByRole('button', { name: /Получить код/i }).click()
  await expect(page.locator('input[inputmode="numeric"]').first()).toBeVisible()
}

async function typeOtp(page: Page, code: string) {
  const firstDigit = page.locator('input[inputmode="numeric"]').first()
  await firstDigit.click()
  await page.keyboard.type(code)
}

test('dragon booking page loads wizard with API dragon', async ({ page }) => {
  await mockApi(page)
  await page.goto(`/dragons/${MOCK_DRAGON.id}`)

  await expect(
    page.getByRole('heading', { name: MOCK_DRAGON.name }),
  ).toBeVisible()
  await expect(page.getByText('140\u00a0₽').first()).toBeVisible()
  await expect(page.locator('form').first()).toBeVisible()
})

test('unavailable period blocks booking CTA', async ({ page }) => {
  await mockApi(page, { availabilityUnavailable: true })
  await page.goto(`/dragons/${MOCK_DRAGON.id}`)

  await expect(page.getByText(/занято|занят|unavailable|taken/i)).toBeVisible({
    timeout: 10_000,
  })
  await expect(
    page.getByRole('button', {
      name: /Забронировать|Book|Продолжить|Continue/i,
    }),
  ).toBeDisabled()
})

test('contacts require name and valid email', async ({ page }) => {
  await mockApi(page)
  await goToContacts(page)

  await page.getByRole('button', { name: /Получить код/i }).click()
  await expect(
    page.getByText(/как к вам обращаться|how to address/i),
  ).toBeVisible()

  await page.getByLabel(/^Имя/i).fill('Анна')
  await page.locator('input[type="email"]').fill('not-an-email')
  await page.getByRole('button', { name: /Получить код/i }).click()
  await expect(page.getByText(/email|почт/i).first()).toBeVisible()
})

test('invalid OTP shows attempts left', async ({ page }) => {
  await mockApi(page, { otpConfirm: 'invalid' })
  await goToOtp(page)
  await typeOtp(page, '000000')
  await page.getByRole('button', { name: /Подтвердить бронь/i }).click()

  await expect(page.getByText(/не подошёл|Wrong code/i)).toBeVisible({
    timeout: 10_000,
  })
  await expect(page.getByText(/попыток|Attempts left/i)).toBeVisible()
})

test('exhausted OTP shows lock note', async ({ page }) => {
  await mockApi(page, { otpConfirm: 'exhausted' })
  await goToOtp(page)
  await typeOtp(page, '000000')
  await page.getByRole('button', { name: /Подтвердить бронь/i }).click()

  await expect(
    page.getByText(/Слишком много попыток|Too many attempts/i),
  ).toBeVisible({
    timeout: 10_000,
  })
  await expect(
    page.getByRole('button', { name: /Подтвердить бронь/i }),
  ).toBeDisabled()
})

test('booking conflict shows conflict step', async ({ page }) => {
  await mockApi(page, { createBooking: 'conflict' })
  await goToOtp(page)
  await typeOtp(page, '123456')
  await page.getByRole('button', { name: /Подтвердить бронь/i }).click()

  await expect(page.getByText(/уже занят|already booked/i)).toBeVisible({
    timeout: 10_000,
  })
  await expect(
    page.getByRole('button', { name: /Другой дракон|another dragon/i }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: /Изменить время|Change time/i }),
  ).toBeVisible()
})

test('guest booking happy path: period → contacts → OTP → result', async ({
  page,
}) => {
  await mockApi(page)
  await goToOtp(page)
  await typeOtp(page, '123456')
  await page.getByRole('button', { name: /Подтвердить бронь/i }).click()

  await expect(page.getByText(MOCK_BOOKING.booking_number)).toBeVisible({
    timeout: 10_000,
  })
  await expect(
    page.getByText(/Подтверждение отправили на anna-e2e@example.com/i),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: /Открыть бронь/i })).toBeVisible()
})
