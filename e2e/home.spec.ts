import { expect, test } from '@playwright/test'

test('home page shows Cheshuevo brand', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Чешуёво' })).toBeVisible()
  await expect(
    page.getByText('Прокат драконов — выбирай, бронируй, летай'),
  ).toBeVisible()
})
