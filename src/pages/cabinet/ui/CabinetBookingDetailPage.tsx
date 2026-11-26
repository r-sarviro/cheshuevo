import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'

import { useCustomerBookingQuery } from '@/entities/booking'
import { useCabinetSessionStore } from '@/entities/customer'
import { getDragonFixture } from '@/entities/dragon'
import { CancelBookingControl } from '@/features/cancel-booking'
import { ApiError } from '@/shared/api'
import { CABINET_BOOKINGS_PATH, dragonPath } from '@/shared/config'
import { useDocumentMeta } from '@/shared/lib/document-meta'
import buttonStyles from '@/shared/ui/button/Button.module.css'
import { EmptyState } from '@/shared/ui/empty-state'
import { Icon } from '@/shared/ui/icon'
import { Note } from '@/shared/ui/note'
import { DragonSheetSprite, DragonSprite } from '@/shared/ui/sprite'
import { Num, Typography } from '@/shared/ui/typography'
import { CabinetBookingCard } from '@/widgets/cabinet-booking-card'

import { bookingStatusBadges } from '../lib/bookingBadges'
import {
  formatDateTimeLabel,
  formatMoney,
  formatPeriodLabel,
  formatTimeLabel,
  isBookingOverdue,
  isStartMissed,
} from '../lib/formatBooking'
import styles from './CabinetPage.module.css'

/** Single booking card with cancel / rebook actions. */
const CabinetBookingDetailPage = () => {
  const { t, i18n } = useTranslation()
  const { bookingNumber } = useParams<{ bookingNumber: string }>()
  const email = useCabinetSessionStore((s) => s.email)
  const query = useCustomerBookingQuery(email, bookingNumber)

  const booking = query.data
  const dragon = booking?.dragonId
    ? getDragonFixture(booking.dragonId)
    : undefined

  useDocumentMeta({
    title: booking
      ? t('seo.cabinet.detail.title', {
          number: booking.bookingNumber,
          name: booking.dragonName ?? booking.dragonId,
        })
      : t('seo.cabinet.detail.fallbackTitle'),
    description: t('seo.cabinet.detail.description'),
    noIndex: true,
  })

  const backLink = (
    <p className={styles.back}>
      <Link className={buttonStyles.text} to={CABINET_BOOKINGS_PATH}>
        <Icon name="left" />
        {t('cabinet.backToList')}
      </Link>
    </p>
  )

  if (query.isPending) {
    return (
      <EmptyState
        role="status"
        pictureBare
        picture={
          <DragonSprite
            name="loader"
            width={48}
            height={48}
            label={t('cabinet.detailLoadingTitle')}
          />
        }
        heading={
          <Typography variant="h3">{t('cabinet.detailLoadingTitle')}</Typography>
        }
      >
        {t('cabinet.detailLoadingBody')}
      </EmptyState>
    )
  }

  if (query.isError || !booking) {
    const notFound =
      query.error instanceof ApiError && query.error.status === 404
    return (
      <>
        {backLink}
        <EmptyState
          picture={<Icon name="warn" xl />}
          pictureStyle={{ background: 'var(--c-tile-peach)' }}
          heading={
            <Typography variant="h3">
              {notFound ? t('cabinet.notFoundTitle') : t('cabinet.errorTitle')}
            </Typography>
          }
          action={
            <Link className={buttonStyles.btn} to={CABINET_BOOKINGS_PATH}>
              {t('cabinet.backToList')}
            </Link>
          }
        >
          {notFound ? t('cabinet.notFoundBody') : t('cabinet.errorBody')}
        </EmptyState>
      </>
    )
  }

  const periodText = formatPeriodLabel(
    booking.startsAt,
    booking.endsAt,
    i18n.language,
  )
  const overdue = isBookingOverdue(booking)
  const startMissed = isStartMissed(booking)
  const inactive = ['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(
    booking.status,
  )

  const facts = [
    {
      label: t('cabinet.factPeriod'),
      value: <Num>{periodText}</Num>,
    },
    {
      label: t('cabinet.factTotal'),
      value: <Num>{formatMoney(booking.totalAmount, booking.currency)}</Num>,
    },
    {
      label: t('cabinet.factPayment'),
      value:
        booking.paymentStatus === 'PAID'
          ? t('cabinet.paymentPaidManager')
          : t('cabinet.paymentUnpaidManager'),
    },
  ]

  if (booking.issuedAt) {
    facts.push({
      label: t('cabinet.factIssued'),
      value: (
        <Num>{formatDateTimeLabel(booking.issuedAt, i18n.language)}</Num>
      ),
    })
  }
  if (booking.returnedAt) {
    facts.push({
      label: t('cabinet.factReturned'),
      value: (
        <Num>{formatDateTimeLabel(booking.returnedAt, i18n.language)}</Num>
      ),
    })
  }
  if (booking.cancelledAt) {
    facts.push({
      label: t('cabinet.factCancelled'),
      value: (
        <Num>{formatDateTimeLabel(booking.cancelledAt, i18n.language)}</Num>
      ),
    })
  }

  const notes = (
    <div className={styles.notes}>
      {booking.paymentStatus === 'UNPAID' && booking.status === 'CONFIRMED' ? (
        <Note tone="sky" icon="info">
          {t('cabinet.notePayManager')}
        </Note>
      ) : null}
      {booking.paymentStatus === 'PAID' && booking.status === 'CONFIRMED' ? (
        <Note tone="sky" icon="info">
          {t('cabinet.notePaidNoCancel', {
            contacts: t('cabinet.rentalContacts'),
          })}
        </Note>
      ) : null}
      {overdue ? (
        <Note
          tone="peach"
          icon="warn"
          alert
          heading={t('cabinet.noteOverdueTitle', {
            time: formatTimeLabel(booking.endsAt, i18n.language),
          })}
        >
          {t('cabinet.noteOverdueBody')}
        </Note>
      ) : null}
      {startMissed ? (
        <Note tone="butter" icon="clock" alert>
          {t('cabinet.noteStartMissed', {
            contacts: t('cabinet.rentalContacts'),
          })}
        </Note>
      ) : null}
      {booking.status === 'NO_SHOW' ? (
        <Note tone="sky" icon="info">
          {t('cabinet.noteNoShow', {
            contacts: t('cabinet.rentalContacts'),
          })}
        </Note>
      ) : null}
    </div>
  )

  return (
    <>
      {backLink}
      <CabinetBookingCard
        title={booking.dragonName ?? booking.dragonId}
        bookingNumber={booking.bookingNumber}
        tile={dragon?.tileToken}
        picture={
          dragon?.spriteKey ? (
            <DragonSheetSprite
              name={dragon.spriteKey}
              label={booking.dragonName ?? dragon.name}
            />
          ) : null
        }
        badges={bookingStatusBadges(booking, t)}
        facts={facts}
        notes={notes}
        actions={
          <CancelBookingControl
            bookingNumber={booking.bookingNumber}
            dragonName={booking.dragonName ?? booking.dragonId}
            periodText={periodText}
            startsAt={booking.startsAt}
            status={booking.status}
            paymentStatus={booking.paymentStatus}
            onCancelled={() => {
              void query.refetch()
            }}
          />
        }
      />
      {inactive && booking.dragonId ? (
        <p className={styles.rebook}>
          <Link
            className={[buttonStyles.btn, buttonStyles.ghost].join(' ')}
            to={dragonPath(booking.dragonId)}
          >
            {t('cabinet.rebook')}
          </Link>
        </p>
      ) : null}
    </>
  )
}

export default CabinetBookingDetailPage
