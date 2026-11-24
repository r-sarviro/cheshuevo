import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { BookingResult } from '@/entities/booking'
import { HOME_PATH } from '@/shared/config'
import { useUiStore } from '@/shared/model'
import buttonStyles from '@/shared/ui/button/Button.module.css'

import { formatMoney, formatPeriodLabel } from '../lib/formatters'
import { useBookingDraftStore } from '../model/bookingDraftStore'

/** Successful booking summary inside the booking panel. */
const ResultStep = () => {
  const { t, i18n } = useTranslation()
  const locale = useUiStore((s) => s.locale)
  const booking = useBookingDraftStore((s) => s.createdBooking)
  const contacts = useBookingDraftStore((s) => s.contacts)

  if (!booking) return null

  const hours = booking.billableHours ?? 1

  return (
    <BookingResult
      embedded
      booking={booking}
      title={t('booking.resultHeading')}
      factLabels={{
        dragon: t('booking.factDragon'),
        period: t('booking.factPeriod'),
        total: t('booking.factTotal'),
        payment: t('booking.factPayment'),
      }}
      statusLabels={{
        booking: t('ds.statusConfirmed'),
        payment: t('ds.statusUnpaid'),
      }}
      periodText={formatPeriodLabel(
        booking.startsAt,
        booking.endsAt,
        locale || i18n.language,
      )}
      totalText={t('booking.totalHours', {
        total: formatMoney(booking.totalAmount, booking.currency),
        hours,
      })}
      paymentText={t('booking.paymentHint')}
      emailHint={
        contacts
          ? t('booking.emailSent', { email: contacts.email })
          : undefined
      }
      actions={
        <Link
          className={[buttonStyles.btn, buttonStyles.ghost].join(' ')}
          to={HOME_PATH}
        >
          {t('booking.toCatalog')}
        </Link>
      }
    />
  )
}

export default ResultStep
