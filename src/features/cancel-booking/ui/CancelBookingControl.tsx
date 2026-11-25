import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import type { TBookingStatus, TPaymentStatus } from '@/entities/booking'
import { ApiError } from '@/shared/api'
import { Button, ButtonText } from '@/shared/ui/button'
import { Dialog } from '@/shared/ui/dialog'
import { Note } from '@/shared/ui/note'
import { Num, Typography } from '@/shared/ui/typography'

import { useCancelBookingMutation } from '../api/useCancelBooking'
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

/** Cancel action + confirm dialog for an LK booking card (CAB-040…043). */
const CancelBookingControl = (props: ICancelBookingControlProps) => {
  const {
    bookingNumber,
    dragonName,
    periodText,
    startsAt,
    status,
    paymentStatus,
    onCancelled,
    className,
  } = props
  const { t } = useTranslation()
  const cancelMutation = useCancelBookingMutation()
  const [open, setOpen] = useState(false)
  const [errorNote, setErrorNote] = useState<ReactNode>(null)
  const [locked, setLocked] = useState(false)

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
    if (cancelMutation.isPending) return
    setOpen(false)
    setErrorNote(null)
    setLocked(false)
  }

  const onConfirm = async () => {
    setErrorNote(null)
    try {
      await cancelMutation.mutateAsync({ bookingNumber, startsAt })
      setOpen(false)
      onCancelled?.(bookingNumber)
    } catch (error) {
      if (error instanceof ApiError && error.code === 'RENTAL_STARTED') {
        setLocked(true)
        setErrorNote(
          <Note tone="peach" icon="cross" alert>
            {t('cabinet.cancelStarted', {
              contacts: t('cabinet.rentalContacts'),
            })}
          </Note>,
        )
        return
      }
      setErrorNote(
        <Note tone="peach" icon="cross" alert>
          {t('cabinet.cancelFailed')}
        </Note>,
      )
    }
  }

  return (
    <>
      <ButtonText
        type="button"
        className={className}
        onClick={() => {
          setErrorNote(null)
          setLocked(false)
          setOpen(true)
        }}
      >
        {t('cabinet.cancelAction')}
      </ButtonText>
      <Dialog
        open={open}
        onClose={close}
        title={t('cabinet.cancelTitle')}
        actions={
          <>
            <Button
              type="button"
              variant="danger"
              loading={cancelMutation.isPending}
              disabled={locked || cancelMutation.isPending}
              onClick={() => {
                void onConfirm()
              }}
            >
              {t('cabinet.cancelConfirm')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={cancelMutation.isPending}
              onClick={close}
            >
              {t('cabinet.cancelKeep')}
            </Button>
          </>
        }
      >
        <Typography variant="text">
          {bookingNumber}, {dragonName}, <Num>{periodText}</Num>.{' '}
          {t('cabinet.cancelBody')}
        </Typography>
        {errorNote}
      </Dialog>
    </>
  )
}

export default CancelBookingControl
