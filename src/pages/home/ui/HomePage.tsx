import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { BookingResult, type IBooking } from '@/entities/booking'
import { DragonCard, type IDragonListItem } from '@/entities/dragon'
import { BookingContacts } from '@/features/booking-contacts'
import { SelectPeriod, type ISelectPeriodValue } from '@/features/select-period'
import { VerifyEmail } from '@/features/verify-email'
import { type AppLocale } from '@/shared/config'
import { useUiStore } from '@/shared/model'
import {
  Badge,
  Button,
  ButtonText,
  Check,
  DragonSprite,
  EmptyState,
  Field,
  Icon,
  Input,
  Link as TextLink,
  Note,
  OtpInput,
  Panel,
  Segment,
  SegmentItem,
  Select,
  Steps,
  Typography,
  type IStepsItem,
} from '@/shared/ui'
import fieldStyles from '@/shared/ui/field/Field.module.css'
import { DragonCatalog, DragonCatalogItem } from '@/widgets/dragon-catalog'
import { DragonPage } from '@/widgets/dragon-page'
import { Hero, type THeroSky } from '@/widgets/hero'
import { SiteFooter } from '@/widgets/site-footer'
import { SiteHeader } from '@/widgets/site-header'

import styles from './saytShowcase.module.css'

const DEMO_DRAGONS: IDragonListItem[] = [
  {
    id: 1,
    name: 'Чешуйка',
    shortDescription:
      'Спокойная, любит облака и чай с чабрецом. Подходит для первой поездки.',
    tileToken: 'var(--c-tile-mint)',
    spriteKey: 'mascot',
    hourlyRate: 120,
    currency: '₽',
    operationalStatus: 'ACTIVE',
  },
  {
    id: 2,
    name: 'Лун',
    shortDescription:
      'Гоняется за жемчужиной и приносит дождь. Летит плавно, без рывков.',
    tileToken: 'var(--c-tile-peach)',
    spriteKey: 'china',
    hourlyRate: 150,
    currency: '₽',
    operationalStatus: 'ACTIVE',
  },
  {
    id: 3,
    name: 'Горыныч',
    shortDescription:
      'Три головы и одно доброе сердце. Места хватит всей семье.',
    tileToken: 'var(--c-tile-moss)',
    spriteKey: 'gorynych',
    hourlyRate: 180,
    currency: '₽',
    operationalStatus: 'ACTIVE',
  },
]

const FAILED_DRAGON: IDragonListItem = {
  id: 4,
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

const LOADING_PERIOD: ISelectPeriodValue = {
  startDate: '2026-11-25',
  startTime: '10:00',
  endDate: '2026-11-25',
  endTime: '13:00',
}

const ERROR_PERIOD: ISelectPeriodValue = {
  startDate: '2026-11-25',
  startTime: '14:00',
  endDate: '2026-11-25',
  endTime: '13:00',
}

type TSkyChoice = '' | THeroSky

const JUMP = [
  ['s-hero', 'jumpHero'],
  ['s-knopki', 'jumpButtons'],
  ['s-polya', 'jumpFields'],
  ['s-statusy', 'jumpStatuses'],
  ['s-katalog', 'jumpCatalog'],
  ['s-drakon', 'jumpDragon'],
  ['s-kontakty', 'jumpContacts'],
  ['s-kod', 'jumpCode'],
  ['s-rezultat', 'jumpResult'],
  ['s-konflikt', 'jumpConflict'],
  ['s-pusto', 'jumpEmpty'],
  ['s-podval', 'jumpFooter'],
] as const

/** Vitrina #sayt parity page: same sections and samples as the landing showcase. */
const HomePage = () => {
  const { t } = useTranslation()
  const locale = useUiStore((state) => state.locale)
  const theme = useUiStore((state) => state.theme)
  const setLocale = useUiStore((state) => state.setLocale)
  const toggleTheme = useUiStore((state) => state.toggleTheme)

  const [sky, setSky] = useState<TSkyChoice>('')
  const [period, setPeriod] = useState(INITIAL_PERIOD)
  const [periodLoading, setPeriodLoading] = useState(LOADING_PERIOD)
  const [periodError, setPeriodError] = useState(ERROR_PERIOD)
  const [contacts, setContacts] = useState({
    name: 'Анна',
    email: 'anna@example.com',
  })
  const [contactsError, setContactsError] = useState({
    name: 'Анна',
    email: 'anna@',
  })
  const [otp, setOtp] = useState('4815')
  const [otpInvalid, setOtpInvalid] = useState('481500')
  const [otpDisabled, setOtpDisabled] = useState('481500')

  const showcaseLocales = [
    { code: 'ru', label: 'RU' },
    { code: 'en', label: 'EN' },
  ]

  const periodLabels = {
    start: t('sayt.periodStart'),
    end: t('sayt.periodEnd'),
    startDate: t('sayt.periodStartDate'),
    startTime: t('sayt.periodStartTime'),
    endDate: t('sayt.periodEndDate'),
    endTime: t('sayt.periodEndTime'),
  }

  const stepsPeriod: IStepsItem[] = [
    { id: 'period', label: t('sayt.stepPeriod'), status: 'current' },
    { id: 'contacts', label: t('sayt.stepContacts') },
    { id: 'code', label: t('sayt.stepCode') },
    { id: 'done', label: t('sayt.stepDone') },
  ]

  const stepsContacts: IStepsItem[] = [
    { id: 'period', label: t('sayt.stepPeriod'), status: 'done' },
    { id: 'contacts', label: t('sayt.stepContacts'), status: 'current' },
    { id: 'code', label: t('sayt.stepCode') },
    { id: 'done', label: t('sayt.stepDone') },
  ]

  const stepsCode: IStepsItem[] = [
    { id: 'period', label: t('sayt.stepPeriod'), status: 'done' },
    { id: 'contacts', label: t('sayt.stepContacts'), status: 'done' },
    { id: 'code', label: t('sayt.stepCode'), status: 'current' },
    { id: 'done', label: t('sayt.stepDone') },
  ]

  const digitLabel = (index: number) => t('sayt.otpDigit', { n: index })

  const headerChrome = {
    brand: t('app.title'),
    locale,
    locales: showcaseLocales,
    onLocaleChange: (code: string) => setLocale(code as AppLocale),
    theme,
    onThemeToggle: toggleTheme,
    themeLabel: theme === 'night' ? t('ds.themeDay') : t('ds.themeNight'),
    themeAriaLabel: t('ds.theme'),
  }

  return (
    <div className={styles.page}>
      <nav className={styles.jump} aria-label={t('sayt.jumpLabel')}>
        {JUMP.map(([id, key]) => (
          <a key={id} href={`#${id}`}>
            {t(`sayt.${key}`)}
          </a>
        ))}
      </nav>

      <main className={styles.main}>
        <div className={styles.intro}>
          <Typography variant="h1">{t('sayt.introTitle')}</Typography>
          <p>
            {t('sayt.introLead')}
            <span className={styles.code}>{t('sayt.introCss')}</span>
            {t('sayt.introMid')}
            <span className={styles.code}>{t('sayt.introDocs')}</span>
            {t('sayt.introEnd')}
          </p>
        </div>

        <section className={styles.sec}>
          <Typography as="h2" variant="h2" id="s-hero">
            {t('sayt.heroTitle')}
          </Typography>
          <p>{t('sayt.heroLead')}</p>
          <div className={styles.rowMid}>
            <span className={[styles.cap, styles.skyCap].join(' ')}>
              {t('sayt.skyLabel')}
            </span>
            <Segment className={styles.skySeg} aria-label={t('sayt.skyLabel')}>
              {(
                [
                  ['', 'skyByTheme'],
                  ['sunset', 'skySunset'],
                  ['night', 'skyNight'],
                  ['day', 'skyDay'],
                ] as const
              ).map(([value, key]) => (
                <SegmentItem
                  key={key}
                  pressed={sky === value}
                  onClick={() => setSky(value)}
                >
                  {t(`sayt.${key}`)}
                </SegmentItem>
              ))}
            </Segment>
          </div>
          <div className={styles.stageFlush} style={{ marginTop: 15 }}>
            <Hero
              brand={t('app.title')}
              brandHref="#s-hero"
              title={t('sayt.heroCopyTitle')}
              lead={t('sayt.heroCopyLead')}
              navItems={[{ href: '#s-katalog', label: t('sayt.navCatalog') }]}
              navAriaLabel={t('sayt.navPrimary')}
              locale={headerChrome.locale}
              locales={headerChrome.locales}
              onLocaleChange={headerChrome.onLocaleChange}
              localeAriaLabel={t('sayt.localeSample')}
              theme={headerChrome.theme}
              onThemeToggle={headerChrome.onThemeToggle}
              themeLabel={headerChrome.themeLabel}
              themeAriaLabel={headerChrome.themeAriaLabel}
              sky={sky || undefined}
              actions={
                <Button type="button" onClick={() => {
                  document.getElementById('s-katalog')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  })
                }}>
                  {t('sayt.heroCta')}
                </Button>
              }
            />
          </div>
          <h3 className={styles.sub}>{t('sayt.pageHeaderSub')}</h3>
          <div className={styles.stageFlushBare}>
            <SiteHeader
              brand={t('app.title')}
              brandHref="#s-hero"
              navItems={[
                {
                  href: '#s-katalog',
                  label: t('sayt.navCatalog'),
                  current: true,
                },
              ]}
              navAriaLabel={t('sayt.navPrimarySample')}
              locale={headerChrome.locale}
              locales={headerChrome.locales}
              onLocaleChange={headerChrome.onLocaleChange}
              localeAriaLabel={t('sayt.localeSampleAlt')}
              theme={headerChrome.theme}
              onThemeToggle={headerChrome.onThemeToggle}
              themeLabel={headerChrome.themeLabel}
              themeAriaLabel={headerChrome.themeAriaLabel}
            />
          </div>
        </section>

        <section className={styles.sec}>
          <Typography as="h2" variant="h2" id="s-knopki">
            {t('sayt.buttonsTitle')}
          </Typography>
          <p>{t('sayt.buttonsLead')}</p>
          <div className={styles.stageBg}>
            <div className={styles.row}>
              <div>
                <p className={styles.cap}>{t('sayt.capPrimary')}</p>
                <Button type="button">{t('sayt.btnPrimary')}</Button>
              </div>
              <div>
                <p className={styles.cap}>{t('sayt.capGhost')}</p>
                <Button type="button" variant="ghost">
                  {t('sayt.btnGhost')}
                </Button>
              </div>
              <div>
                <p className={styles.cap}>{t('sayt.capDanger')}</p>
                <Button type="button" variant="danger">
                  {t('sayt.btnDanger')}
                </Button>
              </div>
              <div>
                <p className={styles.cap}>{t('sayt.capText')}</p>
                <ButtonText type="button">
                  <Icon name="left" />
                  {t('sayt.btnText')}
                </ButtonText>
              </div>
            </div>
            <div className={[styles.row, styles.rowGap].join(' ')}>
              <div>
                <p className={styles.cap}>{t('sayt.capPressed')}</p>
                <Button type="button" pressed>
                  {t('sayt.btnPressed')}
                </Button>
              </div>
              <div>
                <p className={styles.cap}>{t('sayt.capLoading')}</p>
                <Button type="button" loading>
                  {t('sayt.btnLoading')}
                </Button>
              </div>
              <div>
                <p className={styles.cap}>{t('sayt.capDisabled')}</p>
                <Button type="button" disabled>
                  {t('sayt.btnDisabled')}
                </Button>
              </div>
              <div>
                <p className={styles.cap}>{t('sayt.capSm')}</p>
                <Button type="button" size="sm">
                  {t('sayt.btnSm')}
                </Button>
              </div>
              <div>
                <p className={styles.cap}>{t('sayt.capIcon')}</p>
                <Button
                  type="button"
                  variant="ghost"
                  iconOnly
                  aria-label={t('sayt.btnClose')}
                >
                  <Icon name="cross" />
                </Button>
              </div>
            </div>
            <div className={styles.blockWide}>
              <p className={styles.cap}>{t('sayt.capBlock')}</p>
              <Button type="button" block>
                {t('sayt.btnBlock')}
              </Button>
            </div>
          </div>
        </section>

        <section className={styles.sec}>
          <Typography as="h2" variant="h2" id="s-polya">
            {t('sayt.fieldsTitle')}
          </Typography>
          <p>{t('sayt.fieldsLead')}</p>
          <div className={styles.stageBg}>
            <div className={styles.grid}>
              <Field label={t('sayt.fieldName')} htmlFor="sayt-name">
                <Input
                  id="sayt-name"
                  type="text"
                  placeholder={t('sayt.fieldNamePh')}
                  autoComplete="off"
                />
              </Field>
              <Field label={t('sayt.fieldNameFilled')} htmlFor="sayt-name-filled">
                <Input
                  id="sayt-name-filled"
                  type="text"
                  defaultValue="Анна"
                  autoComplete="off"
                />
              </Field>
              <Field
                label={t('sayt.fieldEmailErr')}
                htmlFor="sayt-email-err"
                error={t('ds.emailError')}
                errorId="sayt-email-err-t"
              >
                <Input
                  id="sayt-email-err"
                  type="email"
                  defaultValue="anna@"
                  aria-invalid
                  aria-describedby="sayt-email-err-t"
                  autoComplete="off"
                />
              </Field>
              <Field
                label={t('sayt.fieldEmailHint')}
                htmlFor="sayt-email-hint"
                hint={t('sayt.fieldEmailHintText')}
                hintId="sayt-email-hint-t"
              >
                <Input
                  id="sayt-email-hint"
                  type="email"
                  placeholder={t('sayt.fieldEmailPh')}
                  aria-describedby="sayt-email-hint-t"
                  autoComplete="off"
                />
              </Field>
              <Field label={t('sayt.fieldDisabled')} htmlFor="sayt-disabled">
                <Input
                  id="sayt-disabled"
                  type="text"
                  defaultValue="Чешуйка"
                  disabled
                />
              </Field>
              <Field label={t('sayt.fieldSelect')} htmlFor="sayt-select">
                <Select id="sayt-select" defaultValue="Чешуйка">
                  <option>Чешуйка</option>
                  <option>Лун</option>
                  <option>Рю</option>
                </Select>
              </Field>
              <Field label={t('sayt.fieldDate')} htmlFor="sayt-date">
                <Input
                  id="sayt-date"
                  type="date"
                  defaultValue="2026-11-25"
                />
              </Field>
              <Field label={t('sayt.fieldTime')} htmlFor="sayt-time">
                <Input id="sayt-time" type="time" defaultValue="10:00" />
              </Field>
              <div className={styles.stack}>
                <Check defaultChecked>{t('sayt.checkOn')}</Check>
                <Check>{t('sayt.checkOff')}</Check>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.sec}>
          <Typography as="h2" variant="h2" id="s-statusy">
            {t('sayt.statusesTitle')}
          </Typography>
          <p>{t('sayt.statusesLead')}</p>
          <div className={styles.stageBg}>
            <div className={styles.row}>
              <Badge status="confirmed" icon="check">
                {t('ds.statusConfirmed')}
              </Badge>
              <Badge status="unpaid" icon="coin-empty">
                {t('ds.statusUnpaid')}
              </Badge>
              <Badge status="paid" icon="coin">
                {t('ds.statusPaid')}
              </Badge>
            </div>
          </div>
        </section>

        <section className={styles.sec}>
          <Typography as="h2" variant="h2" id="s-katalog">
            {t('sayt.catalogTitle')}
          </Typography>
          <p>{t('sayt.catalogLead')}</p>
          <DragonCatalog
            className={styles.catalogWrap}
            aria-label={t('sayt.catalogTitle')}
          >
            {DEMO_DRAGONS.map((dragon) => (
              <DragonCatalogItem key={dragon.id}>
                <DragonCard
                  dragon={{
                    ...dragon,
                    name:
                      dragon.id === 1
                        ? t('sayt.dragonCheshuika')
                        : dragon.id === 2
                          ? t('sayt.dragonLun')
                          : t('sayt.dragonGorynych'),
                    shortDescription:
                      dragon.id === 1
                        ? t('sayt.dragonCheshuikaAbout')
                        : dragon.id === 2
                          ? t('sayt.dragonLunAbout')
                          : t('sayt.dragonGorynychAbout'),
                  }}
                  href="#s-drakon"
                  actionHref="#s-drakon"
                  priceLabel={t('ds.perHour')}
                  actionLabel={t('sayt.book')}
                  picture={
                    dragon.spriteKey === 'mascot' ? (
                      <DragonSprite
                        name="mascot"
                        label={t('sayt.dragonCheshuika')}
                      />
                    ) : undefined
                  }
                />
              </DragonCatalogItem>
            ))}
            <DragonCatalogItem>
              <DragonCard
                dragon={{
                  ...FAILED_DRAGON,
                  name: t('sayt.dragonRyu'),
                  shortDescription: t('sayt.dragonRyuAbout'),
                }}
                href="#s-drakon"
                actionHref="#s-drakon"
                imageFailed
                priceLabel={t('ds.perHour')}
                actionLabel={t('sayt.book')}
              />
            </DragonCatalogItem>
            <DragonCatalogItem>
              <DragonCard
                loading
                loadingLabel={t('sayt.cardLoading')}
                priceLabel={t('ds.perHour')}
                actionLabel={t('sayt.book')}
              />
            </DragonCatalogItem>
          </DragonCatalog>
        </section>

        <section className={styles.sec}>
          <Typography as="h2" variant="h2" id="s-drakon">
            {t('sayt.dragonTitle')}
          </Typography>
          <p>{t('sayt.dragonLead')}</p>
          <div className={styles.dpageWrap}>
            <DragonPage
              back={
                <ButtonText type="button" onClick={() => {
                  document.getElementById('s-katalog')?.scrollIntoView()
                }}>
                  <Icon name="left" />
                  {t('sayt.backCatalog')}
                </ButtonText>
              }
              picture={
                <DragonSprite
                  name="mascot"
                  mascotSize="lg"
                  label={t('sayt.dragonCheshuika')}
                />
              }
              pictureTile="var(--c-tile-mint)"
              name={t('sayt.dragonCheshuika')}
              about={t('sayt.dragonCheshuikaFull')}
              rateAmount="120 ₽"
              rateUnit={t('ds.perHour')}
              rateHint={t('sayt.rateHint')}
            >
              <Panel>
                <Steps
                  items={stepsPeriod}
                  aria-label={t('sayt.stepsBooking')}
                />
                <Typography variant="h2">{t('sayt.whenFly')}</Typography>
                <SelectPeriod
                  value={period}
                  onChange={setPeriod}
                  labels={periodLabels}
                  availability="free"
                  availabilityText={t('sayt.periodFree')}
                  quoteDetail={t('sayt.quoteDetail')}
                  quoteTotal={t('sayt.quoteTotal')}
                  quoteHint={t('sayt.periodHint')}
                  actions={
                    <Button type="button">{t('sayt.continue')}</Button>
                  }
                />
              </Panel>
            </DragonPage>
          </div>

          <h3 className={styles.sub}>{t('sayt.periodStates')}</h3>
          <div className={styles.gridWide}>
            <Panel>
              <p className={styles.cap}>{t('sayt.periodCheckingCap')}</p>
              <SelectPeriod
                value={periodLoading}
                onChange={setPeriodLoading}
                labels={periodLabels}
                availability="loading"
                availabilityText={t('sayt.periodChecking')}
                actions={
                  <Button type="button" disabled>
                    {t('sayt.continue')}
                  </Button>
                }
              />
            </Panel>
            <Panel>
              <p className={styles.cap}>{t('sayt.periodErrorCap')}</p>
              <SelectPeriod
                value={periodError}
                onChange={setPeriodError}
                labels={periodLabels}
                error
                errorMessage={t('sayt.periodError')}
                actions={
                  <Button type="button" disabled>
                    {t('sayt.continue')}
                  </Button>
                }
              />
            </Panel>
          </div>
        </section>

        <section className={styles.sec}>
          <Typography as="h2" variant="h2" id="s-kontakty">
            {t('sayt.contactsTitle')}
          </Typography>
          <p>{t('sayt.contactsLead')}</p>
          <div className={styles.gridWide}>
            <Panel>
              <Steps
                items={stepsContacts}
                aria-label={t('sayt.stepsBooking2')}
              />
              <Typography variant="h2">{t('sayt.contactsHeading')}</Typography>
              <BookingContacts
                value={contacts}
                onChange={setContacts}
                labels={{
                  name: t('ds.nameLabel'),
                  email: t('ds.emailLabel'),
                }}
                hints={{ email: t('sayt.emailHint') }}
                actions={
                  <>
                    <Button type="submit">{t('sayt.sendCode')}</Button>
                    <ButtonText type="button">{t('sayt.back')}</ButtonText>
                  </>
                }
                onSubmit={(event) => event.preventDefault()}
              />
            </Panel>
            <Panel>
              <p className={styles.cap}>{t('sayt.sendFailedCap')}</p>
              <BookingContacts
                value={contactsError}
                onChange={setContactsError}
                alert={
                  <Note
                    tone="peach"
                    icon="cross"
                    heading={t('sayt.sendFailedTitle')}
                    alert
                  >
                    {t('sayt.sendFailedBody')}
                  </Note>
                }
                labels={{
                  name: t('ds.nameLabel'),
                  email: t('ds.emailLabel'),
                }}
                errors={{ email: t('ds.emailError') }}
                actions={
                  <>
                    <Button type="submit">{t('sayt.sendCode')}</Button>
                    <ButtonText type="button">{t('sayt.back')}</ButtonText>
                  </>
                }
                onSubmit={(event) => event.preventDefault()}
              />
            </Panel>
          </div>
        </section>

        <section className={styles.sec}>
          <Typography as="h2" variant="h2" id="s-kod">
            {t('sayt.otpTitle')}
          </Typography>
          <p>{t('sayt.otpLead')}</p>
          <div className={styles.gridWide}>
            <Panel>
              <Steps items={stepsCode} aria-label={t('sayt.stepsBooking3')} />
              <Typography variant="h2">{t('sayt.otpHeading')}</Typography>
              <p className={styles.leadLine}>
                {t('sayt.otpSentTo', { email: 'anna@example.com' })}{' '}
                <TextLink to="#s-kontakty">{t('sayt.changeEmail')}</TextLink>
              </p>
              <VerifyEmail
                code={otp}
                onCodeChange={setOtp}
                codeLabel={t('sayt.otpLabel')}
                digitLabel={digitLabel}
                resendLabel={t('sayt.otpResend')}
                resendWaitingLabel={t('sayt.otpResendWait')}
                resendSecondsLeft={42}
                onResend={() => undefined}
                submitLabel={t('sayt.otpSubmit')}
                submitDisabled
                onSubmit={(event) => event.preventDefault()}
              />
            </Panel>
            <div className={styles.stack}>
              <Panel>
                <p className={styles.cap}>{t('sayt.otpInvalidCap')}</p>
                <OtpInput
                  value={otpInvalid}
                  onChange={setOtpInvalid}
                  invalid
                  aria-label={t('sayt.otpLabel')}
                  aria-describedby="sayt-otp-err"
                  digitLabel={digitLabel}
                />
                <p className={fieldStyles.error} role="alert" id="sayt-otp-err">
                  <Icon name="cross" className={fieldStyles.errorIcon} />
                  <span>{t('sayt.otpInvalid')}</span>
                </p>
              </Panel>
              <Panel>
                <p className={styles.cap}>{t('sayt.otpExhaustedCap')}</p>
                <OtpInput
                  value={otpDisabled}
                  onChange={setOtpDisabled}
                  disabled
                  aria-label={t('sayt.otpLabel')}
                  digitLabel={digitLabel}
                />
                <Note
                  tone="butter"
                  icon="warn"
                  actions={
                    <ButtonText type="button">
                      {t('sayt.otpResendAgain')}
                    </ButtonText>
                  }
                >
                  {t('sayt.otpExhaustedBody')}
                </Note>
              </Panel>
            </div>
          </div>
        </section>

        <section className={styles.sec}>
          <Typography as="h2" variant="h2" id="s-rezultat">
            {t('sayt.resultTitle')}
          </Typography>
          <p>{t('sayt.resultLead')}</p>
          <BookingResult
            booking={DEMO_BOOKING}
            title={t('sayt.resultHeading')}
            picture={
              <DragonSprite name="mascot" label={t('sayt.mascotLabel')} />
            }
            factLabels={{
              dragon: t('sayt.factDragon'),
              period: t('sayt.factPeriod'),
              total: t('sayt.factTotal'),
              payment: t('sayt.factPayment'),
            }}
            statusLabels={{
              booking: t('ds.statusConfirmed'),
              payment: t('ds.statusUnpaid'),
            }}
            periodText={t('sayt.demoPeriod')}
            totalText={t('sayt.demoTotal')}
            paymentText={t('sayt.demoPayment')}
            paymentHint={t('sayt.demoPayment')}
            emailHint={t('sayt.emailSent')}
            actions={
              <Button variant="ghost" type="button">
                {t('sayt.toCatalog')}
              </Button>
            }
          />
        </section>

        <section className={styles.sec}>
          <Typography as="h2" variant="h2" id="s-konflikt">
            {t('sayt.conflictTitle')}
          </Typography>
          <p>{t('sayt.conflictLead')}</p>
          <div className={[styles.stageBg, styles.narrow].join(' ')}>
            <Note
              tone="peach"
              icon="cross"
              heading={t('ds.noteTitle')}
              alert
              actions={
                <>
                  <ButtonText type="button">{t('ds.textAction')}</ButtonText>
                  <ButtonText type="button">{t('sayt.otherDragon')}</ButtonText>
                </>
              }
            >
              {t('ds.noteBody')}
            </Note>
          </div>
          <h3 className={styles.sub}>{t('sayt.otherNotes')}</h3>
          <div
            className={[styles.stageBg, styles.narrow, styles.stack].join(' ')}
          >
            <Note tone="jade" icon="check">
              {t('sayt.noteOk')}
            </Note>
            <Note tone="sky" icon="info">
              {t('sayt.noteInfo')}
            </Note>
            <Note tone="butter" icon="warn">
              {t('sayt.noteWarn')}
            </Note>
          </div>
        </section>

        <section className={styles.sec}>
          <Typography as="h2" variant="h2" id="s-pusto">
            {t('sayt.emptyTitle')}
          </Typography>
          <p>{t('sayt.emptyLead')}</p>
          <div className={styles.grid} style={{ marginTop: 24 }}>
            <EmptyState
              picture={<Icon name="egg" xl />}
              heading={
                <Typography variant="h3">
                  {t('sayt.emptyCatalogTitle')}
                </Typography>
              }
            >
              {t('sayt.emptyCatalogBody')}
            </EmptyState>
            <EmptyState
              picture={<Icon name="warn" xl />}
              pictureStyle={{ background: 'var(--c-tile-peach)' }}
              heading={
                <Typography variant="h3">
                  {t('sayt.emptyErrorTitle')}
                </Typography>
              }
              action={
                <Button type="button" variant="ghost">
                  {t('sayt.emptyRefresh')}
                </Button>
              }
            >
              {t('sayt.emptyErrorBody')}
            </EmptyState>
            <EmptyState
              pictureBare
              picture={<DragonSprite name="loader" />}
              role="status"
              heading={
                <Typography variant="h3">
                  {t('sayt.emptyLoadingTitle')}
                </Typography>
              }
            >
              {t('sayt.emptyLoadingBody')}
            </EmptyState>
            <EmptyState
              picture={<Icon name="cloud" xl />}
              pictureStyle={{ background: 'var(--c-tile-sky)' }}
              heading={
                <Typography variant="h3">{t('sayt.empty404Title')}</Typography>
              }
              action={
                <Button type="button">{t('sayt.toCatalog')}</Button>
              }
            >
              {t('sayt.empty404Body')}
            </EmptyState>
          </div>
        </section>

        <section className={styles.sec}>
          <Typography as="h2" variant="h2" id="s-podval">
            {t('sayt.footerTitle')}
          </Typography>
          <p>{t('sayt.footerLead')}</p>
          <div className={styles.footerStage}>
            <SiteFooter
              className={styles.footerFlush}
              brand={t('app.title')}
              brandHref="#s-hero"
              navItems={[{ href: '#s-katalog', label: t('sayt.navCatalog') }]}
              navAriaLabel={t('sayt.navFooter')}
              locale={headerChrome.locale}
              locales={headerChrome.locales}
              onLocaleChange={headerChrome.onLocaleChange}
              localeAriaLabel={t('sayt.localeFooter')}
              credits={t('sayt.credits')}
            />
          </div>
        </section>
      </main>
    </div>
  )
}

export default HomePage
