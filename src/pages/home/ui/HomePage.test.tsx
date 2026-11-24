import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import HomePage from './HomePage'

describe('HomePage', () => {
  it('renders the building-blocks smoke title', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'Блоки для лендинга' }),
    ).toBeInTheDocument()
  })
})
