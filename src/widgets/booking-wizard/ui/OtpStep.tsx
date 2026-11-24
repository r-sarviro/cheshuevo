import { useEffect, useState, type FormEvent } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  periodToInterval,
  useCreateBookingMutation,
} from '@/entities/booking'
import { getDragonCopy, type IDragon } from '@/entities/dragon'
import {
  useConfirmEmailCodeMutation,
  useRequestEmailCodeMutation,
  VerifyEmail,
} from '@/features/verify-email'
import { ApiError } from '@/shared/api'
import { ButtonText } from '@/shared/ui/button'
import { Note } from '@/shared/ui/note'
import { Typography } from '@/shared/ui/typography'

import { useBookingDraftStore } from '../model/bookingDraftStore'

import styles from './BookingWizard.module.css'

export interface IOtpStepProps {
  dragon: IDragon
}

type TOtpForm = { code: string }

/** OTP confirm + create booking. */
const OtpStep = (props: IOtpStepProps) => {
  const { dragon } = props
  const { t } = useTranslation()
  const copy = getDragonCopy(t, dragon)
  const contacts = useBookingDraftStore((s) => s.contacts)
  const period = useBookingDraftStore((s) => s.period)
  const verificationId = useBookingDraftStore((s) => s.verificationId)
  const resendAfterSeconds = useBookingDraftStore((s) => s.resendAfterSeconds)
  const otpExhausted = useBookingDraftStore((s) => s.otpExhausted)
  const setVerification = useBookingDraftStore((s) => s.setVerification)
  const setVerificationToken = useBookingDraftStore(
    (s) => s.setVerificationToken,
  )
  const setOtpFeedback = useBookingDraftStore((s) => s.setOtpFeedback)
  const setCreatedBooking = useBookingDraftStore((s) => s.setCreatedBooking)
  const setConflict = useBookingDraftStore((s) => s.setConflict)
  const setStep = useBookingDraftStore((s) => s.setStep)

  const confirmCode = useConfirmEmailCodeMutation()
  const requestCode = useRequestEmailCodeMutation()
  const createBooking = useCreateBookingMutation()

  const [secondsLeft, setSecondsLeft] = useState(resendAfterSeconds)

  useEffect(() => {
    setSecondsLeft(resendAfterSeconds)
  }, [resendAfterSeconds, verificationId])

  useEffect(() => {
    if (secondsLeft <= 0) return
    const id = window.setInterval(() => {
      setSecondsLeft((value) => Math.max(0, value - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [secondsLeft, verificationId])

  const { register, watch, setValue, getValues, setError, clearErrors, formState } =
    useForm<TOtpForm>({
      defaultValues: { code: '' },
      mode: 'onSubmit',
      shouldUnregister: false,
    })

  useEffect(() => {
    register('code')
  }, [register])

  const code = watch('code')

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!contacts || !period || !verificationId) return
    const data = getValues()
    if (!/^\d{6}$/.test(data.code)) {
      setError('code', {
        type: 'pattern',
        message: t('booking.otpInvalidGeneric'),
      })
      return
    }

    try {
      const confirmed = await confirmCode.mutateAsync({
        verificationId,
        email: contacts.email,
        code: data.code,
      })
      setVerificationToken(confirmed.verificationToken)
      setOtpFeedback({ attemptsLeft: null, exhausted: false })

      const interval = periodToInterval(period)
      const booking = await createBooking.mutateAsync({
        dragonId: dragon.id,
        startsAt: interval.startsAt,
        endsAt: interval.endsAt,
        customerName: contacts.name,
        customerEmail: contacts.email,
        verificationToken: confirmed.verificationToken,
        hourlyRate: dragon.hourlyRate,
        currency: dragon.currency,
        dragonName: copy.name,
      })
      setCreatedBooking(booking)
    } catch (error) {
      if (error instanceof ApiError && error.code === 'BOOKING_CONFLICT') {
        setConflict(t('booking.conflictBody', { name: copy.name }))
        return
      }
      if (error instanceof ApiError && error.code === 'OTP_EXHAUSTED') {
        setOtpFeedback({ attemptsLeft: 0, exhausted: true })
        setError('code', {
          type: 'exhausted',
          message: t('booking.otpExhaustedBody'),
        })
        return
      }
      if (error instanceof ApiError && error.code === 'OTP_INVALID') {
        const match = /Attempts left: (\d+)/.exec(error.message)
        const left = match ? Number(match[1]) : null
        setOtpFeedback({ attemptsLeft: left, exhausted: false })
        setError('code', {
          type: 'invalid',
          message:
            left != null
              ? t('booking.otpInvalid', { count: left })
              : t('booking.otpInvalidGeneric'),
        })
        return
      }
      setError('code', {
        type: 'server',
        message: t('booking.otpInvalidGeneric'),
      })
    }
  }

  const onResend = async () => {
    if (!contacts || secondsLeft > 0) return
    try {
      const result = await requestCode.mutateAsync({ email: contacts.email })
      setVerification({
        verificationId: result.verificationId,
        resendAfterSeconds: result.resendAfterSeconds,
      })
      setValue('code', '', { shouldDirty: true, shouldTouch: true })
      clearErrors('code')
      setOtpFeedback({ attemptsLeft: null, exhausted: false })
    } catch {
      setError('code', {
        type: 'server',
        message: t('booking.sendFailedBody'),
      })
    }
  }

  if (!contacts) return null

  return (
    <div className={styles.stack}>
      <Typography className={styles.heading} variant="h2">
        {t('booking.otpHeading')}
      </Typography>
      <p className={styles.lead}>
        {t('booking.otpSentTo', { email: contacts.email })}{' '}
        <ButtonText type="button" onClick={() => setStep('contacts')}>
          {t('booking.changeEmail')}
        </ButtonText>
      </p>
      {otpExhausted ? (
        <Note
          tone="butter"
          icon="cross"
          heading={t('booking.otpExhaustedTitle')}
          alert
          actions={
            <ButtonText type="button" onClick={() => setStep('contacts')}>
              {t('booking.changeEmail')}
            </ButtonText>
          }
        >
          {t('booking.otpExhaustedBody')}
        </Note>
      ) : null}
      <VerifyEmail
        code={code}
        onCodeChange={(next) => {
          setValue('code', next, { shouldDirty: true, shouldTouch: true })
          clearErrors('code')
        }}
        codeLabel={t('booking.otpLabel')}
        digitLabel={(index) => t('booking.otpDigit', { n: index })}
        error={
          formState.errors.code
            ? formState.errors.code.message || t('booking.otpInvalidGeneric')
            : undefined
        }
        disabled={otpExhausted}
        resendLabel={t('booking.otpResend')}
        resendWaitingLabel={t('booking.otpResendWait')}
        resendSecondsLeft={secondsLeft}
        resendDisabled={
          secondsLeft > 0 || requestCode.isPending || otpExhausted
        }
        onResend={() => {
          void onResend()
        }}
        submitLabel={t('booking.otpSubmit')}
        submitDisabled={
          code.length !== 6 ||
          otpExhausted ||
          confirmCode.isPending ||
          createBooking.isPending
        }
        onSubmit={onSubmit}
      />
    </div>
  )
}

export default OtpStep
