import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { Typography } from '@/shared/ui/typography'

import { BookingRowGhost } from './BookingRow'
import styles from './BookingList.module.css'

export interface IBookingListProps {
  bookMore?: ReactNode
  flash?: ReactNode
  loading?: boolean
  empty?: ReactNode
  error?: ReactNode
  current?: ReactNode
  past?: ReactNode
  currentTitle?: ReactNode
  pastTitle?: ReactNode
  title?: ReactNode
  className?: string
}

/** Bookings list shell: headrow, sections, loading ghosts, empty/error slots. */
const BookingList = (props: IBookingListProps) => {
  const {
    bookMore,
    flash,
    loading = false,
    empty,
    error,
    current,
    past,
    currentTitle,
    pastTitle,
    title,
    className,
  } = props
  const { t } = useTranslation()
  const rootClass = [styles.root, className].filter(Boolean).join(' ')

  return (
    <div className={rootClass}>
      <div className={styles.headrow}>
        <Typography variant="h1" tabIndex={-1}>
          {title ?? t('cabinet.bookingsTitle')}
        </Typography>
        {bookMore}
      </div>

      {flash}

      {loading ? (
        <ul
          className={styles.list}
          aria-busy="true"
          aria-label={t('cabinet.loading')}
        >
          <li>
            <BookingRowGhost />
          </li>
          <li>
            <BookingRowGhost />
          </li>
          <li>
            <BookingRowGhost />
          </li>
        </ul>
      ) : null}

      {!loading && error ? error : null}

      {!loading && !error && empty ? empty : null}

      {!loading && !error && !empty && current ? (
        <>
          <Typography variant="h3" className={styles.secTitle}>
            {currentTitle ?? t('cabinet.sectionCurrent')}
          </Typography>
          <ul className={styles.list}>{current}</ul>
        </>
      ) : null}

      {!loading && !error && !empty && past ? (
        <>
          <Typography variant="h3" className={styles.secTitle}>
            {pastTitle ?? t('cabinet.sectionPast')}
          </Typography>
          <ul className={styles.list}>{past}</ul>
        </>
      ) : null}
    </div>
  )
}

export interface IBookingListItemProps {
  children: ReactNode
  className?: string
}

/** `<li>` wrapper for BookingRow / ghosts inside BookingList. */
const BookingListItem = (props: IBookingListItemProps) => {
  const { children, className } = props
  return <li className={className}>{children}</li>
}

export { BookingListItem }
export default BookingList
