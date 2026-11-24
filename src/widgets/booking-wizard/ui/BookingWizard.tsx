import { useTranslation } from 'react-i18next'

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

function stepStatus(
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

/** Multi-step booking panel: period → contacts → OTP → result/conflict. */
const BookingWizard = (props: IBookingWizardProps) => {
  const { dragon } = props
  const { t } = useTranslation()
  const step = useBookingDraftStore((s) => s.step)
  const doneLabel =
    step === 'conflict' ? t('booking.stepError') : t('booking.stepDone')

  const items: IStepsItem[] = [
    {
      id: 'period',
      label: t('booking.stepPeriod'),
      status: stepStatus(step, 'period'),
    },
    {
      id: 'contacts',
      label: t('booking.stepContacts'),
      status: stepStatus(step, 'contacts'),
    },
    {
      id: 'otp',
      label: t('booking.stepCode'),
      status: stepStatus(step, 'otp'),
    },
    {
      id: 'done',
      label: doneLabel,
      status: stepStatus(step, 'done'),
    },
  ]

  return (
    <Panel>
      <Steps items={items} aria-label={t('booking.stepsLabel')} />
      {step === 'period' ? <PeriodStep dragon={dragon} /> : null}
      {step === 'contacts' ? <ContactsStep /> : null}
      {step === 'otp' ? <OtpStep dragon={dragon} /> : null}
      {step === 'result' ? <ResultStep /> : null}
      {step === 'conflict' ? <ConflictStep dragon={dragon} /> : null}
    </Panel>
  )
}

export default BookingWizard
