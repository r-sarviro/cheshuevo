import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useId, useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { z } from 'zod'

import { getCustomerMe, useCabinetSessionStore } from '@/entities/customer'
import {
  ApiError,
  useConfirmEmailCodeMutation,
  useRequestEmailCodeMutation,
} from '@/shared/api'
import { CATALOG_PATH } from '@/shared/config'
import {
  emailSchema,
  otpFormSchema,
  type TOtpFormValues,
} from '@/shared/lib'
import { Button, ButtonText } from '@/shared/ui/button'
import buttonStyles from '@/shared/ui/button/Button.module.css'
import { Field, Input } from '@/shared/ui/field'
import fieldStyles from '@/shared/ui/field/Field.module.css'
import { Icon } from '@/shared/ui/icon'
import { Note } from '@/shared/ui/note'
import { OtpInput } from '@/shared/ui/otp-input'
import { Typography } from '@/shared/ui/typography'

import styles from './CabinetLogin.module.css'

const loginEmailSchema = z.object({
  email: emailSchema,
})

type TLoginEmailValues = z.infer<typeof loginEmailSchema>

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

function readAttemptsLeft(error: ApiError): number | null {
  const raw = error.details?.attempts_left
  return typeof raw === 'number' ? raw : null
}

function readResendAfter(error: ApiError): number | null {
  const raw = error.details?.resend_after_seconds
  return typeof raw === 'number' ? raw : null
}

/** Cabinet login: email → OTP (CAB-002), no password. */
const CabinetLogin = (props: ICabinetLoginProps) => {
  const { redirectHint, onSuccess, className } = props
  const { t } = useTranslation()
  const signIn = useCabinetSessionStore((s) => s.signIn)
  const setProfile = useCabinetSessionStore((s) => s.setProfile)
  const requestCode = useRequestEmailCodeMutation()
  const confirmCode = useConfirmEmailCodeMutation()

  const emailId = useId()
  const emailErrId = `${emailId}-err`
  const emailHintId = `${emailId}-hint`
  const otpErrId = useId()

  const [step, setStep] = useState<TStep>('email')
  const [verificationId, setVerificationId] = useState<string | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [exhausted, setExhausted] = useState(false)
  const [note, setNote] = useState<ReactNode>(redirectHint ?? null)

  const emailForm = useForm<TLoginEmailValues>({
    resolver: zodResolver(loginEmailSchema),
    defaultValues: { email: '' },
    mode: 'onSubmit',
    shouldUnregister: false,
  })

  const codeForm = useForm<TOtpFormValues>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: { code: '' },
    mode: 'onSubmit',
    shouldUnregister: false,
  })

  const email = emailForm.watch('email')
  const code = codeForm.watch('code')

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

  const onRequestCode = async (data: TLoginEmailValues) => {
    try {
      const result = await requestCode.mutateAsync({
        email: data.email,
        purpose: 'login',
      })
      emailForm.setValue('email', data.email, { shouldDirty: false })
      setVerificationId(result.verificationId)
      setSecondsLeft(result.resendAfterSeconds)
      codeForm.setValue('code', '', { shouldDirty: false })
      codeForm.clearErrors('code')
      setExhausted(false)
      setNote(null)
      setStep('code')
    } catch (error) {
      if (error instanceof ApiError && error.code === 'NO_BOOKINGS') {
        setNote(
          <Note
            tone="butter"
            icon="warn"
            heading={t('cabinet.loginNoBookingsTitle')}
            alert
            actions={
              <Link
                className={[buttonStyles.btn, buttonStyles.ghost].join(' ')}
                to={CATALOG_PATH}
              >
                {t('cabinet.emptyCta')}
              </Link>
            }
          >
            {t('cabinet.loginNoBookingsBody')}
          </Note>,
        )
        return
      }
      if (error instanceof ApiError) {
        const wait = readResendAfter(error)
        if (
          wait != null &&
          (error.code === 'RESEND_TOO_SOON' || error.code === 'CODE_LOCKED')
        ) {
          setSecondsLeft(wait)
        }
        setNote(
          <Note tone="peach" icon="cross" heading={error.message} alert>
            {error.code === 'CODE_NOT_SENT'
              ? t('booking.sendFailedBody')
              : error.message}
          </Note>,
        )
        return
      }
      setNote(
        <Note
          tone="peach"
          icon="cross"
          heading={t('booking.sendFailedTitle')}
          alert
        >
          {t('booking.sendFailedBody')}
        </Note>,
      )
    }
  }

  const onConfirm = async (data: TOtpFormValues) => {
    if (!verificationId) return
    const sessionEmail = emailForm.getValues('email')
    try {
      const confirmed = await confirmCode.mutateAsync({
        verificationId,
        email: sessionEmail,
        code: data.code,
      })
      if (!confirmed.session) {
        codeForm.setError('code', {
          type: 'server',
          message: t('booking.otpInvalidGeneric'),
        })
        return
      }
      signIn({
        token: confirmed.session.token,
        tokenType: confirmed.session.tokenType,
        expiresAt: confirmed.session.expiresAt,
        email: sessionEmail,
        name: null,
      })
      let name: string | null = null
      try {
        const me = await getCustomerMe()
        name = me.name
        setProfile({ email: me.email, name: me.name })
      } catch {
        setProfile({ email: sessionEmail })
      }
      onSuccess?.({ email: sessionEmail, name })
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.code === 'OTP_EXHAUSTED') {
          setExhausted(true)
          codeForm.clearErrors('code')
          const wait = readResendAfter(error)
          if (wait != null) setSecondsLeft(wait)
          setNote(
            <Note tone="butter" icon="warn" alert>
              {t('booking.otpExhaustedBody')}
            </Note>,
          )
          return
        }
        if (error.code === 'OTP_INVALID') {
          const left = readAttemptsLeft(error)
          codeForm.setError('code', {
            type: 'invalid',
            message:
              left != null
                ? t('booking.otpInvalid', { count: left })
                : t('booking.otpInvalidGeneric'),
          })
          return
        }
      }
      codeForm.setError('code', {
        type: 'server',
        message: t('booking.otpInvalidGeneric'),
      })
    }
  }

  const onResend = async () => {
    if (secondsLeft > 0 || busy) return
    const sessionEmail = emailForm.getValues('email')
    try {
      const result = await requestCode.mutateAsync({
        email: sessionEmail,
        purpose: 'login',
      })
      setVerificationId(result.verificationId)
      setSecondsLeft(result.resendAfterSeconds)
      codeForm.setValue('code', '', { shouldDirty: true, shouldTouch: true })
      codeForm.clearErrors('code')
      setExhausted(false)
      setNote(
        <Note tone="jade" icon="mail">
          {t('cabinet.loginResent', { email: sessionEmail })}
        </Note>,
      )
    } catch (error) {
      if (error instanceof ApiError) {
        const wait = readResendAfter(error)
        if (wait != null) setSecondsLeft(wait)
        setNote(
          <Note tone="butter" icon="warn" alert>
            {error.message}
          </Note>,
        )
        return
      }
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

  const emailError = emailForm.formState.errors.email
  const emailErrorText = emailError?.message
    ? t(emailError.message)
    : undefined

  const codeError = codeForm.formState.errors.code
  const codeErrorText = codeError?.message
    ? codeError.type === 'server' || codeError.type === 'invalid'
      ? codeError.message
      : t(codeError.message)
    : undefined

  if (step === 'email') {
    return (
      <div className={rootClass}>
        <Typography variant="h1" tabIndex={-1}>
          {t('cabinet.bookingsTitle')}
        </Typography>
        <p className={styles.lead}>{t('cabinet.loginLead')}</p>
        <form
          className={styles.form}
          noValidate
          onSubmit={emailForm.handleSubmit(onRequestCode)}
        >
          {note}
          <Field
            label={t('cabinet.emailLabel')}
            htmlFor={emailId}
            hint={t('booking.emailHint')}
            hintId={emailHintId}
            error={emailErrorText}
            errorId={emailErrId}
          >
            <Input
              id={emailId}
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              disabled={busy}
              aria-invalid={emailErrorText ? true : undefined}
              aria-describedby={
                [emailHintId, emailErrorText ? emailErrId : null]
                  .filter(Boolean)
                  .join(' ') || undefined
              }
              onChange={(event) => {
                emailForm.setValue('email', event.target.value, {
                  shouldDirty: true,
                  shouldTouch: true,
                })
                emailForm.clearErrors('email')
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
            codeForm.setValue('code', '')
            codeForm.clearErrors('code')
            setExhausted(false)
            setNote(null)
          }}
        >
          {t('booking.changeEmail')}
        </ButtonText>
      </p>
      <form
        className={styles.form}
        noValidate
        onSubmit={codeForm.handleSubmit(onConfirm)}
      >
        {note}
        <OtpInput
          value={code}
          onChange={(next) => {
            codeForm.setValue('code', next, {
              shouldDirty: true,
              shouldTouch: true,
            })
            codeForm.clearErrors('code')
          }}
          invalid={Boolean(codeErrorText)}
          disabled={busy || exhausted}
          aria-label={t('booking.otpLabel')}
          aria-describedby={codeErrorText ? otpErrId : undefined}
          digitLabel={(index) => t('booking.otpDigit', { n: index })}
        />
        {codeErrorText ? (
          <p className={fieldStyles.error} role="alert" id={otpErrId}>
            <Icon name="cross" className={fieldStyles.errorIcon} />
            <span>{codeErrorText}</span>
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
