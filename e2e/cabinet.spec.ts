import { expect, test, type Page } from '@playwright/test'

const DEMO_EMAIL = 'anna@example.com'
const OTP = '480010'

async function fillOtp(page: Page, code: string) {
  for (let index = 0; index < code.length; index += 1) {
    await page.getByLabel(`Цифра ${index + 1}`).fill(code[index]!)
  }
}

async function signInCabinet(page: Page, email = DEMO_EMAIL) {
  await page.getByLabel('Email').fill(email)
  await page.getByRole('button', { name: 'Получить код' }).click()
  await expect(
    page.getByRole('heading', { name: 'Введите код из письма' }),
  ).toBeVisible()
  await fillOtp(page, OTP)
  await page.getByRole('button', { name: 'Войти' }).click()
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    window.localStorage.removeItem('drakonsk.cabinet.session')
  })
})

test('deep-link without session redirects to login with hint', async ({
  page,
}) => {
  await page.goto('/cabinet/bookings/DR-001031')
  await expect(page).toHaveURL(/\/cabinet\/login/)
  await expect(
    page.getByText('Войдите, чтобы открыть бронь DR-001031.'),
  ).toBeVisible()
})

test('login without bookings is refused on get-code', async ({ page }) => {
  await page.goto('/cabinet/login')
  await page.getByLabel('Email').fill('nobody@example.com')
  await page.getByRole('button', { name: 'Получить код' }).click()
  await expect(page.getByText('Броней на эту почту нет')).toBeVisible()
  await expect(page.getByRole('link', { name: 'В каталог' })).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Введите код из письма' }),
  ).toHaveCount(0)
})

test('cabinet happy path: login → list → cancel → profile', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Мои брони' }).first().click()
  await expect(page).toHaveURL(/\/cabinet\/login/)

  await signInCabinet(page)
  await expect(page).toHaveURL(/\/cabinet\/bookings/)
  await expect(page.getByRole('heading', { name: 'Мои брони' })).toBeVisible({
    timeout: 15_000,
  })
  await expect(page.getByText('DR-001031')).toBeVisible()

  await page.getByRole('link', { name: /Хранитель Приливов/ }).click()
  await expect(page).toHaveURL(/\/cabinet\/bookings\/DR-001031/)
  await expect(
    page.getByRole('heading', { name: 'Хранитель Приливов' }),
  ).toBeVisible()

  await page.getByRole('button', { name: 'Отменить бронь' }).click()
  await expect(
    page.getByRole('heading', { name: 'Отменить бронь?' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Отменить бронь' }).last().click()
  await expect(page.locator('[data-status="cancelled"]')).toBeVisible({
    timeout: 10_000,
  })

  await page.getByRole('link', { name: 'Профиль' }).click()
  await expect(page).toHaveURL(/\/cabinet\/profile/)
  await expect(page.getByRole('heading', { name: 'Профиль' })).toBeVisible()
  await page.getByLabel('Имя').fill('Анна')
  await page.getByRole('button', { name: 'Сохранить' }).click()
  await expect(page.getByText('Сохранили.')).toBeVisible({ timeout: 10_000 })
})
