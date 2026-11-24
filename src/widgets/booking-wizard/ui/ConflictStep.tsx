import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import type { IDragon } from '@/entities/dragon'
import { ButtonText } from '@/shared/ui/button'
import { Note } from '@/shared/ui/note'

import { useBookingDraftStore } from '../model/bookingDraftStore'

import styles from './BookingWizard.module.css'

export interface IConflictStepProps {
  dragon: IDragon
}

/** Booking conflict: change time or pick another dragon. */
const ConflictStep = (props: IConflictStepProps) => {
  const { dragon } = props
  const { t } = useTranslation()
  const navigate = useNavigate()
  const conflictMessage = useBookingDraftStore((s) => s.conflictMessage)
  const setStep = useBookingDraftStore((s) => s.setStep)
  const clearSession = useBookingDraftStore((s) => s.clearSession)

  return (
    <div className={styles.flush}>
      <Note
        tone="peach"
        icon="cross"
        heading={t('ds.noteTitle')}
        alert
        actions={
          <>
            <ButtonText type="button" onClick={() => setStep('period')}>
              {t('ds.textAction')}
            </ButtonText>
            <ButtonText
              type="button"
              onClick={() => {
                clearSession()
                void navigate('/')
              }}
            >
              {t('booking.otherDragon')}
            </ButtonText>
          </>
        }
      >
        {conflictMessage ?? t('booking.conflictBody', { name: dragon.name })}
      </Note>
    </div>
  )
}

export default ConflictStep
