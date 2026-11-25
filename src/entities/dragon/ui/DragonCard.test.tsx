import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import DragonCard from './DragonCard'

describe('DragonCard', () => {
  it('reserves tags and fit space while loading', () => {
    const { container } = render(
      <DragonCard
        loading
        loadingLabel="Карточка загружается"
        priceLabel="за час"
        actionLabel="Забронировать"
      />,
    )

    expect(
      screen.getByRole('article', { name: 'Карточка загружается' }),
    ).toBeInTheDocument()

    const body = container.querySelector('article > div:last-child')
    const kids = body ? [...body.children] : []
    expect(kids).toHaveLength(5)
    expect(kids[1]?.children).toHaveLength(3)
    expect(kids[3]?.querySelector('span')).not.toBeNull()
  })
})
