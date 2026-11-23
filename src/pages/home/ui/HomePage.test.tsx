import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import HomePage from './HomePage'

describe('HomePage', () => {
  it('renders the brand title from i18n', () => {
    render(<HomePage />)

    expect(
      screen.getByRole('heading', { level: 1, name: 'Чешуёво' }),
    ).toBeInTheDocument()
  })
})
