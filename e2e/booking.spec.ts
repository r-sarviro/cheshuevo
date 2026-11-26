import { expect, test, type Page } from '@playwright/test'

const DEMO_EMAIL = 'anna@example.com'
const OTP = '480010'

async function fillOtp(page: Page, code: string) {
  for (let index = 0; index < code.length; index += 1) {
    await page.getByLabel(`Цифра ${index + 1}`).fill(code[index]!)
  }
}

async function completeContacts(page: Page) {
  await page.getByLabel('Имя').fill('Тест')
  await page.getByLabel('Email').fill('test@example.com')
  await page.getByRole('button', { name: 'Получить код' }).click()
  await expect(
    page.getByRole('heading', { name: 'Введите код из письма' }),
  ).toBeVisible()
}

async function goToOtpStep(page: Page) {
  await page.goto('/dragons/2')

  await expect(page.getByText(/это время свободно/)).toBeVisible({
    timeout: 15_000,
  })
  await page.getByRole('button', { name: 'Продолжить' }).click()

  await expect(
    page.getByRole('heading', { name: 'Как с вами связаться' }),
  ).toBeVisible()

  await completeContacts(page)
}

async function signInCabinet(page: Page) {
  await page.goto('/cabinet/login')
  await page.getByLabel('Email').fill(DEMO_EMAIL)
  await page.getByRole('button', { name: 'Получить код' }).click()
  await expect(
    page.getByRole('heading', { name: 'Введите код из письма' }),
  ).toBeVisible()
  await fillOtp(page, OTP)
  await page.getByRole('button', { name: 'Войти' }).click()
  await expect(page).toHaveURL(/\/cabinet\/bookings/)
}

test.beforeEach(async ({ page }) => {
  // Clear once per test — not via addInitScript (that would wipe session on later goto).
  await page.goto('/')
  await page.evaluate(() => {
    window.localStorage.removeItem('drakonsk.cabinet.session')
  })
})

test('booking happy path creates a reservation', async ({ page }) => {
  await goToOtpStep(page)

  await fillOtp(page, '480010')
  await page.getByRole('button', { name: 'Подтвердить бронь' }).click()

  await expect(
    page.getByRole('heading', { name: 'Бронь создана' }),
  ).toBeVisible({ timeout: 15_000 })
  await expect(page.getByText(/DR-\d+/)).toBeVisible()
  await expect(page.getByRole('link', { name: 'Открыть бронь' })).toBeVisible()
})

test('booking conflict OTP shows error step', async ({ page }) => {
  await goToOtpStep(page)

  await fillOtp(page, '409409')
  await page.getByRole('button', { name: 'Подтвердить бронь' }).click()

  await expect(page.getByText('Это время уже заняли')).toBeVisible({
    timeout: 15_000,
  })
  await expect(
    page.getByRole('button', { name: 'Изменить время' }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Другой дракон' }),
  ).toBeVisible()
})

test('signed-in client books from period without OTP', async ({ page }) => {
  await signInCabinet(page)

  await page.goto('/dragons/2')
  await expect(page.getByText(/это время свободно/)).toBeVisible({
    timeout: 15_000,
  })
  await page.getByRole('button', { name: 'Забронировать' }).click()

  await expect(
    page.getByRole('heading', { name: 'Бронь создана' }),
  ).toBeVisible({ timeout: 15_000 })
  await expect(page.getByRole('link', { name: 'Открыть бронь' })).toBeVisible()
  await expect(page.getByText('Как с вами связаться')).toHaveCount(0)
})
