import type { FormEvent, ReactNode } from 'react'

import { Button, ButtonText } from '@/shared/ui/button'
import fieldStyles from '@/shared/ui/field/Field.module.css'
import { Icon } from '@/shared/ui/icon'
import { OtpInput } from '@/shared/ui/otp-input'

import styles from './VerifyEmail.module.css'

export interface IVerifyEmailProps {
  code: string
  onCodeChange: (code: string) => void
  codeLabel: string
  digitLabel?: (index: number) => string
  error?: ReactNode
  errorId?: string
  lead?: ReactNode
  disabled?: boolean
  resendLabel?: ReactNode
  resendWaitingLabel?: ReactNode
  resendDisabled?: boolean
  resendSecondsLeft?: number
  onResend?: () => void
  submitLabel?: ReactNode
  submitDisabled?: boolean
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void
  actions?: ReactNode
  className?: string
}

/** OTP step: code cells, optional resend timer, submit slot. */
const VerifyEmail = (props: IVerifyEmailProps) => {
  const {
    code,
    onCodeChange,
    codeLabel,
    digitLabel,
    error,
    errorId = 'verify-email-error',
    lead,
    disabled = false,
    resendLabel,
    resendWaitingLabel,
    resendDisabled = false,
    resendSecondsLeft,
    onResend,
    submitLabel,
    submitDisabled = false,
    onSubmit,
    actions,
    className,
  } = props

  const timerText =
    typeof resendSecondsLeft === 'number' && resendSecondsLeft > 0
      ? `${Math.floor(resendSecondsLeft / 60)}:${String(resendSecondsLeft % 60).padStart(2, '0')}`
      : null

  return (
    <form
      className={[styles.stack, className].filter(Boolean).join(' ')}
      onSubmit={onSubmit}
      noValidate
    >
      {lead}
      <OtpInput
        value={code}
        onChange={onCodeChange}
        invalid={Boolean(error)}
        disabled={disabled}
        aria-label={codeLabel}
        aria-describedby={error ? errorId : undefined}
        digitLabel={digitLabel}
      />
      {error ? (
        <p className={fieldStyles.error} role="alert" id={errorId}>
          <Icon name="cross" className={fieldStyles.errorIcon} />
          <span>{error}</span>
        </p>
      ) : null}
      <div className={styles.actions}>
        {submitLabel ? (
          <Button
            type="submit"
            disabled={submitDisabled || disabled || code.length < 6}
          >
            {submitLabel}
          </Button>
        ) : null}
        {onResend ? (
          <ButtonText
            type="button"
            disabled={resendDisabled || disabled || Boolean(timerText)}
            onClick={onResend}
          >
            {timerText ? (
              <>
                {resendWaitingLabel}{' '}
                <span className={styles.timer}>{timerText}</span>
              </>
            ) : (
              resendLabel
            )}
          </ButtonText>
        ) : null}
        {actions}
      </div>
    </form>
  )
}

export default VerifyEmail
