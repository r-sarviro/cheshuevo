import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  BookingContacts,
  bookingContactsSchema,
  type TBookingContactsValue,
} from '@/features/booking-contacts'
import { useRequestEmailCodeMutation } from '@/features/verify-email'
import { Button, ButtonText } from '@/shared/ui/button'
import { Note } from '@/shared/ui/note'
import { Typography } from '@/shared/ui/typography'

import { useBookingDraftStore } from '../model/bookingDraftStore'

import styles from './BookingWizard.module.css'

/** Contacts step: name + email, then request OTP. */
const ContactsStep = () => {
  const { t } = useTranslation()
  const contacts = useBookingDraftStore((s) => s.contacts)
  const setContacts = useBookingDraftStore((s) => s.setContacts)
  const setVerification = useBookingDraftStore((s) => s.setVerification)
  const setStep = useBookingDraftStore((s) => s.setStep)
  const requestCode = useRequestEmailCodeMutation()

  const { watch, setValue, setError, clearErrors, formState, handleSubmit } =
    useForm<TBookingContactsValue>({
      resolver: zodResolver(bookingContactsSchema),
      defaultValues: contacts ?? { name: '', email: '' },
      mode: 'onSubmit',
      shouldUnregister: false,
    })

  const value = watch()

  const onValid = async (data: TBookingContactsValue) => {
    try {
      const result = await requestCode.mutateAsync({
        email: data.email,
        purpose: 'booking',
      })
      setContacts(data)
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
          name: formState.errors.name?.message
            ? t(formState.errors.name.message)
            : undefined,
          email: formState.errors.email
            ? formState.errors.email.type === 'server'
              ? formState.errors.email.message
              : t(formState.errors.email.message ?? 'ds.emailError')
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
        onSubmit={handleSubmit(onValid)}
      />
    </div>
  )
}

export default ContactsStep
