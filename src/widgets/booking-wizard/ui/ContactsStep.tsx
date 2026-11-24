import { useEffect, type FormEvent } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  BookingContacts,
  type IBookingContactsValue,
} from '@/features/booking-contacts'
import { useRequestEmailCodeMutation } from '@/features/verify-email'
import { Button, ButtonText } from '@/shared/ui/button'
import { Note } from '@/shared/ui/note'
import { Typography } from '@/shared/ui/typography'

import { useBookingDraftStore } from '../model/bookingDraftStore'

import styles from './BookingWizard.module.css'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Contacts step: name + email, then request OTP. */
const ContactsStep = () => {
  const { t } = useTranslation()
  const contacts = useBookingDraftStore((s) => s.contacts)
  const setContacts = useBookingDraftStore((s) => s.setContacts)
  const setVerification = useBookingDraftStore((s) => s.setVerification)
  const setStep = useBookingDraftStore((s) => s.setStep)
  const requestCode = useRequestEmailCodeMutation()

  const {
    register,
    watch,
    setValue,
    getValues,
    setError,
    clearErrors,
    formState,
  } = useForm<IBookingContactsValue>({
    defaultValues: contacts ?? { name: '', email: '' },
    mode: 'onSubmit',
    shouldUnregister: false,
  })

  useEffect(() => {
    register('name')
    register('email')
  }, [register])

  const value = watch()

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = getValues()
    const name = data.name.trim()
    const email = data.email.trim()
    if (!name) {
      setError('name', { type: 'required' })
      return
    }
    if (!EMAIL_RE.test(email)) {
      setError('email', { type: 'pattern' })
      return
    }

    try {
      const result = await requestCode.mutateAsync({ email })
      setContacts({ name, email })
      setVerification({
        verificationId: result.verificationId,
        resendAfterSeconds: result.resendAfterSeconds,
      })
      setStep('otp')
    } catch {
      setError('email', {
        type: 'server',
        message: t('booking.sendFailedBody'),
      })
    }
  }

  return (
    <div className={styles.stack}>
      <Typography className={styles.heading} variant="h2">
        {t('booking.contactsHeading')}
      </Typography>
      <BookingContacts
        value={value}
        onChange={(next) => {
          setValue('name', next.name, { shouldDirty: true, shouldTouch: true })
          setValue('email', next.email, {
            shouldDirty: true,
            shouldTouch: true,
          })
          clearErrors()
        }}
        labels={{
          name: t('ds.nameLabel'),
          email: t('ds.emailLabel'),
        }}
        hints={{ email: t('booking.emailHint') }}
        errors={{
          name: formState.errors.name ? t('booking.nameRequired') : undefined,
          email: formState.errors.email
            ? formState.errors.email.type === 'server'
              ? formState.errors.email.message
              : t('ds.emailError')
            : undefined,
        }}
        alert={
          requestCode.isError ? (
            <Note
              tone="peach"
              icon="cross"
              heading={t('booking.sendFailedTitle')}
              alert
            >
              {t('booking.sendFailedBody')}
            </Note>
          ) : null
        }
        actions={
          <>
            <Button type="submit" loading={requestCode.isPending}>
              {t('booking.sendCode')}
            </Button>
            <ButtonText type="button" onClick={() => setStep('period')}>
              {t('booking.back')}
            </ButtonText>
          </>
        }
        onSubmit={onSubmit}
      />
    </div>
  )
}

export default ContactsStep
