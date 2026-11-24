import { expect, test, type Page } from '@playwright/test'

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

test('booking happy path creates a reservation', async ({ page }) => {
  await goToOtpStep(page)

  await fillOtp(page, '480010')
  await page.getByRole('button', { name: 'Подтвердить бронь' }).click()

  await expect(
    page.getByRole('heading', { name: 'Бронь создана' }),
  ).toBeVisible({ timeout: 15_000 })
  await expect(page.getByText(/DR-\d+/)).toBeVisible()
  await expect(page.getByRole('link', { name: 'В каталог' })).toBeVisible()
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
