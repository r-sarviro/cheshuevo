import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  isMinDurationOk,
  periodToInterval,
  useAvailabilityQuery,
  useCreateCustomerBookingMutation,
} from '@/entities/booking'
import { useCabinetSessionStore } from '@/entities/customer'
import { resolveDragonLocale, type IDragon } from '@/entities/dragon'
import {
  SelectPeriod,
  selectPeriodSchema,
  type TSelectPeriodValue,
} from '@/features/select-period'
import { ApiError } from '@/shared/api'
import { useUiStore } from '@/shared/model'
import { Button } from '@/shared/ui/button'
import { Typography } from '@/shared/ui/typography'

import { formatMoney, formatQuoteDetail } from '../lib/formatters'
import { useBookingDraftStore } from '../model/bookingDraftStore'

import styles from './BookingWizard.module.css'

export interface IPeriodStepProps {
  dragon: IDragon
}

/** Period + availability step with RHF + Zod validation. */
const PeriodStep = (props: IPeriodStepProps) => {
  const { dragon } = props
  const { t } = useTranslation()
  const locale = useUiStore((s) => s.locale)
  const copy = resolveDragonLocale(dragon, locale)
  const period = useBookingDraftStore((s) => s.period)
  const setPeriod = useBookingDraftStore((s) => s.setPeriod)
  const setContacts = useBookingDraftStore((s) => s.setContacts)
  const setCreatedBooking = useBookingDraftStore((s) => s.setCreatedBooking)
  const setConflict = useBookingDraftStore((s) => s.setConflict)
  const setStep = useBookingDraftStore((s) => s.setStep)
  const sessionEmail = useCabinetSessionStore((s) => s.email)
  const sessionName = useCabinetSessionStore((s) => s.name)
  const isAuthenticated = useCabinetSessionStore((s) => s.isAuthenticated)
  const createCustomerBooking = useCreateCustomerBookingMutation()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const authed = isAuthenticated()

  const { watch, setValue, formState, setError, clearErrors, handleSubmit } =
    useForm<TSelectPeriodValue>({
      resolver: zodResolver(selectPeriodSchema),
      defaultValues: period ?? {
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
      },
      mode: 'onSubmit',
      shouldUnregister: false,
    })

  const value = watch()
  const interval =
    value.startDate && value.startTime && value.endDate && value.endTime
      ? periodToInterval(value)
      : null

  const rangeOk = interval
    ? isMinDurationOk(interval.startsAt, interval.endsAt)
    : false

  const availabilityQuery = useAvailabilityQuery(
    interval && rangeOk
      ? {
          dragonId: dragon.id,
          startsAt: interval.startsAt,
          endsAt: interval.endsAt,
        }
      : null,
    Boolean(interval && rangeOk),
  )

  useEffect(() => {
    if (!period) return
    setValue('startDate', period.startDate, { shouldDirty: false })
    setValue('startTime', period.startTime, { shouldDirty: false })
    setValue('endDate', period.endDate, { shouldDirty: false })
    setValue('endTime', period.endTime, { shouldDirty: false })
  }, [period, setValue])

  const onValid = async (data: TSelectPeriodValue) => {
    const next = periodToInterval(data)
    if (!availabilityQuery.data?.available) {
      setError('endTime', { type: 'busy' })
      return
    }
    clearErrors()
    setSubmitError(null)
    setPeriod(data)

    if (authed) {
      setContacts({
        name: sessionName?.trim() || sessionEmail || '',
        email: sessionEmail || '',
      })
      try {
        const booking = await createCustomerBooking.mutateAsync({
          dragonId: dragon.id,
          startsAt: next.startsAt,
          endsAt: next.endsAt,
        })
        setCreatedBooking(booking)
      } catch (error) {
        if (error instanceof ApiError && error.code === 'BOOKING_CONFLICT') {
          setConflict(t('booking.conflictBody', { name: copy.name }))
          return
        }
        setSubmitError(t('booking.sessionCreateFailed'))
      }
      return
    }

    setStep('contacts')
  }

  const availability = !rangeOk
    ? 'idle'
    : availabilityQuery.isFetching
      ? 'loading'
      : availabilityQuery.data?.available
        ? 'free'
        : availabilityQuery.data
          ? 'busy'
          : 'idle'

  const hours = availabilityQuery.data?.billableHours
  const total = availabilityQuery.data?.totalAmount
  const busy = createCustomerBooking.isPending

  return (
    <form className={styles.stack} onSubmit={handleSubmit(onValid)} noValidate>
      <Typography className={styles.heading} variant="h2">
        {t('booking.whenFly')}
      </Typography>
      <SelectPeriod
        value={value}
        onChange={(next) => {
          setValue('startDate', next.startDate, {
            shouldDirty: true,
            shouldTouch: true,
          })
          setValue('startTime', next.startTime, {
            shouldDirty: true,
            shouldTouch: true,
          })
          setValue('endDate', next.endDate, {
            shouldDirty: true,
            shouldTouch: true,
          })
          setValue('endTime', next.endTime, {
            shouldDirty: true,
            shouldTouch: true,
          })
          clearErrors()
          setSubmitError(null)
        }}
        labels={{
          start: t('booking.periodStart'),
          end: t('booking.periodEnd'),
          startDate: t('booking.periodStartDate'),
          startTime: t('booking.periodStartTime'),
          endDate: t('booking.periodEndDate'),
          endTime: t('booking.periodEndTime'),
        }}
        availability={availability}
        availabilityText={
          availability === 'loading'
            ? t('booking.periodChecking')
            : availability === 'free'
              ? t('booking.periodFree', { name: copy.name })
              : availability === 'busy'
                ? t('booking.periodBusy', { name: copy.name })
                : undefined
        }
        quoteDetail={
          hours != null
            ? formatQuoteDetail(hours, dragon.hourlyRate, dragon.currency)
            : undefined
        }
        quoteTotal={
          total != null ? formatMoney(total, dragon.currency) : undefined
        }
        quoteHint={t('booking.periodHint')}
        error={Boolean(formState.errors.endTime) || Boolean(submitError)}
        errorMessage={
          submitError
            ? submitError
            : formState.errors.endTime?.type === 'busy'
              ? t('booking.periodBusy', { name: copy.name })
              : formState.errors.endTime?.message
                ? t(formState.errors.endTime.message)
                : formState.errors.endTime
                  ? t('booking.periodError')
                  : undefined
        }
        actions={
          <Button
            type="submit"
            loading={busy}
            disabled={
              availability !== 'free' || availabilityQuery.isFetching || busy
            }
          >
            {authed ? t('booking.confirmBooking') : t('booking.continue')}
          </Button>
        }
      />
    </form>
  )
}

export default PeriodStep
