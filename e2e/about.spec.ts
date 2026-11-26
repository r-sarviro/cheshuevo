import { expect, test } from '@playwright/test'

test('about page shows place how trust and contacts', async ({ page }) => {
  await page.goto('/about')

  await expect(page).toHaveTitle(/О нас/)

  const about = page.getByRole('heading', { name: 'О прокате' })
  const place = page.getByRole('heading', { name: 'Место' })
  const map = page.getByRole('img', {
    name: 'Пиксельная карта места проката: домик, пруд, тропинка и точка выдачи',
  })
  const how = page.getByRole('heading', { name: 'Как это работает' })
  const trust = page.getByRole('heading', { name: 'Почему Драконск' })
  const contacts = page.getByRole('heading', { name: 'Контакты' })

  await expect(about).toBeVisible()
  await expect(place).toBeVisible()
  await expect(map).toBeVisible()
  await expect(how).toBeVisible()
  await expect(trust).toBeVisible()
  await expect(contacts).toBeVisible()
  await expect(
    page.getByRole('link', { name: '+7 900 555-12-34' }).first(),
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'hello@drakonsk.ru' }).first(),
  ).toBeVisible()

  const aboutBox = await about.boundingBox()
  const howBox = await how.boundingBox()
  const trustBox = await trust.boundingBox()
  const contactsBox = await contacts.boundingBox()
  expect(aboutBox && howBox && aboutBox.y < howBox.y).toBeTruthy()
  expect(howBox && trustBox && howBox.y < trustBox.y).toBeTruthy()
  expect(trustBox && contactsBox && trustBox.y < contactsBox.y).toBeTruthy()
})
