import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import Dialog from './Dialog'

beforeAll(() => {
  if (typeof HTMLDialogElement === 'undefined') return
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function showModal() {
      this.setAttribute('open', '')
    }
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function close() {
      this.removeAttribute('open')
    }
  }
})

function Harness() {
  const [open, setOpen] = useState(true)
  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      title="Отменить бронь?"
      actions={<button type="button">Не отменять</button>}
    >
      <p>Время освободится для других клиентов.</p>
    </Dialog>
  )
}

describe('Dialog', () => {
  it('renders title and closes on backdrop click', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    expect(
      screen.getByRole('heading', { name: 'Отменить бронь?' }),
    ).toBeInTheDocument()

    const dialog = screen.getByRole('dialog')
    await user.click(dialog)
    expect(dialog).not.toHaveAttribute('open')
  })

  it('calls onClose when cancel is prevented via Esc path', () => {
    const onClose = vi.fn()
    render(
      <Dialog open onClose={onClose} title="Title">
        Body
      </Dialog>,
    )

    const dialog = screen.getByRole('dialog')
    dialog.dispatchEvent(new Event('cancel', { cancelable: true }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
