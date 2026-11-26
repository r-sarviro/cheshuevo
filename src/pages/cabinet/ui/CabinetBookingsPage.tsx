import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import {
  splitCustomerBookings,
  useCustomerBookingsQuery,
} from '@/entities/booking'
import { useCabinetSessionStore } from '@/entities/customer'
import { CATALOG_PATH, cabinetBookingPath } from '@/shared/config'
import { useDocumentMeta } from '@/shared/lib/document-meta'
import { Button } from '@/shared/ui/button'
import buttonStyles from '@/shared/ui/button/Button.module.css'
import { EmptyState } from '@/shared/ui/empty-state'
import { Icon } from '@/shared/ui/icon'
import { DragonAvatar } from '@/shared/ui/sprite'
import { Num, Typography } from '@/shared/ui/typography'
import {
  BookingList,
  BookingListItem,
  BookingRow,
} from '@/widgets/booking-list'

import { bookingStatusBadges } from '../lib/bookingBadges'
import {
  bookingHours,
  formatMoney,
  formatPeriodLabel,
} from '../lib/formatBooking'

/** Cabinet bookings list: current / past sections. */
const CabinetBookingsPage = () => {
  const { t, i18n } = useTranslation()
  const isAuthenticated = useCabinetSessionStore((s) => s.isAuthenticated)
  const query = useCustomerBookingsQuery(isAuthenticated())

  useDocumentMeta({
    title: t('seo.cabinet.bookings.title'),
    description: t('seo.cabinet.bookings.description'),
    noIndex: true,
  })

  const split = query.data
    ? splitCustomerBookings(query.data)
    : { current: [], past: [] }
  const hasRows = split.current.length > 0 || split.past.length > 0

  const bookMore =
    query.isSuccess && hasRows ? (
      <Link className={buttonStyles.btn} to={CATALOG_PATH}>
        <Icon name="plus" />
        {t('cabinet.bookMore')}
      </Link>
    ) : null

  return (
    <BookingList
      bookMore={bookMore}
      loading={query.isPending}
      error={
        query.isError ? (
          <EmptyState
            role="alert"
            picture={<Icon name="cloud" xl />}
            pictureStyle={{ background: 'var(--c-tile-sky)' }}
            heading={
              <Typography variant="h3">{t('cabinet.errorTitle')}</Typography>
            }
            action={
              <Button
                type="button"
                onClick={() => {
                  void query.refetch()
                }}
              >
                {t('cabinet.errorCta')}
              </Button>
            }
          >
            {t('cabinet.errorBody')}
          </EmptyState>
        ) : null
      }
      empty={
        query.isSuccess && !hasRows ? (
          <EmptyState
            picture={<Icon name="egg" xl />}
            heading={
              <Typography variant="h3">{t('cabinet.emptyTitle')}</Typography>
            }
            action={
              <Link className={buttonStyles.btn} to={CATALOG_PATH}>
                {t('cabinet.emptyCta')}
              </Link>
            }
          >
            {t('cabinet.emptyBody')}
          </EmptyState>
        ) : null
      }
      current={
        split.current.length > 0
          ? split.current.map((booking) => {
              const hours = bookingHours(booking)
              return (
                <BookingListItem key={booking.bookingNumber}>
                  <BookingRow
                    to={cabinetBookingPath(booking.bookingNumber)}
                    dragonName={booking.dragon.name}
                    bookingNumber={booking.bookingNumber}
                    periodText={
                      <Num>
                        {formatPeriodLabel(
                          booking.startsAt,
                          booking.endsAt,
                          i18n.language,
                        )}
                      </Num>
                    }
                    sumText={t('booking.totalHours', {
                      total: formatMoney(booking.totalAmount, booking.currency),
                      hours,
                    })}
                    badges={bookingStatusBadges(booking, t)}
                    tile={booking.dragon.tileToken ?? undefined}
                    picture={
                      booking.dragon.spriteKey ? (
                        <DragonAvatar name={booking.dragon.spriteKey} alt="" />
                      ) : null
                    }
                  />
                </BookingListItem>
              )
            })
          : null
      }
      past={
        split.past.length > 0
          ? split.past.map((booking) => {
              const hours = bookingHours(booking)
              return (
                <BookingListItem key={booking.bookingNumber}>
                  <BookingRow
                    to={cabinetBookingPath(booking.bookingNumber)}
                    dragonName={booking.dragon.name}
                    bookingNumber={booking.bookingNumber}
                    periodText={
                      <Num>
                        {formatPeriodLabel(
                          booking.startsAt,
                          booking.endsAt,
                          i18n.language,
                        )}
                      </Num>
                    }
                    sumText={t('booking.totalHours', {
                      total: formatMoney(booking.totalAmount, booking.currency),
                      hours,
                    })}
                    badges={bookingStatusBadges(booking, t)}
                    tile={booking.dragon.tileToken ?? undefined}
                    picture={
                      booking.dragon.spriteKey ? (
                        <DragonAvatar name={booking.dragon.spriteKey} alt="" />
                      ) : null
                    }
                  />
                </BookingListItem>
              )
            })
          : null
      }
    />
  )
}

export default CabinetBookingsPage
