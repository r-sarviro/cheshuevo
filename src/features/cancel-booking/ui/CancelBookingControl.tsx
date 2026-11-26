import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import type { TBookingStatus, TPaymentStatus } from '@/entities/booking'
import { Button, ButtonText } from '@/shared/ui/button'
import { Dialog } from '@/shared/ui/dialog'
import { Num, Typography } from '@/shared/ui/typography'

import { canCancel } from '../lib/canCancel'

export interface ICancelBookingControlProps {
  bookingNumber: string
  dragonName: ReactNode
  periodText: ReactNode
  startsAt: string
  status: TBookingStatus
  paymentStatus: TPaymentStatus
  onCancelled?: (bookingNumber: string) => void
  className?: string
}

/**
 * Cancel action + confirm dialog for an LK booking card (CAB-040…043).
 * TODO(api): mount in cabinet detail when customer cancel endpoint exists.
 */
const CancelBookingControl = (props: ICancelBookingControlProps) => {
  const {
    bookingNumber,
    dragonName,
    periodText,
    startsAt,
    status,
    paymentStatus,
    className,
  } = props
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  if (
    !canCancel({
      status,
      paymentStatus,
      startsAt,
    })
  ) {
    return null
  }

  const close = () => {
    setOpen(false)
  }

  const onConfirm = () => {
    // TODO(api): call customer cancel endpoint when contract is known.
    // Handle RENTAL_STARTED → cabinet.cancelStarted; other errors → cancelFailed.
    close()
  }

  return (
    <>
      <ButtonText
        type="button"
        className={className}
        onClick={() => setOpen(true)}
      >
        {t('cabinet.cancelAction')}
      </ButtonText>
      <Dialog
        open={open}
        onClose={close}
        title={t('cabinet.cancelTitle')}
        actions={
          <>
            <Button type="button" variant="danger" onClick={onConfirm}>
              {t('cabinet.cancelConfirm')}
            </Button>
            <Button type="button" variant="ghost" onClick={close}>
              {t('cabinet.cancelKeep')}
            </Button>
          </>
        }
      >
        <Typography variant="text">
          {bookingNumber}, {dragonName}, <Num>{periodText}</Num>.{' '}
          {t('cabinet.cancelBody')}
        </Typography>
      </Dialog>
    </>
  )
}

export default CancelBookingControl
