import { useEffect, useId, useState, type FormEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { useCabinetSessionStore } from '@/entities/customer'
import {
  ApiError,
  useConfirmEmailCodeMutation,
  useRequestEmailCodeMutation,
} from '@/shared/api'
import { Button, ButtonText } from '@/shared/ui/button'
import { Field, Input } from '@/shared/ui/field'
import fieldStyles from '@/shared/ui/field/Field.module.css'
import { Icon } from '@/shared/ui/icon'
import { Note } from '@/shared/ui/note'
import { OtpInput } from '@/shared/ui/otp-input'
import { Typography } from '@/shared/ui/typography'

import styles from './CabinetLogin.module.css'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface ICabinetLoginSession {
  email: string
  name: string | null
}

export interface ICabinetLoginProps {
  redirectHint?: ReactNode
  onSuccess?: (session: ICabinetLoginSession) => void
  className?: string
}

type TStep = 'email' | 'code'

/** Cabinet login: email → OTP (CAB-002), no password. */
const CabinetLogin = (props: ICabinetLoginProps) => {
  const { redirectHint, onSuccess, className } = props
  const { t } = useTranslation()
  const signIn = useCabinetSessionStore((s) => s.signIn)
  const requestCode = useRequestEmailCodeMutation()
  const confirmCode = useConfirmEmailCodeMutation()

  const emailId = useId()
  const emailErrId = `${emailId}-err`
  const emailHintId = `${emailId}-hint`
  const otpErrId = useId()

  const [step, setStep] = useState<TStep>('email')
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState<string | null>(null)
  const [verificationId, setVerificationId] = useState<string | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [exhausted, setExhausted] = useState(false)
  const [note, setNote] = useState<ReactNode>(redirectHint ?? null)

  useEffect(() => {
    if (redirectHint) setNote(redirectHint)
  }, [redirectHint])

  useEffect(() => {
    if (secondsLeft <= 0) return
    const id = window.setInterval(() => {
      setSecondsLeft((value) => Math.max(0, value - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [secondsLeft, verificationId])

  const busy = requestCode.isPending || confirmCode.isPending

  const onRequestCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextEmail = email.trim().toLowerCase()
    if (!EMAIL_RE.test(nextEmail)) {
      setEmailError(t('ds.emailError'))
      return
    }
    setEmailError(null)
    try {
      const result = await requestCode.mutateAsync({ email: nextEmail })
      setEmail(nextEmail)
      setVerificationId(result.verificationId)
      setSecondsLeft(result.resendAfterSeconds)
      setCode('')
      setCodeError(null)
      setExhausted(false)
      setNote(null)
      setStep('code')
    } catch {
      setNote(
        <Note tone="peach" icon="cross" heading={t('booking.sendFailedTitle')} alert>
          {t('booking.sendFailedBody')}
        </Note>,
      )
    }
  }

  const onConfirm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!verificationId) return
    if (!/^\d{6}$/.test(code)) {
      setCodeError(t('booking.otpInvalidGeneric'))
      return
    }
    setCodeError(null)
    try {
      await confirmCode.mutateAsync({
        verificationId,
        email,
        code,
      })
      signIn({ email })
      const session = { email, name: null as string | null }
      onSuccess?.(session)
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.code === 'OTP_EXHAUSTED') {
          setExhausted(true)
          setCodeError(null)
          setNote(
            <Note tone="butter" icon="warn" alert>
              {t('booking.otpExhaustedBody')}
            </Note>,
          )
          return
        }
        if (error.code === 'OTP_INVALID') {
          const match = /Attempts left: (\d+)/.exec(error.message)
          const left = match ? Number(match[1]) : null
          setCodeError(
            left != null
              ? t('booking.otpInvalid', { count: left })
              : t('booking.otpInvalidGeneric'),
          )
          return
        }
      }
      setCodeError(t('booking.otpInvalidGeneric'))
    }
  }

  const onResend = async () => {
    if (secondsLeft > 0 || busy) return
    try {
      const result = await requestCode.mutateAsync({ email })
      setVerificationId(result.verificationId)
      setSecondsLeft(result.resendAfterSeconds)
      setCode('')
      setCodeError(null)
      setExhausted(false)
      setNote(
        <Note tone="jade" icon="mail">
          {t('cabinet.loginResent', { email })}
        </Note>,
      )
    } catch {
      setNote(
        <Note tone="butter" icon="warn" alert>
          {t('booking.sendFailedBody')}
        </Note>,
      )
    }
  }

  const rootClass = [styles.root, className].filter(Boolean).join(' ')
  const timerText =
    secondsLeft > 0
      ? `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`
      : null

  if (step === 'email') {
    return (
      <div className={rootClass}>
        <Typography variant="h1" tabIndex={-1}>
          {t('cabinet.bookingsTitle')}
        </Typography>
        <p className={styles.lead}>{t('cabinet.loginLead')}</p>
        <form className={styles.form} noValidate onSubmit={(e) => void onRequestCode(e)}>
          {note}
          <Field
            label={t('cabinet.emailLabel')}
            htmlFor={emailId}
            hint={t('booking.emailHint')}
            hintId={emailHintId}
            error={emailError}
            errorId={emailErrId}
          >
            <Input
              id={emailId}
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              disabled={busy}
              aria-invalid={emailError ? true : undefined}
              aria-describedby={
                [emailHintId, emailError ? emailErrId : null]
                  .filter(Boolean)
                  .join(' ') || undefined
              }
              onChange={(event) => {
                setEmail(event.target.value)
                setEmailError(null)
              }}
            />
          </Field>
          <div className={styles.actions}>
            <Button type="submit" loading={busy} disabled={busy}>
              {t('cabinet.loginGetCode')}
            </Button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className={rootClass}>
      <Typography variant="h1" tabIndex={-1}>
        {t('booking.otpHeading')}
      </Typography>
      <p className={styles.lead}>
        {t('booking.otpSentTo', { email })}{' '}
        <ButtonText
          type="button"
          className={styles.inlineChange}
          onClick={() => {
            setStep('email')
            setCode('')
            setCodeError(null)
            setExhausted(false)
            setNote(null)
          }}
        >
          {t('booking.changeEmail')}
        </ButtonText>
      </p>
      <form className={styles.form} noValidate onSubmit={(e) => void onConfirm(e)}>
        {note}
        <OtpInput
          value={code}
          onChange={(next) => {
            setCode(next)
            setCodeError(null)
          }}
          invalid={Boolean(codeError)}
          disabled={busy || exhausted}
          aria-label={t('booking.otpLabel')}
          aria-describedby={codeError ? otpErrId : undefined}
          digitLabel={(index) => t('booking.otpDigit', { n: index + 1 })}
        />
        {codeError ? (
          <p className={fieldStyles.error} role="alert" id={otpErrId}>
            <Icon name="cross" className={fieldStyles.errorIcon} />
            <span>{codeError}</span>
          </p>
        ) : null}
        <div className={styles.actions}>
          <Button
            type="submit"
            loading={busy}
            disabled={busy || exhausted || code.length < 6}
          >
            {t('cabinet.loginSubmit')}
          </Button>
          <ButtonText
            type="button"
            disabled={busy || Boolean(timerText)}
            onClick={() => {
              void onResend()
            }}
          >
            {timerText ? (
              <>
                {t('booking.otpResendWait')}{' '}
                <span className={styles.timer}>{timerText}</span>
              </>
            ) : (
              t('booking.otpResend')
            )}
          </ButtonText>
        </div>
      </form>
    </div>
  )
}

export default CabinetLogin
