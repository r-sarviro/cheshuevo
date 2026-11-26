import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { Icon } from '@/shared/ui/icon'
import { Skeleton } from '@/shared/ui/skeleton'

import styles from './BookingList.module.css'

export interface IBookingRowProps {
  to: string
  dragonName: ReactNode
  bookingNumber: ReactNode
  periodText: ReactNode
  sumText: ReactNode
  badges: ReactNode
  tile?: string
  picture?: ReactNode
  className?: string
}

/** Single booking list row (kb-row). No flight/review hints in this slice. */
const BookingRow = (props: IBookingRowProps) => {
  const {
    to,
    dragonName,
    bookingNumber,
    periodText,
    sumText,
    badges,
    tile,
    picture,
    className,
  } = props

  const rootClass = [styles.row, className].filter(Boolean).join(' ')
  const picStyle = tile ? ({ ['--tile']: tile } as CSSProperties) : undefined

  return (
    <Link className={rootClass} to={to}>
      <span className={styles.rowPic} style={picStyle}>
        {picture}
      </span>
      <span className={styles.rowMain}>
        <span className={styles.rowName}>{dragonName}</span>
        <span className={styles.rowNo}>{bookingNumber}</span>
        <span className={styles.rowWhen}>{periodText}</span>
        <span className={styles.rowSum}>{sumText}</span>
      </span>
      <span className={styles.rowBadges}>{badges}</span>
      <span className={styles.rowGo} aria-hidden="true">
        <Icon name="right" />
      </span>
    </Link>
  )
}

export interface IBookingRowGhostProps {
  className?: string
}

/** Loading placeholder for a booking row. */
const BookingRowGhost = (props: IBookingRowGhostProps) => {
  const { className } = props
  const rootClass = [styles.row, styles.rowGhost, className]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={rootClass} aria-hidden="true">
      <Skeleton className={styles.rowPic} />
      <span className={styles.rowMain}>
        <Skeleton
          className={styles.skel}
          style={{ width: '55%', height: 22 }}
        />
        <Skeleton className={styles.skel} style={{ width: '35%' }} />
        <Skeleton className={styles.skel} style={{ width: '70%' }} />
      </span>
      <span className={styles.rowBadges}>
        <Skeleton className={styles.skel} style={{ width: 120, height: 26 }} />
      </span>
    </div>
  )
}

export { BookingRowGhost }
export default BookingRow
