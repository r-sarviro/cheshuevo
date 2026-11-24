import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { BookingResult, type IBooking } from '@/entities/booking'
import { DragonCard, type IDragonListItem } from '@/entities/dragon'
import { BookingContacts } from '@/features/booking-contacts'
import { SelectPeriod, type ISelectPeriodValue } from '@/features/select-period'
import { VerifyEmail } from '@/features/verify-email'
import { supportedLocales, type AppLocale } from '@/shared/config'
import { useUiStore } from '@/shared/model'
import {
  Button,
  ButtonText,
  Icon,
  Note,
  Panel,
  Section,
  SectionHead,
  Steps,
  Typography,
  Wrap,
  type IStepsItem,
} from '@/shared/ui'
import { EmptyState } from '@/shared/ui/empty-state'
import { Link as TextLink } from '@/shared/ui/link'
import { DragonCatalog, DragonCatalogItem } from '@/widgets/dragon-catalog'
import { SiteFooter } from '@/widgets/site-footer'
import { SiteHeader } from '@/widgets/site-header'

import styles from './HomePage.module.css'

const DEMO_DRAGONS: IDragonListItem[] = [
  {
    id: 1,
    name: 'Чешуйка',
    shortDescription: 'Спокойная, любит облака и чай с чабрецом.',
    tileToken: 'var(--c-tile-mint)',
    hourlyRate: 120,
    currency: '₽',
    operationalStatus: 'ACTIVE',
  },
  {
    id: 2,
    name: 'Лун',
    shortDescription: 'Любит вечерние полёты над рекой.',
    tileToken: 'var(--c-tile-peach)',
    hourlyRate: 180,
    currency: '₽',
    operationalStatus: 'ACTIVE',
  },
]

const FAILED_DRAGON: IDragonListItem = {
  id: 3,
  name: 'Рю',
  shortDescription:
    'Картинка не загрузилась: вместо неё яйцо на спокойной плитке.',
  tileToken: 'var(--c-tile-mint)',
  hourlyRate: 140,
  currency: '₽',
  operationalStatus: 'ACTIVE',
}

const DEMO_BOOKING: IBooking = {
  bookingNumber: 'DR-001025',
  status: 'CONFIRMED',
  paymentStatus: 'UNPAID',
  totalAmount: 360,
  currency: '₽',
  startsAt: '2026-11-25T10:00:00+03:00',
  endsAt: '2026-11-25T12:15:00+03:00',
  billableHours: 3,
  dragonName: 'Чешуйка',
}

const INITIAL_PERIOD: ISelectPeriodValue = {
  startDate: '2026-11-25',
  startTime: '10:00',
  endDate: '2026-11-25',
  endTime: '12:15',
}

const ERROR_PERIOD: ISelectPeriodValue = {
  startDate: '2026-11-25',
  startTime: '12:00',
  endDate: '2026-11-25',
  endTime: '10:00',
}

/** Smoke page mirroring vitrina #sayt samples (no hero/sprites). */
const HomePage = () => {
  const { t } = useTranslation()
  const locale = useUiStore((state) => state.locale)
  const theme = useUiStore((state) => state.theme)
  const setLocale = useUiStore((state) => state.setLocale)
  const toggleTheme = useUiStore((state) => state.toggleTheme)

  const [period, setPeriod] = useState(INITIAL_PERIOD)
  const [periodLoading, setPeriodLoading] = useState(INITIAL_PERIOD)
  const [periodError, setPeriodError] = useState(ERROR_PERIOD)
  const [contacts, setContacts] = useState({
    name: 'Анна',
    email: 'anna@example.com',
  })
  const [contactsError, setContactsError] = useState({
    name: 'Анна',
    email: 'anna@',
  })
  const [otp, setOtp] = useState('480010')
  const [otpInvalid, setOtpInvalid] = useState('480011')
  const [otpDisabled, setOtpDisabled] = useState('')

  const locales = supportedLocales.map((code: AppLocale) => ({
    code,
    label: code,
  }))

  const stepsContacts: IStepsItem[] = [
    { id: 'period', label: t('blocks.stepPeriod'), status: 'done' },
    { id: 'contacts', label: t('blocks.stepContacts'), status: 'current' },
    { id: 'code', label: t('blocks.stepCode') },
    { id: 'done', label: t('blocks.stepDone') },
  ]

  const stepsCode: IStepsItem[] = [
    { id: 'period', label: t('blocks.stepPeriod'), status: 'done' },
    { id: 'contacts', label: t('blocks.stepContacts'), status: 'done' },
    { id: 'code', label: t('blocks.stepCode'), status: 'current' },
    { id: 'done', label: t('blocks.stepDone') },
  ]

  const digitLabel = (index: number) => t('blocks.otpDigit', { n: index })

  return (
    <div className={styles.page}>
      <SiteHeader
        brand={t('app.title')}
        navItems={[{ href: '/', label: t('blocks.navCatalog'), current: true }]}
        navAriaLabel={t('blocks.navPrimary')}
        locale={locale}
        locales={locales}
        onLocaleChange={(code) => setLocale(code as AppLocale)}
        localeAriaLabel={t('ds.locale')}
        theme={theme}
        onThemeToggle={toggleTheme}
        themeLabel={theme === 'night' ? t('ds.themeDay') : t('ds.themeNight')}
        themeAriaLabel={t('ds.theme')}
      />

      <main className={styles.main}>
        <Wrap className={styles.stack}>
          <SectionHead>
            <Typography variant="h1">{t('blocks.title')}</Typography>
            <Typography variant="lead" muted>
              {t('blocks.lead')}
            </Typography>
          </SectionHead>

          <Section>
            <Typography variant="h2">{t('blocks.catalog')}</Typography>
            <DragonCatalog aria-label={t('blocks.catalog')}>
              {DEMO_DRAGONS.map((dragon) => (
                <DragonCatalogItem key={dragon.id}>
                  <DragonCard
                    dragon={dragon}
                    href="/"
                    actionHref="/"
                    priceLabel={t('ds.perHour')}
                    actionLabel={t('blocks.book')}
                    picture={
                      <span className={styles.picPlaceholder}>
                        <Icon name="dragon" xl />
                      </span>
                    }
                  />
                </DragonCatalogItem>
              ))}
              <DragonCatalogItem>
                <DragonCard
                  dragon={FAILED_DRAGON}
                  href="/"
                  actionHref="/"
                  imageFailed
                  priceLabel={t('ds.perHour')}
                  actionLabel={t('blocks.book')}
                />
              </DragonCatalogItem>
              <DragonCatalogItem>
                <DragonCard
                  className={styles.cardDemo}
                  loading
                  loadingLabel={t('blocks.cardLoading')}
                  priceLabel={t('ds.perHour')}
                  actionLabel={t('blocks.book')}
                />
              </DragonCatalogItem>
            </DragonCatalog>
          </Section>

          <Section>
            <Typography variant="h2">{t('blocks.period')}</Typography>
            <div className={styles.samples}>
              <Panel>
                <SelectPeriod
                  value={period}
                  onChange={setPeriod}
                  labels={{
                    start: t('blocks.periodStart'),
                    end: t('blocks.periodEnd'),
                    startDate: t('blocks.periodStartDate'),
                    startTime: t('blocks.periodStartTime'),
                    endDate: t('blocks.periodEndDate'),
                    endTime: t('blocks.periodEndTime'),
                  }}
                  availability="free"
                  availabilityText={t('blocks.periodFree')}
                  quoteDetail={t('blocks.quoteDetail')}
                  quoteTotal={t('blocks.quoteTotal')}
                  quoteHint={t('blocks.periodHint')}
                  actions={<Button type="button">{t('blocks.continue')}</Button>}
                />
              </Panel>
              <Panel>
                <p className={styles.cap}>{t('blocks.periodCheckingCap')}</p>
                <SelectPeriod
                  value={periodLoading}
                  onChange={setPeriodLoading}
                  labels={{
                    start: t('blocks.periodStart'),
                    end: t('blocks.periodEnd'),
                    startDate: t('blocks.periodStartDate'),
                    startTime: t('blocks.periodStartTime'),
                    endDate: t('blocks.periodEndDate'),
                    endTime: t('blocks.periodEndTime'),
                  }}
                  availability="loading"
                  availabilityText={t('blocks.periodChecking')}
                  actions={
                    <Button type="button" disabled>
                      {t('blocks.continue')}
                    </Button>
                  }
                />
              </Panel>
              <Panel>
                <p className={styles.cap}>{t('blocks.periodErrorCap')}</p>
                <SelectPeriod
                  value={periodError}
                  onChange={setPeriodError}
                  labels={{
                    start: t('blocks.periodStart'),
                    end: t('blocks.periodEnd'),
                    startDate: t('blocks.periodStartDate'),
                    startTime: t('blocks.periodStartTime'),
                    endDate: t('blocks.periodEndDate'),
                    endTime: t('blocks.periodEndTime'),
                  }}
                  error
                  errorMessage={t('blocks.periodError')}
                  actions={
                    <Button type="button" disabled>
                      {t('blocks.continue')}
                    </Button>
                  }
                />
              </Panel>
            </div>
          </Section>

          <Section>
            <Typography variant="h2">{t('blocks.contacts')}</Typography>
            <div className={styles.samples}>
              <Panel>
                <Steps
                  items={stepsContacts}
                  aria-label={t('blocks.stepsLabel', { n: 2 })}
                />
                <Typography variant="h2">{t('blocks.contactsTitle')}</Typography>
                <BookingContacts
                  value={contacts}
                  onChange={setContacts}
                  labels={{
                    name: t('ds.nameLabel'),
                    email: t('ds.emailLabel'),
                  }}
                  hints={{
                    email: t('blocks.emailHint'),
                  }}
                  actions={
                    <>
                      <Button type="submit">{t('blocks.sendCode')}</Button>
                      <ButtonText type="button">{t('blocks.back')}</ButtonText>
                    </>
                  }
                  onSubmit={(event) => event.preventDefault()}
                />
              </Panel>
              <Panel>
                <p className={styles.cap}>{t('blocks.sendFailedCap')}</p>
                <BookingContacts
                  value={contactsError}
                  onChange={setContactsError}
                  alert={
                    <Note tone="peach" icon="cross" heading={t('blocks.sendFailedTitle')} alert>
                      {t('blocks.sendFailedBody')}
                    </Note>
                  }
                  labels={{
                    name: t('ds.nameLabel'),
                    email: t('ds.emailLabel'),
                  }}
                  errors={{
                    email: t('ds.emailError'),
                  }}
                  actions={
                    <>
                      <Button type="submit">{t('blocks.sendCode')}</Button>
                      <ButtonText type="button">{t('blocks.back')}</ButtonText>
                    </>
                  }
                  onSubmit={(event) => event.preventDefault()}
                />
              </Panel>
            </div>
          </Section>

          <Section>
            <Typography variant="h2">{t('blocks.otp')}</Typography>
            <div className={styles.samples}>
              <Panel>
                <Steps
                  items={stepsCode}
                  aria-label={t('blocks.stepsLabel', { n: 3 })}
                />
                <Typography variant="h2">{t('blocks.otpTitle')}</Typography>
                <p className={styles.leadLine}>
                  {t('blocks.otpSentTo', { email: 'anna@example.com' })}{' '}
                  <TextLink to="/">{t('blocks.changeEmail')}</TextLink>
                </p>
                <VerifyEmail
                  code={otp}
                  onCodeChange={setOtp}
                  codeLabel={t('blocks.otpLabel')}
                  digitLabel={digitLabel}
                  resendLabel={t('blocks.otpResend')}
                  resendWaitingLabel={t('blocks.otpResendWait')}
                  resendSecondsLeft={42}
                  onResend={() => undefined}
                  submitLabel={t('blocks.otpSubmit')}
                  submitDisabled
                  onSubmit={(event) => event.preventDefault()}
                />
              </Panel>
              <Panel>
                <p className={styles.cap}>{t('blocks.otpInvalidCap')}</p>
                <VerifyEmail
                  code={otpInvalid}
                  onCodeChange={setOtpInvalid}
                  codeLabel={t('blocks.otpLabel')}
                  digitLabel={digitLabel}
                  error={t('blocks.otpInvalid')}
                  resendLabel={t('blocks.otpResend')}
                  resendWaitingLabel={t('blocks.otpResendWait')}
                  resendSecondsLeft={0}
                  onResend={() => undefined}
                  submitLabel={t('blocks.otpSubmit')}
                  onSubmit={(event) => event.preventDefault()}
                />
              </Panel>
              <Panel>
                <p className={styles.cap}>{t('blocks.otpExhaustedCap')}</p>
                <VerifyEmail
                  code={otpDisabled}
                  onCodeChange={setOtpDisabled}
                  codeLabel={t('blocks.otpLabel')}
                  digitLabel={digitLabel}
                  disabled
                  resendLabel={t('blocks.otpResend')}
                  resendDisabled
                  submitLabel={t('blocks.otpSubmit')}
                  submitDisabled
                  onSubmit={(event) => event.preventDefault()}
                />
                <Note
                  tone="butter"
                  icon="cross"
                  heading={t('blocks.otpExhaustedTitle')}
                  alert
                  actions={
                    <ButtonText type="button">{t('blocks.changeEmail')}</ButtonText>
                  }
                >
                  {t('blocks.otpExhaustedBody')}
                </Note>
              </Panel>
            </div>
          </Section>

          <Section>
            <Typography variant="h2">{t('blocks.result')}</Typography>
            <BookingResult
              booking={DEMO_BOOKING}
              title={t('blocks.resultTitle')}
              picture={
                <span className={styles.picPlaceholder}>
                  <Icon name="dragon" />
                </span>
              }
              factLabels={{
                dragon: t('blocks.factDragon'),
                period: t('blocks.factPeriod'),
                total: t('blocks.factTotal'),
                payment: t('blocks.factPayment'),
              }}
              statusLabels={{
                booking: t('ds.statusConfirmed'),
                payment: t('ds.statusUnpaid'),
              }}
              periodText={t('blocks.demoPeriod')}
              totalText={t('blocks.demoTotal')}
              paymentText={t('blocks.demoPayment')}
              paymentHint={t('blocks.paymentHint')}
              emailHint={t('blocks.emailSent')}
              actions={
                <Button variant="ghost" type="button">
                  {t('blocks.toCatalog')}
                </Button>
              }
            />
          </Section>

          <Section>
            <Typography variant="h2">{t('blocks.notes')}</Typography>
            <div className={styles.samples}>
              <Note
                tone="peach"
                icon="cross"
                heading={t('ds.noteTitle')}
                alert
                actions={
                  <>
                    <ButtonText type="button">{t('ds.textAction')}</ButtonText>
                    <ButtonText type="button">
                      {t('blocks.otherDragon')}
                    </ButtonText>
                  </>
                }
              >
                {t('ds.noteBody')}
              </Note>
              <EmptyState
                picture={<Icon name="egg" xl />}
                heading={
                  <Typography variant="h3">{t('blocks.emptyTitle')}</Typography>
                }
              >
                {t('blocks.emptyBody')}
              </EmptyState>
              <EmptyState
                picture={<Icon name="cross" xl />}
                pictureStyle={{ background: 'var(--c-tile-peach)' }}
                heading={
                  <Typography variant="h3">{t('blocks.emptyErrorTitle')}</Typography>
                }
                action={<Button type="button">{t('blocks.emptyRefresh')}</Button>}
              >
                {t('blocks.emptyErrorBody')}
              </EmptyState>
            </div>
          </Section>
        </Wrap>
      </main>

      <SiteFooter
        brand={t('app.title')}
        navItems={[{ href: '/', label: t('blocks.navCatalog') }]}
        navAriaLabel={t('blocks.navFooter')}
        locale={locale}
        locales={locales}
        onLocaleChange={(code) => setLocale(code as AppLocale)}
        localeAriaLabel={t('ds.locale')}
        credits={t('blocks.credits')}
      />
    </div>
  )
}

export default HomePage
