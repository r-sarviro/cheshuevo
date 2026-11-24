import type { FormEvent, ReactNode } from 'react'

import { Field, Input } from '@/shared/ui/field'

import styles from './BookingContacts.module.css'

export interface IBookingContactsValue {
  name: string
  email: string
}

export interface IBookingContactsProps {
  value: IBookingContactsValue
  onChange: (value: IBookingContactsValue) => void
  labels: {
    name: ReactNode
    email: ReactNode
  }
  hints?: {
    name?: ReactNode
    email?: ReactNode
  }
  errors?: {
    name?: ReactNode
    email?: ReactNode
  }
  nameId?: string
  emailId?: string
  nameHintId?: string
  emailHintId?: string
  nameErrorId?: string
  emailErrorId?: string
  alert?: ReactNode
  actions?: ReactNode
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void
  className?: string
}

/** Guest checkout fields: name + email before OTP. */
const BookingContacts = (props: IBookingContactsProps) => {
  const {
    value,
    onChange,
    labels,
    hints,
    errors,
    nameId = 'booking-name',
    emailId = 'booking-email',
    nameHintId = 'booking-name-hint',
    emailHintId = 'booking-email-hint',
    nameErrorId = 'booking-name-error',
    emailErrorId = 'booking-email-error',
    alert,
    actions,
    onSubmit,
    className,
  } = props

  const patch = (partial: Partial<IBookingContactsValue>) => {
    onChange({ ...value, ...partial })
  }

  const nameDescribedBy = errors?.name
    ? nameErrorId
    : hints?.name
      ? nameHintId
      : undefined
  const emailDescribedBy = errors?.email
    ? emailErrorId
    : hints?.email
      ? emailHintId
      : undefined

  return (
    <form
      className={[styles.stack, className].filter(Boolean).join(' ')}
      onSubmit={onSubmit}
      noValidate
    >
      {alert}
      <Field
        label={labels.name}
        hint={hints?.name}
        error={errors?.name}
        htmlFor={nameId}
        hintId={nameHintId}
        errorId={nameErrorId}
      >
        <Input
          id={nameId}
          name="name"
          autoComplete="name"
          value={value.name}
          aria-invalid={Boolean(errors?.name) || undefined}
          aria-describedby={nameDescribedBy}
          onChange={(event) => patch({ name: event.target.value })}
        />
      </Field>
      <Field
        label={labels.email}
        hint={hints?.email}
        error={errors?.email}
        htmlFor={emailId}
        hintId={emailHintId}
        errorId={emailErrorId}
      >
        <Input
          id={emailId}
          name="email"
          type="email"
          autoComplete="email"
          value={value.email}
          aria-invalid={Boolean(errors?.email) || undefined}
          aria-describedby={emailDescribedBy}
          onChange={(event) => patch({ email: event.target.value })}
        />
      </Field>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </form>
  )
}

export default BookingContacts
