import { expect, test } from '@playwright/test'

import { mockApi, seedCabinetSession } from './fixtures/apiMocks'

test('seeded session shows bookings and detail', async ({ page }) => {
  await seedCabinetSession(page)
  await mockApi(page)
  await page.goto('/cabinet/bookings')

  await expect(page.getByText('DR-000001')).toBeVisible()
  await page
    .getByRole('link', { name: /DR-000001|Бриз/i })
    .first()
    .click()
  await expect(page).toHaveURL(/\/cabinet\/bookings\/DR-000001/)
  await expect(page.getByText('Бриз').first()).toBeVisible()
})

test('missing booking shows not-found state', async ({ page }) => {
  await seedCabinetSession(page)
  await mockApi(page)
  await page.goto('/cabinet/bookings/DR-MISSING')

  await expect(page.getByText(/Такой брони нет/i)).toBeVisible()
})
