import { expect, test } from '@playwright/test'

import { mockApi } from './fixtures/apiMocks'

test('home page shows landing hero and brand', async ({ page }) => {
  await mockApi(page)
  await page.goto('/')

  await expect(
    page.getByRole('heading', { name: 'Прокат драконов' }),
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'Драконск' }).first(),
  ).toBeVisible()
})

test('home page shows about bridge and opens about page', async ({ page }) => {
  await mockApi(page)
  await page.goto('/')

  await expect(
    page.getByRole('heading', { name: 'Прокат с живой выдачей' }),
  ).toBeVisible()

  await page.getByRole('link', { name: 'О прокате' }).click()
  await expect(page).toHaveURL(/\/about/)
  await expect(
    page.getByRole('heading', { name: 'Как это работает' }),
  ).toBeVisible()
})
