import { useTranslation } from 'react-i18next'

import { supportedLocales, type AppLocale } from '@/shared/config'
import { useUiStore, type TThemeMode } from '@/shared/model'
import {
  Badge,
  Button,
  ButtonText,
  Card,
  CardBody,
  Check,
  Field,
  Input,
  Note,
  Num,
  Segment,
  SegmentItem,
  Skeleton,
  Typography,
} from '@/shared/ui'

import styles from './HomePage.module.css'

/** Foundation smoke page: tokens, theme, and base UI from the design system. */
const HomePage = () => {
  const { t } = useTranslation()
  const locale = useUiStore((state) => state.locale)
  const theme = useUiStore((state) => state.theme)
  const setLocale = useUiStore((state) => state.setLocale)
  const setTheme = useUiStore((state) => state.setTheme)

  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <header className={styles.toolbar}>
          <div>
            <Typography variant="h1">{t('app.title')}</Typography>
            <Typography variant="lead" muted>
              {t('ds.lead')}
            </Typography>
          </div>
          <div className={styles.toolbarGroup}>
            <Typography variant="label">{t('ds.theme')}</Typography>
            <Segment aria-label={t('ds.theme')}>
              {(['day', 'night'] as const).map((mode: TThemeMode) => (
                <SegmentItem
                  key={mode}
                  pressed={theme === mode}
                  onClick={() => setTheme(mode)}
                >
                  {mode === 'day' ? t('ds.themeDay') : t('ds.themeNight')}
                </SegmentItem>
              ))}
            </Segment>
            <Typography variant="label">{t('ds.locale')}</Typography>
            <Segment aria-label={t('ds.locale')}>
              {supportedLocales.map((code: AppLocale) => (
                <SegmentItem
                  key={code}
                  pressed={locale === code}
                  onClick={() => setLocale(code)}
                >
                  {code}
                </SegmentItem>
              ))}
            </Segment>
          </div>
        </header>

        <Typography variant="h2">{t('ds.title')}</Typography>

        <section className={styles.section}>
          <Typography variant="h3">{t('ds.buttons')}</Typography>
          <div className={styles.row}>
            <Button>{t('ds.primary')}</Button>
            <Button variant="ghost">{t('ds.ghost')}</Button>
            <Button variant="danger">{t('ds.danger')}</Button>
            <Button loading>{t('ds.loading')}</Button>
            <Button disabled>{t('ds.disabled')}</Button>
            <ButtonText>{t('ds.textAction')}</ButtonText>
          </div>
        </section>

        <section className={styles.section}>
          <Typography variant="h3">{t('ds.fields')}</Typography>
          <div className={styles.fields}>
            <Field
              label={t('ds.nameLabel')}
              hint={t('ds.nameHint')}
              htmlFor="ds-name"
            >
              <Input id="ds-name" defaultValue="Анна" autoComplete="name" />
            </Field>
            <Field
              label={t('ds.emailLabel')}
              error={t('ds.emailError')}
              htmlFor="ds-email"
            >
              <Input
                id="ds-email"
                type="email"
                defaultValue="anna@"
                aria-invalid
                autoComplete="email"
              />
            </Field>
            <Check defaultChecked>{t('ds.checkLabel')}</Check>
          </div>
        </section>

        <section className={styles.section}>
          <Typography variant="h3">{t('ds.statuses')}</Typography>
          <div className={styles.row}>
            <Badge status="confirmed" icon="check">
              {t('ds.statusConfirmed')}
            </Badge>
            <Badge status="unpaid" icon="coin-empty">
              {t('ds.statusUnpaid')}
            </Badge>
            <Badge status="in_rent" icon="hourglass">
              {t('ds.statusInRent')}
            </Badge>
            <Badge status="paid" icon="coin">
              {t('ds.statusPaid')}
            </Badge>
          </div>
        </section>

        <section className={styles.section}>
          <Typography variant="h3">{t('ds.notes')}</Typography>
          <Note tone="peach" icon="cross" heading={t('ds.noteTitle')} alert>
            {t('ds.noteBody')}
          </Note>
          <Note tone="jade" icon="check">
            {t('ds.noteOk')}
          </Note>
        </section>

        <section className={styles.section}>
          <Typography variant="h3">{t('ds.cardTitle')}</Typography>
          <Card className={styles.cardDemo}>
            <CardBody>
              <Typography variant="h3">{t('ds.cardTitle')}</Typography>
              <Typography variant="small" muted>
                {t('ds.cardBody')}
              </Typography>
              <p>
                <Num>
                  <strong>{t('ds.price')}</strong>
                </Num>{' '}
                {t('ds.perHour')}
              </p>
            </CardBody>
          </Card>
          <Typography variant="small" muted>
            {t('ds.skeleton')}
          </Typography>
          <Skeleton className={styles.skeletonBox} />
        </section>
      </div>
    </main>
  )
}

export default HomePage
