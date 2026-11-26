import { expect, test } from '@playwright/test'

import { mockApi } from './fixtures/apiMocks'

test('login without bookings shows catalog CTA', async ({ page }) => {
  await mockApi(page, { noBookingsOnLogin: true })
  await page.goto('/cabinet/login')

  await page.locator('input[type="email"]').fill('nobody@example.com')
  await page.getByRole('button', { name: /Получить код/i }).click()

  await expect(page.getByText(/Броней на эту почту нет/i)).toBeVisible()
  await expect(page.getByRole('link', { name: 'В каталог' })).toBeVisible()
})

test('successful login opens bookings list', async ({ page }) => {
  await mockApi(page)
  await page.goto('/cabinet/login')

  await page.locator('input[type="email"]').fill('anna@example.com')
  await page.getByRole('button', { name: /Получить код/i }).click()

  const firstDigit = page.locator('input[inputmode="numeric"]').first()
  await firstDigit.click()
  await page.keyboard.type('123456')

  await page.getByRole('button', { name: /Войти/i }).click()
  await expect(page).toHaveURL(/\/cabinet\/bookings/)
  await expect(page.getByText('DR-000001')).toBeVisible()
})
