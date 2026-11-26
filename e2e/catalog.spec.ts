import { expect, test } from '@playwright/test'

import { MOCK_DRAGON, mockApi } from './fixtures/apiMocks'

test('catalog loads dragons from API and opens detail', async ({ page }) => {
  await mockApi(page)
  await page.goto('/')

  await expect(page.getByText(MOCK_DRAGON.name).first()).toBeVisible()
  await page.getByRole('link', { name: /Забронировать/i }).first().click()
  await expect(page).toHaveURL(new RegExp(`/dragons/${MOCK_DRAGON.id}`))
  await expect(page.getByText('140\u00a0₽').first()).toBeVisible()
})
