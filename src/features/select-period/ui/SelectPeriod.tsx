import type { ReactNode } from 'react'

import { Input } from '@/shared/ui/field'
import fieldStyles from '@/shared/ui/field/Field.module.css'
import { Icon } from '@/shared/ui/icon'
import { Loader } from '@/shared/ui/loader'
import { Typography } from '@/shared/ui/typography'

import styles from './SelectPeriod.module.css'

export interface ISelectPeriodValue {
  startDate: string
  startTime: string
  endDate: string
  endTime: string
}

export type TSelectPeriodAvailability = 'idle' | 'loading' | 'free' | 'busy'

export interface ISelectPeriodProps {
  value: ISelectPeriodValue
  onChange: (value: ISelectPeriodValue) => void
  labels: {
    start: ReactNode
    end: ReactNode
    startDate: string
    startTime: string
    endDate: string
    endTime: string
  }
  availability?: TSelectPeriodAvailability
  availabilityText?: ReactNode
  quoteDetail?: ReactNode
  quoteTotal?: ReactNode
  quoteHint?: ReactNode
  error?: boolean
  errorMessage?: ReactNode
  actions?: ReactNode
  className?: string
}

/** Rental interval picker with availability and quote slots. */
const SelectPeriod = (props: ISelectPeriodProps) => {
  const {
    value,
    onChange,
    labels,
    availability = 'idle',
    availabilityText,
    quoteDetail,
    quoteTotal,
    quoteHint,
    error = false,
    errorMessage,
    actions,
    className,
  } = props

  const patch = (partial: Partial<ISelectPeriodValue>) => {
    onChange({ ...value, ...partial })
  }

  const rootClass = [styles.root, className].filter(Boolean).join(' ')
  const availClass = [
    styles.avail,
    availability === 'free' ? styles.availFree : '',
    availability === 'busy' ? styles.availBusy : '',
  ]
    .filter(Boolean)
    .join(' ')

  const availIcon =
    availability === 'loading' ? (
      <Loader />
    ) : availability === 'free' ? (
      <Icon name="check" />
    ) : null

  return (
    <div className={rootClass}>
      <fieldset className={styles.row}>
        <legend>{labels.start}</legend>
        <Input
          className={styles.control}
          type="date"
          value={value.startDate}
          aria-label={labels.startDate}
          onChange={(event) => patch({ startDate: event.target.value })}
        />
        <Input
          className={styles.control}
          type="time"
          value={value.startTime}
          aria-label={labels.startTime}
          onChange={(event) => patch({ startTime: event.target.value })}
        />
      </fieldset>
      <fieldset className={styles.row}>
        <legend>{labels.end}</legend>
        <Input
          className={styles.control}
          type="date"
          value={value.endDate}
          aria-label={labels.endDate}
          aria-invalid={error || undefined}
          onChange={(event) => patch({ endDate: event.target.value })}
        />
        <Input
          className={styles.control}
          type="time"
          value={value.endTime}
          aria-label={labels.endTime}
          aria-invalid={error || undefined}
          onChange={(event) => patch({ endTime: event.target.value })}
        />
      </fieldset>

      {error && errorMessage ? (
        <p className={fieldStyles.error} role="alert">
          <Icon name="cross" className={fieldStyles.errorIcon} />
          <span>{errorMessage}</span>
        </p>
      ) : null}

      {availability !== 'idle' || availabilityText ? (
        <p className={availClass}>
          {availIcon}
          {availabilityText}
        </p>
      ) : null}

      {quoteDetail || quoteTotal ? (
        <div className={styles.quote}>
          <p className={styles.quoteLine}>
            {quoteDetail ? <span>{quoteDetail}</span> : null}
            {quoteTotal ? (
              <b className={styles.quoteTotal}>{quoteTotal}</b>
            ) : null}
          </p>
          {quoteHint ? (
            <Typography variant="small" className={styles.quoteHint}>
              {quoteHint}
            </Typography>
          ) : null}
        </div>
      ) : null}

      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </div>
  )
}

export default SelectPeriod
