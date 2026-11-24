import { expect, test } from '@playwright/test'

test('home page shows building-blocks smoke', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', { name: 'Блоки для лендинга' }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'Чешуёво' }).first()).toBeVisible()
})
