import { useTranslation } from 'react-i18next'

import { useCabinetSessionStore } from '@/entities/customer'
import type { IDragon } from '@/entities/dragon'
import { Panel } from '@/shared/ui/panel'
import { Steps, type IStepsItem } from '@/shared/ui/steps'

import {
  useBookingDraftStore,
  type TBookingStep,
} from '../model/bookingDraftStore'

import ConflictStep from './ConflictStep'
import ContactsStep from './ContactsStep'
import OtpStep from './OtpStep'
import PeriodStep from './PeriodStep'
import ResultStep from './ResultStep'

export interface IBookingWizardProps {
  dragon: IDragon
}

function guestStepStatus(
  current: TBookingStep,
  id: 'period' | 'contacts' | 'otp' | 'done',
): IStepsItem['status'] {
  const order = ['period', 'contacts', 'otp', 'result'] as const
  const map: Record<TBookingStep, number> = {
    period: 0,
    contacts: 1,
    otp: 2,
    result: 3,
    conflict: 3,
  }
  const target = id === 'done' ? 3 : order.indexOf(id)
  const cur = map[current]
  if (cur > target) return 'done'
  if (cur === target) return 'current'
  return 'todo'
}

function sessionStepStatus(
  current: TBookingStep,
  id: 'period' | 'done',
): IStepsItem['status'] {
  if (current === 'period') {
    return id === 'period' ? 'current' : 'todo'
  }
  return id === 'period' ? 'done' : 'current'
}

/** Multi-step booking panel: guest period→contacts→OTP; session period→result. */
const BookingWizard = (props: IBookingWizardProps) => {
  const { dragon } = props
  const { t } = useTranslation()
  const step = useBookingDraftStore((s) => s.step)
  const sessionEmail = useCabinetSessionStore((s) => s.email)
  const sessionName = useCabinetSessionStore((s) => s.name)
  const isAuthenticated = useCabinetSessionStore((s) => s.isAuthenticated)
  const sessionFlow = isAuthenticated() && Boolean(sessionEmail && sessionName)

  const doneLabel =
    step === 'conflict' ? t('booking.stepError') : t('booking.stepDone')

  const items: IStepsItem[] = sessionFlow
    ? [
        {
          id: 'period',
          label: t('booking.stepPeriod'),
          status: sessionStepStatus(step, 'period'),
        },
        {
          id: 'done',
          label: doneLabel,
          status: sessionStepStatus(step, 'done'),
        },
      ]
    : [
        {
          id: 'period',
          label: t('booking.stepPeriod'),
          status: guestStepStatus(step, 'period'),
        },
        {
          id: 'contacts',
          label: t('booking.stepContacts'),
          status: guestStepStatus(step, 'contacts'),
        },
        {
          id: 'otp',
          label: t('booking.stepCode'),
          status: guestStepStatus(step, 'otp'),
        },
        {
          id: 'done',
          label: doneLabel,
          status: guestStepStatus(step, 'done'),
        },
      ]

  return (
    <Panel>
      <Steps items={items} aria-label={t('booking.stepsLabel')} />
      {step === 'period' ? <PeriodStep dragon={dragon} /> : null}
      {!sessionFlow && step === 'contacts' ? <ContactsStep /> : null}
      {!sessionFlow && step === 'otp' ? <OtpStep dragon={dragon} /> : null}
      {step === 'result' ? <ResultStep /> : null}
      {step === 'conflict' ? <ConflictStep dragon={dragon} /> : null}
    </Panel>
  )
}

export default BookingWizard
