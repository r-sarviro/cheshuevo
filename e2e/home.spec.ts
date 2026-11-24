import { expect, test } from '@playwright/test'

test('home page shows landing hero and brand', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', { name: 'Прокат драконов' }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'Драконск' }).first()).toBeVisible()
})
